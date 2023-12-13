import remarkToc from "remark-toc";
import { visit } from "unist-util-visit";
import { headingRange } from "mdast-util-heading-range";

function remarkSortSections() {
	return (tree) => {
		const sections = [];
		let currentSection = null;

		visit(tree, (node, index, parent) => {
			if (parent !== tree) return; // Only consider top-level nodes

			if (node.type === "heading") {
				if (currentSection && node.depth <= currentSection.node.depth) {
					// End of current section
					currentSection.end = index;
					sections.push(currentSection);
					currentSection = null;
				}

				if (!currentSection) {
					// Start of new section
					currentSection = { start: index, node };
				}
			}
		});

		// End of last section
		if (currentSection) {
			currentSection.end = tree.children.length;
			sections.push(currentSection);
		}

		sections.sort((a, b) => {
			const aTitle = a.node.children[0].value;
			const bTitle = b.node.children[0].value;
			console.warn(`comparing '${aTitle}' to '${bTitle}'`);
			return aTitle.localeCompare(bTitle);
		});

		const newChildren = [];
		sections.forEach((section, i) => {
			if (i === 0) {
				newChildren.push(...tree.children.slice(0, section.start));
			} else {
				newChildren.push(...tree.children.slice(sections[i - 1].end, section.start));
			}
			newChildren.push(...tree.children.slice(section.start, section.end));
			if (i === sections.length - 1) {
				newChildren.push(...tree.children.slice(section.end));
			}
		});

		tree.children = newChildren;
	};
}

const remarkConfig = {
	settings: {
		bullet: "-", // Use `*` for list item bullets (default)
		// See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
	},
	plugins: [
		remarkSortSections,
		// Generate a table of contents in `## Contents`
		// [remarkToc, { heading: "contents" }],
	],
};

export default remarkConfig;
