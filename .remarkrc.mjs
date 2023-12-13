import remarkToc from "remark-toc";
import { read } from "to-vfile";
import { remark } from "remark";
import { visit } from "unist-util-visit";
import { headingRange } from "mdast-util-heading-range";
// const u = require('unist-builder');

function sortSectionsSimple() {
  console.log(`plugin called`);
	return function (tree) {
		let sections = [];
    console.log(`inside plugin function`);

		headingRange(
			tree,
			(value, node) => node.type === "heading" && node.depth >= 2,
      // /.*/,
			(start, nodes, end) => {
        sections.push([ start, nodes, end ]);
        // sections.push(nodes);
			},
		);

		sections.sort((a, b) => {
			const textA = a[0].children[0].value;
			const textB = b[0].children[0].value;
			console.error(`Comparing ${textA} with ${textB}`);
			return textA.localeCompare(textB);
		});

		tree.children = sections.flat();
	};
}

function sortSections() {
	return (tree) => {
		let sections = [];
		let currentSection = [];

		visit(tree, (node, index, parent) => {
			if (node.type === "heading" && node.depth <= 2) {
				if (currentSection.length > 0) {
					sections.push(currentSection);
					currentSection = [];
				}
			}
			currentSection.push(node);
		});

		if (currentSection.length > 0) {
			sections.push(currentSection);
		}

		sections.sort((a, b) => {
			const textA = a[0].children[0].value;
			const textB = b[0].children[0].value;
			return textA.localeCompare(textB);
		});

		tree.children = sections.flat();
	};
}

const file = await remark()
	.use(sortSectionsSimple)
	.process(await read("RELEASE_NOTES/2.0.0-internal.7.4.0.md"));

console.log(String(file));

// const remarkConfig = {
// 	settings: {
// 		bullet: "-", // Use `*` for list item bullets (default)
// 		// See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
// 	},
// 	plugins: [
// 		sortSectionsSimple,
// 		// sortSections,
// 		// Generate a table of contents in `## Contents`
// 		// [remarkToc, { heading: "contents" }],
// 	],
// };

// export default remarkConfig;
