/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { VersionBumpType } from "@fluid-tools/version-tools";
import { Logger, Package } from "@fluidframework/build-tools";
import { existsSync, PathLike, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readdir } from "node:fs/promises";

import matter from "gray-matter";

// eslint-disable-next-line node/no-missing-import
import type { Parent, Root, Paragraph, Heading, List, Text, Content } from "mdast";
// eslint-disable-next-line node/no-missing-import
import type { Node } from "unist";
import { unified, type Plugin } from "unified";
import { assert as assertTree, parent as assertParent } from "mdast-util-assert";
import { selectAll } from "unist-util-select";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkGitHub from "remark-github";
import remarkRemoveComments from "remark-remove-comments";
import remarkStringify from "remark-stringify";
import remarkToc from "remark-toc";
import { visitParents } from "unist-util-visit-parents";
import { fromMarkdown } from "mdast-util-from-markdown";
import globby from "globby";

// import remarkFrontmatter from 'remark-frontmatter'

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

// export function loadChangesets(directory: PathLike) {

// }

export const firstParagraphToHeading: Plugin = () => {
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	return (tree: Node) => {
		// console.dir(tree);
		assertTree(tree);
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

	const changelogEntries: Root[] = [];
	for (const changeset of changesets) {
		// eslint-disable-next-line no-await-in-loop
		const changesetContent = await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkGitHub)
			.use(firstParagraphToHeading)
			// .use(buildChangelog(ver, changesets))
			// .use(remarkNormalizeHeadings)
			.use(remarkStringify)
			.process(changeset.rawContent);
		changelogEntries.push(fromMarkdown(changesetContent.toString()));
		// console.warn(JSON.stringify(changesetContent, undefined, 2));
	}

	const fileContent = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		// .use(remarkGitHub)
		.use(remarkRemoveComments as Plugin<[], Root, Root>)
		// eslint-disable-next-line unicorn/consistent-function-scoping, @typescript-eslint/explicit-function-return-type
		.use(() => (tree) => {
			// console.log(JSON.stringify(tree, undefined, 2));
			visitParents(tree, (node: Node, ancestors: Node[]) => {
				switch (node?.type) {
					case "root": {
						// console.dir((node as Root).children);
						const children = (node as Root).children;
						const topHeading = children[0];
						assertParent(topHeading);

						(node as Root).children = children.splice(
							1,
							0,
							...changelogEntries[0].children,
						);
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

export async function summarizeChangesets(
	changesetsPath: string,
	summaryPath: string,
): Promise<string> {
	// const breakingMdContent = readFileSync(summaryPath, "utf-8");
	let newContent: string = "";
	const changesets = await loadAllChangesets(changesetsPath);
	for (const changeset of changesets) {
		const changesetContent = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkGitHub)
			.use(firstParagraphToHeading)
			// .use(buildChangelog(ver, changesets))
			// .use(remarkNormalizeHeadings)
			.use(remarkStringify)
			.process(changeset.rawContent);
		newContent += changesetContent.toString();
	}

	// return changesetContent.toString();
	return newContent;
}

export async function loadChangesetFromFile(file: string): Promise<Changeset | undefined> {
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

	return changeset;
}

export async function loadAllChangesets(changesetsPath: string): Promise<Changeset[]> {
	const changesetFiles = await globby(["*.md", "!README.md"], {
		cwd: changesetsPath,
		absolute: true,
	});

	const changesets: Changeset[] = [];
	for (const file of changesetFiles) {
		// eslint-disable-next-line no-await-in-loop
		const changeset = await loadChangesetFromFile(path.join(changesetsPath, file));
		if (changeset !== undefined) {
			changesets.push(changeset);
		}
	}

	return changesets;
}

async function loadChangesetMap(
	changesetsOrPath: string | Changeset[],
	log?: Logger,
): Promise<{
	type: VersionBumpType;
	changesets: Map<string, Changeset[]>;
}> {
	const changesetMap = new Map<string, Changeset[]>();

	const changesets =
		typeof changesetsOrPath === "string"
			? await loadAllChangesets(changesetsOrPath)
			: changesetsOrPath;
	let changeType: VersionBumpType | undefined;

	for (const changeset of changesets) {
		for (const [pkgName, type] of Object.entries(changeset.packages)) {
			changeType = changeType ?? type;
			if (type !== changeType) {
				log?.warning(
					`Unexpected change type for package ${pkgName}: ${type} (expected ${changeType})`,
				);
			}
			const entries = changesetMap.get(pkgName) ?? [];
			entries.push(changeset);
			changesetMap.set(pkgName, entries);
		}
	}

	if (changeType === undefined) {
		throw new Error(`No change type found.`);
	}

	return { type: changeType, changesets: changesetMap };
}
