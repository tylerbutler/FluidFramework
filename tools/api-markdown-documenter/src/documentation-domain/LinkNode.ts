/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Link, UrlTarget } from "../Link.js";

import { DocumentationParentNodeBase, type DocumentationNode } from "./DocumentationNode.js";
import { DocumentationNodeType } from "./DocumentationNodeType.js";
import { PlainTextNode } from "./PlainTextNode.js";

/**
 * A hyperlink to some other content.
 *
 * @example Markdown
 *
 * ```md
 * [Fluid Framework](https://fluidframework.com/)
 * ```
 *
 * @example HTML
 *
 * ```html
 * <a href="https://fluidframework.com/">Fluid Framework</a>
 * ```
 *
 * @public
 */
export class LinkNode extends DocumentationParentNodeBase implements Omit<Link, "text"> {
	/**
	 * {@inheritDoc DocumentationNode."type"}
	 */
	public readonly type = DocumentationNodeType.Link;

	/**
	 * {@inheritDoc Link.target}
	 */
	public readonly target: UrlTarget;

	/**
	 * {@inheritDoc DocumentationNode.singleLine}
	 */
	public override get singleLine(): true {
		return true;
	}

	public constructor(content: DocumentationNode[], target: UrlTarget) {
		super(content);
		this.target = target;
	}

	/**
	 * Generates a {@link LinkNode} from the provided string.
	 *
	 * @param text - The node contents. Note: this must not contain newline characters.
	 * @param target - See {@link LinkNode.target}.
	 */
	public static createFromPlainText(text: string, target: UrlTarget): LinkNode {
		return new LinkNode([new PlainTextNode(text)], target);
	}

	/**
	 * Generates a {@link LinkNode} from the provided {@link Link}.
	 *
	 * @param link - The link to represent. Note: its text must not contain newline characters.
	 */
	public static createFromPlainTextLink(link: Link): LinkNode {
		return this.createFromPlainText(link.text, link.target);
	}
}
