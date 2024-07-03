/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ReleaseVersion, VersionBumpType } from "@fluid-tools/version-tools";
import { Logger, Package } from "@fluidframework/build-tools";
import { existsSync, readFileSync, writeFileSync } from "fs";
import matter from "gray-matter";

// eslint-disable-next-line node/no-missing-import
import type { Parent, Root, Paragraph, Heading, List, Text, Content } from "mdast";
// eslint-disable-next-line node/no-missing-import
import type { Node } from "unist";
import type { Plugin } from "unified";

import { Repository } from "./git";

// IMPORTANT: TypeScript changes imports to require when outputting CJS, which causes dynamic import to fail. This hack
// creates a function dynamically that's invisible to TypeScript, so the import statements stay in the output JS.
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const dynamicImport = new Function("specifier", "return import(specifier)");

let mdast;
let mdastAssert;
let mdastAssertParent;
let mdastFromMarkdown;
let mdastToMarkdown;
let compact;
let visit;
let visitParents;

let select;
let matches;
let selectAll;

let root;
let paragraph;
let text;
let heading;
let list;
let listItem;
let brk;

let remark;
let remarkFrontmatter;
let remarkGfm;
let remarkGitHub;
let remarkNormalizeHeadings;
let remarkParse;
let remarkRemoveComments;
let remarkStringify;
let remarkToc;
let unified;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
	// ESM-only libraries require dynamic import
	/* eslint-disable unicorn/no-await-expression-member */
	// mdast = (await dynamicImport("mdast")).default;
	compact = (await dynamicImport("mdast-util-compact")).compact;

	const assertLib = await dynamicImport("mdast-util-assert");
	mdastAssert = assertLib.assert;
	mdastAssertParent = assertLib.parent;

	visit = (await dynamicImport("unist-util-visit")).visit;
	visitParents = (await dynamicImport("unist-util-visit-parents")).visitParents;

	const unistSelect = await dynamicImport("unist-util-select");
	select = unistSelect.select;
	selectAll = unistSelect.selectAll;
	matches = unistSelect.matches;

	const builder = await dynamicImport("mdast-builder");
	root = builder.root;
	paragraph = builder.paragraph;
	text = builder.text;
	heading = builder.heading;
	brk = builder.brk;

	mdastFromMarkdown = (await dynamicImport("mdast-util-from-markdown")).fromMarkdown;
	mdastToMarkdown = (await dynamicImport("mdast-util-to-markdown")).toMarkdown;
	remark = (await dynamicImport("remark")).remark;
	remarkFrontmatter = (await dynamicImport("remark-frontmatter")).default;
	remarkGfm = (await dynamicImport("remark-gfm")).default;
	remarkGitHub = (await dynamicImport("remark-github")).default;
	remarkParse = (await dynamicImport("remark-parse")).default;
	remarkRemoveComments = (await dynamicImport("remark-remove-comments")).default;
	remarkNormalizeHeadings = (await dynamicImport("remark-normalize-headings")).default;
	remarkStringify = (await dynamicImport("remark-stringify")).default;
	remarkToc = (await dynamicImport("remark-toc")).default;
	unified = (await dynamicImport("unified")).unified;
	/* eslint-enable unicorn/no-await-expression-member */
})();

export interface Commit {
	summary: string;
	body: string;
	hash: string;
}

export interface Changeset {
	file: string;
	packages: { [pkgName: string]: VersionBumpType };
	rawContent: string;
	commit?: Commit;
}

export async function newChangeset(
	file: string,
	repository?: Repository,
	log?: Logger,
): Promise<Changeset | undefined> {
	if (!existsSync(file)) {
		return undefined;
	}

	const fileContents = readFileSync(file, "utf-8");
	const parsed = matter(fileContents);

	const changeset: Changeset = {
		file,
		packages: parsed.data,
		rawContent: parsed.content,
	};

	if (repository !== undefined) {
		const commit = await getChangesetCommit(file, repository, log);
		changeset.commit = commit;
	}
	return changeset;
}

export async function getChangesetCommit(
	file: string,
	repository: Repository,
	log?: Logger,
): Promise<Commit | undefined> {
	const results = await repository.gitClient.log({ file });
	if (results === undefined) {
		log?.warning(`Can't find commit for changeset: ${file}`);
		return undefined;
	}

	const last = results.all.slice(-1)[0];
	return { summary: last.message, body: last.body, hash: last.hash };
}

const firstParagraphToHeading: Plugin = () => {
	return (tree: Node) => {
		// console.dir(tree);
		mdastAssert(tree);
		const paragraphs = selectAll("paragraph", tree);
		const firstPara = paragraphs[0] as Heading;
		firstPara.type = "heading";
		firstPara.depth = 3;
	};
};

export async function addChangesetsToChangelog(
	changelogPath: string,
	pkg: Package,
	changesets: Changeset[],
	log?: Logger,
): Promise<void> {
	const changelog = existsSync(changelogPath)
		? readFileSync(changelogPath, "utf-8")
		: `# ${pkg.name} Changelog\n\n`;

	const changelogEntries: Content[] = [];
	for (const changeset of changesets) {
		// eslint-disable-next-line no-await-in-loop
		const changesetContent: Content = await remark()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkGitHub)
			.use(firstParagraphToHeading)
			// .use(buildChangelog(ver, changesets))
			// .use(remarkNormalizeHeadings)
			// .use(remarkStringify)
			.parse(changeset.rawContent);
		changelogEntries.push(changesetContent);
		// console.warn(JSON.stringify(changesetContent, undefined, 2));
	}

	const fileContent = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		// .use(remarkGitHub)
		.use(remarkRemoveComments)
		// eslint-disable-next-line unicorn/consistent-function-scoping
		.use(() => (tree) => {
			// console.log(JSON.stringify(tree, undefined, 2));
			visitParents(tree, (node: Node, ancestors: Node[]) => {
				switch (node?.type) {
					case "root": {
						// console.dir((node as Root).children);
						const children = (node as Root).children;
						const topHeading = children[0];
						mdastAssertParent(topHeading);

						(node as Root).children = children.splice(1, 0, ...changelogEntries)
						break;
					}

					case "text": {
						// console.log(JSON.stringify(node, undefined, 2));
						break;
					}

					case "heading": {
						const h = node as Heading;
						if (h.children[0].type === "text") {
							const t: Text = h.children[0];
							// if(t.value === )
						}
						break;
					}

					default: {
						console.log(`skipped node type: ${node?.type}`);
						break;
					}
				}

				// console.log(`type: ${node?.type}, ${ancestors.length} ancestors`);
			});
		})
		// .use(compact)
		.use(remarkStringify)
		.process(changelog);

	// const fileContent = changelog + changesetStrings.join("\n\n\n");
	// const processor = unified().use(remarkStringify, {
	// 	bullet: "-",
	// 	fence: "`",
	// 	fences: true,
	// 	incrementListMarker: false,
	// });
	// const fileContent = processor.stringify(changelogTree);

	// console.log(JSON.stringify(tree, null, 2));

	// log?.warning(String(fileContent));
	// log?.warning(JSON.stringify(fileContent, null, 2));

	writeFileSync(changelogPath, String(fileContent));
}
