/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { VersionBumpType } from "@fluid-tools/version-tools";
import { Logger, Package } from "@fluidframework/build-tools";
import { existsSync, readFileSync, writeFileSync } from "fs";
import matter from "gray-matter";

// import type { Root } from "mdast";
import type { Plugin } from "unified";
import type { Node } from "unist";
import { Repository } from "./git";

// IMPORTANT: TypeScript changes imports to require when outputting CJS, which causes dynamic import to fail. This hack
// creates a function dynamically that's invisible to TypeScript, so the import statements stay in the output JS.
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const dynamicImport = new Function("specifier", "return import(specifier)");

let mdast;
let mdastAssert;
let mdastFromMarkdown;
let compact;

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
let remarkToc;
let unified;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
	// ESM-only libraries require dynamic import
	/* eslint-disable unicorn/no-await-expression-member */
	// mdast = (await dynamicImport("mdast")).default;
	compact = (await dynamicImport("mdast-util-compact")).compact;
	mdastAssert = (await dynamicImport("mdast-util-assert")).assert;

	const builder = await dynamicImport("mdast-builder");
	root = builder.root;
	paragraph = builder.paragraph;
	text = builder.text;
	heading = builder.heading;
	brk = builder.brk;

	mdastFromMarkdown = (await dynamicImport("mdast-util-from-markdown")).fromMarkdown;
	remark = (await dynamicImport("remark")).remark;
	remarkFrontmatter = (await dynamicImport("remark-frontmatter")).default;
	remarkGfm = (await dynamicImport("remark-gfm")).default;
	remarkGitHub = (await dynamicImport("remark-github")).default;
	remarkParse = (await dynamicImport("remark-parse")).default;
	remarkRemoveComments = (await dynamicImport("remark-remove-comments")).default;
	remarkNormalizeHeadings = (await dynamicImport("remark-normalize-headings")).default;
	remarkToc = (await dynamicImport("remark-toc")).default;
	unified = await dynamicImport("unified");
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

export async function addChangesetsToChangelog(
	changelogPath: string,
	pkg: Package,
	changesets: Changeset[],
	log?: Logger,
): Promise<void> {
	const changelog = existsSync(changelogPath)
		? readFileSync(changelogPath, "utf-8")
		: `# ${pkg.name} Changelog\n\n`;

	// const fileContent = remark()
	// 	// .use(remarkFrontmatter, ["yaml"])
	// 	.use(remarkGfm)
	// 	.use(remarkGitHub)
	// 	// .use(remarkRemoveComments)
	// 	// eslint-disable-next-line unicorn/consistent-function-scoping
	// 	.use((tree) => {
	// 		log?.log(JSON.stringify(tree, null, 2));
	// 	})
	// 	.parse(changelog);

	const changelogTree = mdastFromMarkdown(changelog);

	for (const changeset of changesets) {
		// const changesetContent = mdastFromMarkdown(changeset.rawContent);
		// eslint-disable-next-line no-await-in-loop
		const changesetContent = await remark()
			.use(firstParagraphToHeading)
			.use(remarkGfm)
			.use(remarkGitHub)
			// .use(remarkNormalizeHeadings)
			.process(changeset.rawContent);
		// console.log(JSON.stringify(changesetContent, null, 2));
	}

	// console.log(JSON.stringify(tree, null, 2));

	// log?.warning(String(fileContent));
	// log?.warning(JSON.stringify(fileContent, null, 2));

	// writeFileSync(changelogPath, fileContent);
}

const firstParagraphToHeading: Plugin = () => {
	return (tree) => {
		console.log(tree);
		mdastAssert(tree);
		// const firstPara = tree.children[0];
		// if (firstPara.type !== "paragraph") {
		// 	return;
		// }
	};
};
