/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ReleaseVersion, VersionBumpType } from "@fluid-tools/version-tools";
import { Logger, Package } from "@fluidframework/build-tools";
import matter from "gray-matter";

import type { Content, Heading, List, Paragraph, Parent, Root, Text } from "mdast";
import { brk, heading, paragraph, root, text } from "mdast-builder";
import { assert as mdastAssert, parent as mdastAssertParent } from "mdast-util-assert";
import { compact } from "mdast-util-compact";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkGitHub from "remark-github";
import remarkNormalizeHeadings from "remark-normalize-headings";
import remarkParse from "remark-parse";
import remarkRemoveComments from "remark-remove-comments";
import remarkStringify from "remark-stringify";
import remarkToc from "remark-toc";
import { type Plugin, unified } from "unified";
import type { Node } from "unist";
import { matches, select, selectAll } from "unist-util-select";
import { visit } from "unist-util-visit";
import { visitParents } from "unist-util-visit-parents";

import { Repository } from "./git.js";

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

	const fileContents = readFileSync(file, "utf8");
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

	const changelogEntries: string[] = [];
	for (const changeset of changesets) {
		const changesetContent = await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkGitHub)
			.use(firstParagraphToHeading)
			// .use(buildChangelog(ver, changesets))
			.use(remarkNormalizeHeadings)
			.use(remarkStringify)
			.process(changeset.rawContent);
		changelogEntries.push(changesetContent.toString());
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

						(node as Root).children = children.splice(1, 0, ...changelogEntries);
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
