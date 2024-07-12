## Public API Report File for "@fluid-tools/api-markdown-documenter"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { ApiCallSignature } from '@microsoft/api-extractor-model';
import { ApiClass } from '@microsoft/api-extractor-model';
import { ApiConstructor } from '@microsoft/api-extractor-model';
import { ApiConstructSignature } from '@microsoft/api-extractor-model';
import { ApiEntryPoint } from '@microsoft/api-extractor-model';
import { ApiEnum } from '@microsoft/api-extractor-model';
import { ApiEnumMember } from '@microsoft/api-extractor-model';
import { ApiFunction } from '@microsoft/api-extractor-model';
import { ApiIndexSignature } from '@microsoft/api-extractor-model';
import { ApiInterface } from '@microsoft/api-extractor-model';
import { ApiItem } from '@microsoft/api-extractor-model';
import { ApiItemKind } from '@microsoft/api-extractor-model';
import { ApiMethod } from '@microsoft/api-extractor-model';
import { ApiMethodSignature } from '@microsoft/api-extractor-model';
import { ApiModel } from '@microsoft/api-extractor-model';
import { ApiNamespace } from '@microsoft/api-extractor-model';
import { ApiPackage } from '@microsoft/api-extractor-model';
import { ApiPropertyItem } from '@microsoft/api-extractor-model';
import { ApiTypeAlias } from '@microsoft/api-extractor-model';
import { ApiVariable } from '@microsoft/api-extractor-model';
import type { Data } from 'unist';
import { DocNode } from '@microsoft/tsdoc';
import { DocSection } from '@microsoft/tsdoc';
import { Excerpt } from '@microsoft/api-extractor-model';
import type { Literal } from 'unist';
import { NewlineKind } from '@rushstack/node-core-library';
import type { Node as Node_2 } from 'unist';
import type { Nodes } from 'hast';
import type { Parent } from 'unist';
import { ReleaseTag } from '@microsoft/api-extractor-model';
import type { Root } from 'hast';
import { TypeParameter } from '@microsoft/api-extractor-model';

// @public
export type ApiFunctionLike = ApiConstructSignature | ApiConstructor | ApiFunction | ApiMethod | ApiMethodSignature;

export { ApiItem }

export { ApiItemKind }

// @public
export interface ApiItemTransformationConfiguration extends ApiItemTransformationOptions, DocumentationSuiteOptions, ConfigurationBase {
    apiModel: ApiModel;
    readonly uriRoot: string;
}

// @public
export interface ApiItemTransformationOptions {
    createDefaultLayout?: (apiItem: ApiItem, childSections: SectionNode[] | undefined, config: Required<ApiItemTransformationConfiguration>) => SectionNode[];
    transformApiCallSignature?: TransformApiItemWithoutChildren<ApiCallSignature>;
    transformApiClass?: TransformApiItemWithChildren<ApiClass>;
    transformApiConstructor?: TransformApiItemWithoutChildren<ApiConstructSignature | ApiConstructor>;
    transformApiEntryPoint?: TransformApiItemWithChildren<ApiEntryPoint>;
    transformApiEnum?: TransformApiItemWithChildren<ApiEnum>;
    transformApiEnumMember?: TransformApiItemWithoutChildren<ApiEnumMember>;
    transformApiFunction?: TransformApiItemWithoutChildren<ApiFunction>;
    transformApiIndexSignature?: TransformApiItemWithoutChildren<ApiIndexSignature>;
    transformApiInterface?: TransformApiItemWithChildren<ApiInterface>;
    transformApiMethod?: TransformApiItemWithoutChildren<ApiMethod | ApiMethodSignature>;
    transformApiModel?: TransformApiItemWithoutChildren<ApiModel>;
    transformApiNamespace?: TransformApiItemWithChildren<ApiNamespace>;
    transformApiProperty?: TransformApiItemWithoutChildren<ApiPropertyItem>;
    transformApiTypeAlias?: TransformApiItemWithoutChildren<ApiTypeAlias>;
    transformApiVariable?: TransformApiItemWithoutChildren<ApiVariable>;
}

declare namespace ApiItemUtilities {
    export {
        doesItemRequireOwnDocument,
        filterItems,
        getHeadingForApiItem,
        getLinkForApiItem,
        shouldItemBeIncluded,
        getCustomBlockComments,
        getDefaultValueBlock,
        getDeprecatedBlock,
        getExampleBlocks,
        getModifiers,
        getModifierTags,
        getQualifiedApiItemName,
        getReleaseTag,
        getReturnsBlock,
        getSeeBlocks,
        getSingleLineExcerptText,
        getThrowsBlocks,
        getUnscopedPackageName,
        hasModifierTag,
        isDeprecated,
        isOptional,
        isReadonly,
        isStatic
    }
}
export { ApiItemUtilities }

// @public
export type ApiMemberKind = Omit<ApiItemKind, ApiItemKind.EntryPoint | ApiItemKind.Model | ApiItemKind.None | ApiItemKind.Package>;

export { ApiModel }

// @public
export enum ApiModifier {
    Optional = "optional",
    Readonly = "readonly",
    Sealed = "sealed",
    Static = "static",
    Virtual = "virtual"
}

// @public
export type ApiModuleLike = ApiEntryPoint | ApiNamespace;

export { ApiPackage }

// @public
export type ApiSignatureLike = ApiCallSignature | ApiIndexSignature;

// @public
export class BlockQuoteNode extends DocumentationParentNodeBase implements MultiLineDocumentationNode {
    constructor(children: DocumentationNode[]);
    static createFromPlainText(text: string): BlockQuoteNode;
    static readonly Empty: BlockQuoteNode;
    get singleLine(): false;
    readonly type = DocumentationNodeType.BlockQuote;
}

// @public
export class CodeSpanNode extends DocumentationParentNodeBase<SingleLineDocumentationNode> implements SingleLineDocumentationNode {
    constructor(children: SingleLineDocumentationNode[]);
    static createFromPlainText(text: string): CodeSpanNode;
    static readonly Empty: CodeSpanNode;
    get singleLine(): true;
    readonly type = DocumentationNodeType.CodeSpan;
}

// @public
export interface ConfigurationBase {
    readonly logger?: Logger;
}

// @public
function createBreadcrumbParagraph(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): ParagraphNode;

// @public
function createDeprecationNoticeSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): ParagraphNode | undefined;

// @public
function createExamplesSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>, headingText?: string): SectionNode | undefined;

// @public
function createParametersSection(apiFunctionLike: ApiFunctionLike, config: Required<ApiItemTransformationConfiguration>): SectionNode | undefined;

// @public
function createRemarksSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): SectionNode | undefined;

// @public
function createReturnsSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): SectionNode | undefined;

// @public
function createSeeAlsoSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): SectionNode | undefined;

// @public
function createSignatureSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): SectionNode | undefined;

// @public
function createSummaryParagraph(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): ParagraphNode | undefined;

// @public
function createThrowsSection(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>, headingText?: string): SectionNode | undefined;

// @public
function createTypeParametersSection(typeParameters: readonly TypeParameter[], contextApiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): SectionNode;

// @public
export const defaultConsoleLogger: Logger;

// @public
export namespace DefaultDocumentationSuiteOptions {
    const defaultDocumentBoundaries: ApiMemberKind[];
    const defaultHierarchyBoundaries: ApiMemberKind[];
    export function defaultGetAlertsForItem(apiItem: ApiItem): string[];
    export function defaultGetFileNameForItem(apiItem: ApiItem): string;
    export function defaultGetHeadingTextForItem(apiItem: ApiItem): string;
    export function defaultGetLinkTextForItem(apiItem: ApiItem): string;
    export function defaultGetUriBaseOverrideForItem(): string | undefined;
    export function defaultSkipPackage(): boolean;
}

// @public
export interface DocumentationLiteralNode<TValue = unknown> extends Literal<TValue>, DocumentationNode {
    readonly isLiteral: true;
    readonly isParent: false;
    readonly type: string;
    readonly value: TValue;
}

// @public
export abstract class DocumentationLiteralNodeBase<TValue = unknown> implements DocumentationLiteralNode<TValue> {
    protected constructor(value: TValue);
    abstract get isEmpty(): boolean;
    readonly isLiteral = true;
    readonly isParent = false;
    abstract get singleLine(): boolean;
    abstract type: string;
    readonly value: TValue;
}

// @public
export interface DocumentationNode<TData extends object = Data> extends Node_2<TData> {
    readonly isEmpty: boolean;
    readonly isLiteral: boolean;
    readonly isParent: boolean;
    readonly singleLine: boolean;
    readonly type: string;
}

// @public
export enum DocumentationNodeType {
    BlockQuote = "BlockQuote",
    CodeSpan = "CodeSpan",
    Document = "Document",
    FencedCode = "FencedCode",
    Heading = "Heading",
    HorizontalRule = "HorizontalRule",
    LineBreak = "LineBreak",
    Link = "Link",
    OrderedList = "OrderedList",
    Paragraph = "Paragraph",
    PlainText = "PlainText",
    Section = "Section",
    Span = "Span",
    Table = "Table",
    TableCell = "TableCell",
    TableRow = "TableRow",
    UnorderedList = "UnorderedList"
}

// @public
export interface DocumentationParentNode<TDocumentationNode extends DocumentationNode = DocumentationNode> extends Parent<TDocumentationNode, Data>, DocumentationNode {
    readonly children: TDocumentationNode[];
    readonly hasChildren: boolean;
    readonly isLiteral: false;
    readonly isParent: true;
    readonly type: string;
}

// @public
export abstract class DocumentationParentNodeBase<TDocumentationNode extends DocumentationNode = DocumentationNode> implements DocumentationParentNode<TDocumentationNode> {
    protected constructor(children: TDocumentationNode[]);
    readonly children: TDocumentationNode[];
    get hasChildren(): boolean;
    get isEmpty(): boolean;
    readonly isLiteral = false;
    readonly isParent = true;
    get singleLine(): boolean;
    abstract type: string;
}

// @public
export interface DocumentationSuiteOptions {
    documentBoundaries?: DocumentBoundaries;
    getAlertsForItem?: (apiItem: ApiItem) => string[];
    getFileNameForItem?: (apiItem: ApiItem) => string;
    getHeadingTextForItem?: (apiItem: ApiItem) => string;
    getLinkTextForItem?: (apiItem: ApiItem) => string;
    getUriBaseOverrideForItem?: (apiItem: ApiItem) => string | undefined;
    hierarchyBoundaries?: HierarchyBoundaries;
    includeBreadcrumb?: boolean;
    includeTopLevelDocumentHeading?: boolean;
    minimumReleaseLevel?: Omit<ReleaseTag, ReleaseTag.None>;
    skipPackage?: (apiPackage: ApiPackage) => boolean;
}

// @public
export type DocumentBoundaries = ApiMemberKind[];

// @public
export class DocumentNode implements Parent<SectionNode>, DocumentNodeProps {
    constructor(properties: DocumentNodeProps);
    readonly apiItem?: ApiItem;
    readonly children: SectionNode[];
    readonly documentPath: string;
    readonly type = DocumentationNodeType.Document;
}

// @public
export interface DocumentNodeProps {
    readonly apiItem?: ApiItem;
    readonly children: SectionNode[];
    readonly documentPath: string;
}

// @public
export interface DocumentWriter {
    decreaseIndent(): void;
    ensureNewLine(): void;
    ensureSkippedLine(): void;
    getText(): string;
    increaseIndent(indentPrefix?: string): void;
    peekLastCharacter(): string;
    peekSecondLastCharacter(): string;
    write(message: string): void;
    writeLine(message?: string): void;
}

// @public
export namespace DocumentWriter {
    export function create(): DocumentWriter;
}

// @public
function doesItemRequireOwnDocument(apiItem: ApiItem, documentBoundaries: DocumentBoundaries): boolean;

// @public
export class FencedCodeBlockNode extends DocumentationParentNodeBase implements MultiLineDocumentationNode {
    constructor(children: DocumentationNode[], language?: string);
    static createFromPlainText(text: string, language?: string): FencedCodeBlockNode;
    readonly language?: string;
    get singleLine(): false;
    readonly type = DocumentationNodeType.FencedCode;
}

// @public
export interface FileSystemConfiguration {
    readonly newlineKind?: NewlineKind;
    outputDirectoryPath: string;
}

// @public
function filterItems(apiItems: readonly ApiItem[], config: Required<ApiItemTransformationConfiguration>): ApiItem[];

// @public
export function getApiItemTransformationConfigurationWithDefaults(inputOptions: ApiItemTransformationConfiguration): Required<ApiItemTransformationConfiguration>;

// @public
function getCustomBlockComments(apiItem: ApiItem): ReadonlyMap<string, readonly DocSection[]>;

// @public
function getDefaultValueBlock(apiItem: ApiItem, logger?: Logger): DocSection | undefined;

// @public
function getDeprecatedBlock(apiItem: ApiItem): DocSection | undefined;

// @public
function getExampleBlocks(apiItem: ApiItem): readonly DocSection[] | undefined;

// @public
function getHeadingForApiItem(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>, headingLevel?: number): Heading;

// @public
function getLinkForApiItem(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>, textOverride?: string): Link;

// @public
function getModifiers(apiItem: ApiItem, modifiersToOmit?: ApiModifier[]): ApiModifier[];

// @public
function getModifierTags(apiItem: ApiItem): ReadonlySet<string>;

// @public
function getQualifiedApiItemName(apiItem: ApiItem): string;

// @public
function getReleaseTag(apiItem: ApiItem): ReleaseTag | undefined;

// @public
function getReturnsBlock(apiItem: ApiItem): DocSection | undefined;

// @public
function getSeeBlocks(apiItem: ApiItem): readonly DocSection[] | undefined;

// @public
function getSingleLineExcerptText(excerpt: Excerpt): string;

// @public
function getThrowsBlocks(apiItem: ApiItem): readonly DocSection[] | undefined;

// @public
function getUnscopedPackageName(apiPackage: ApiPackage): string;

// @public
function hasModifierTag(apiItem: ApiItem, tagName: string): boolean;

// @public
export interface Heading {
    readonly id?: string;
    readonly level?: number;
    readonly title: string;
}

// @public
export class HeadingNode extends DocumentationParentNodeBase<SingleLineDocumentationNode> implements Omit<Heading, "title">, MultiLineDocumentationNode {
    constructor(content: SingleLineDocumentationNode[], id?: string);
    static createFromPlainText(text: string, id?: string): HeadingNode;
    static createFromPlainTextHeading(heading: Heading): HeadingNode;
    readonly id?: string;
    get singleLine(): false;
    readonly type = DocumentationNodeType.Heading;
}

// @public
export type HierarchyBoundaries = ApiMemberKind[];

// @public
export class HorizontalRuleNode implements MultiLineDocumentationNode {
    constructor();
    readonly isEmpty = false;
    readonly isLiteral = true;
    readonly isParent = false;
    readonly singleLine = false;
    static readonly Singleton: HorizontalRuleNode;
    readonly type = DocumentationNodeType.HorizontalRule;
}

declare namespace HtmlRenderer {
    export {
        renderApiModelAsHtml as renderApiModel,
        renderDocumentsAsHtml as renderDocuments,
        renderDocument,
        renderNode,
        renderNodes
    }
}
export { HtmlRenderer }

// @public
function isDeprecated(apiItem: ApiItem): boolean;

// @public
function isOptional(apiItem: ApiItem): boolean;

// @public
function isReadonly(apiItem: ApiItem): boolean;

// @public
function isStatic(apiItem: ApiItem): boolean;

declare namespace LayoutUtilities {
    export {
        createBreadcrumbParagraph,
        createDeprecationNoticeSection,
        createExamplesSection,
        createParametersSection,
        createRemarksSection,
        createReturnsSection,
        createSeeAlsoSection,
        createSignatureSection,
        createSummaryParagraph,
        createThrowsSection,
        createTypeParametersSection
    }
}
export { LayoutUtilities }

// @public
export class LineBreakNode implements MultiLineDocumentationNode {
    constructor();
    readonly isEmpty = false;
    readonly isLiteral = true;
    readonly isParent = false;
    readonly singleLine = false;
    static readonly Singleton: LineBreakNode;
    readonly type = DocumentationNodeType.LineBreak;
}

// @public
export interface Link {
    readonly target: UrlTarget;
    readonly text: string;
}

// @public
export class LinkNode extends DocumentationParentNodeBase<SingleLineDocumentationNode> implements SingleLineDocumentationNode, Omit<Link, "text"> {
    constructor(content: SingleLineDocumentationNode[], target: UrlTarget);
    static createFromPlainText(text: string, target: UrlTarget): LinkNode;
    static createFromPlainTextLink(link: Link): LinkNode;
    get singleLine(): true;
    readonly target: UrlTarget;
    readonly type = DocumentationNodeType.Link;
}

// @public
export function loadModel(reportsDirectoryPath: string, logger?: Logger): Promise<ApiModel>;

// @public
export interface Logger {
    error: LoggingFunction;
    info: LoggingFunction;
    success: LoggingFunction;
    verbose: LoggingFunction;
    warning: LoggingFunction;
}

// @public
export type LoggingFunction = (message: string | Error, ...parameters: unknown[]) => void;

// @public
export interface MarkdownRenderConfiguration extends ConfigurationBase {
    readonly customRenderers?: MarkdownRenderers;
    readonly startingHeadingLevel?: number;
}

// @public
export interface MarkdownRenderContext extends TextFormatting {
    customRenderers?: MarkdownRenderers;
    headingLevel: number;
    readonly insideCodeBlock?: boolean;
    readonly insideTable?: boolean;
}

declare namespace MarkdownRenderer {
    export {
        renderApiModelAsMarkdown as renderApiModel,
        renderDocumentsAsMarkdown as renderDocuments,
        renderDocument_2 as renderDocument,
        renderNode_2 as renderNode,
        renderNodes_2 as renderNodes
    }
}
export { MarkdownRenderer }

// @public
export interface MarkdownRenderers {
    [documentationNodeKind: string]: (node: DocumentationNode, writer: DocumentWriter, context: MarkdownRenderContext) => void;
}

// @public
export interface MultiLineDocumentationNode<TData extends object = Data> extends DocumentationNode<TData> {
    readonly singleLine: false;
}

export { NewlineKind }

// @public
export class OrderedListNode extends DocumentationParentNodeBase<SingleLineDocumentationNode> implements MultiLineDocumentationNode {
    constructor(children: SingleLineDocumentationNode[]);
    static createFromPlainTextEntries(entries: string[]): OrderedListNode;
    static readonly Empty: OrderedListNode;
    get singleLine(): false;
    readonly type = DocumentationNodeType.OrderedList;
}

// @public
export class ParagraphNode extends DocumentationParentNodeBase implements MultiLineDocumentationNode {
    constructor(children: DocumentationNode[]);
    static createFromPlainText(text: string): ParagraphNode;
    static readonly Empty: ParagraphNode;
    get singleLine(): false;
    readonly type = DocumentationNodeType.Paragraph;
}

// @public
export class PlainTextNode extends DocumentationLiteralNodeBase<string> implements SingleLineDocumentationNode {
    constructor(text: string, escaped?: boolean);
    static readonly Empty: PlainTextNode;
    readonly escaped: boolean;
    get isEmpty(): boolean;
    readonly singleLine = true;
    get text(): string;
    readonly type = DocumentationNodeType.PlainText;
}

export { ReleaseTag }

// @public
function renderApiModelAsMarkdown(transformConfig: Omit<ApiItemTransformationConfiguration, "logger">, renderConfig: Omit<MarkdownRenderConfiguration, "logger">, fileSystemConfig: FileSystemConfiguration, logger?: Logger): Promise<void>;

// @public
function renderDocument_2(document: DocumentNode, config: MarkdownRenderConfiguration): string;

// @public
function renderDocumentsAsMarkdown(documents: DocumentNode[], renderConfig: Omit<MarkdownRenderConfiguration, "logger">, fileSystemConfig: FileSystemConfiguration, logger?: Logger): Promise<void>;

// @public
function renderNode_2(node: DocumentationNode, writer: DocumentWriter, context: MarkdownRenderContext): void;

// @public
function renderNodes_2(children: DocumentationNode[], writer: DocumentWriter, childContext: MarkdownRenderContext): void;

// @public
export class SectionNode extends DocumentationParentNodeBase implements MultiLineDocumentationNode {
    constructor(children: DocumentationNode[], heading?: HeadingNode);
    static combine(...sections: SectionNode[]): SectionNode;
    static readonly Empty: SectionNode;
    readonly heading?: HeadingNode;
    get singleLine(): false;
    readonly type = DocumentationNodeType.Section;
}

// @public
function shouldItemBeIncluded(apiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): boolean;

// @public
export interface SingleLineDocumentationNode<TData extends object = Data> extends DocumentationNode<TData> {
    readonly singleLine: true;
}

// @public
export class SingleLineSpanNode extends SpanNode<SingleLineDocumentationNode> implements SingleLineDocumentationNode {
    constructor(children: SingleLineDocumentationNode[], formatting?: TextFormatting);
    static createFromPlainText(text: string, formatting?: TextFormatting): SingleLineSpanNode;
    get singleLine(): true;
}

// @public
export class SpanNode<TDocumentationNode extends DocumentationNode = DocumentationNode> extends DocumentationParentNodeBase<TDocumentationNode> {
    constructor(children: TDocumentationNode[], formatting?: TextFormatting);
    static createFromPlainText(text: string, formatting?: TextFormatting): SpanNode;
    static readonly Empty: SpanNode;
    readonly textFormatting?: TextFormatting;
    readonly type = DocumentationNodeType.Span;
}

// @public
export class TableBodyCellNode extends TableCellNode {
    constructor(children: DocumentationNode[]);
    static createFromPlainText(text: string): TableBodyCellNode;
    static readonly Empty: TableBodyCellNode;
}

// @public
export class TableBodyRowNode extends TableRowNode {
    constructor(cells: TableCellNode[]);
    static readonly Empty: TableBodyRowNode;
}

// @public
export enum TableCellKind {
    Body = "Body",
    Header = "Header"
}

// @public
export abstract class TableCellNode extends DocumentationParentNodeBase {
    protected constructor(children: DocumentationNode[], cellKind: TableCellKind);
    readonly cellKind: TableCellKind;
    readonly type = DocumentationNodeType.TableCell;
}

// @public
export class TableHeaderCellNode extends TableCellNode {
    constructor(children: DocumentationNode[]);
    static createFromPlainText(text: string): TableHeaderCellNode;
    static readonly Empty: TableHeaderCellNode;
}

// @public
export class TableHeaderRowNode extends TableRowNode {
    constructor(cells: TableHeaderCellNode[]);
    static readonly Empty: TableHeaderRowNode;
}

// @public
export class TableNode extends DocumentationParentNodeBase<TableBodyRowNode> implements MultiLineDocumentationNode {
    constructor(bodyRows: TableBodyRowNode[], headingRow?: TableHeaderRowNode);
    static readonly Empty: TableNode;
    readonly headerRow?: TableHeaderRowNode;
    get singleLine(): false;
    readonly type = DocumentationNodeType.Table;
}

// @public
export enum TableRowKind {
    Body = "Body",
    Header = "Header"
}

// @public
export abstract class TableRowNode extends DocumentationParentNodeBase<TableCellNode> {
    protected constructor(cells: TableCellNode[], rowKind: TableRowKind);
    readonly rowKind: TableRowKind;
    readonly type = DocumentationNodeType.TableRow;
}

// @public
export interface TextFormatting {
    readonly bold?: boolean;
    readonly italic?: boolean;
    readonly strikethrough?: boolean;
}

// @public
export type TransformApiItemWithChildren<TApiItem extends ApiItem> = (apiItem: TApiItem, config: Required<ApiItemTransformationConfiguration>, generateChildSection: (apiItem: ApiItem) => SectionNode[]) => SectionNode[];

// @public
export type TransformApiItemWithoutChildren<TApiItem extends ApiItem> = (apiItem: TApiItem, config: Required<ApiItemTransformationConfiguration>) => SectionNode[];

// @public
export function transformApiModel(transformConfig: ApiItemTransformationConfiguration): DocumentNode[];

// @public
export function transformTsdocNode(node: DocNode, contextApiItem: ApiItem, config: Required<ApiItemTransformationConfiguration>): DocumentationNode | undefined;

// @public
export class UnorderedListNode extends DocumentationParentNodeBase<SingleLineDocumentationNode> implements MultiLineDocumentationNode {
    constructor(children: SingleLineDocumentationNode[]);
    static createFromPlainTextEntries(entries: string[]): UnorderedListNode;
    static readonly Empty: UnorderedListNode;
    get singleLine(): false;
    readonly type = DocumentationNodeType.UnorderedList;
}

// @public
export type UrlTarget = string;

// @public
export const verboseConsoleLogger: Logger;

```