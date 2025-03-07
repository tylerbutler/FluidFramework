/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration } from "fluid-framework";
import { schemaFactory as sf } from "./schemaFactory";
import { SudokuCellDataInternal } from "./cellData.svelte";

export class SudokuRow extends sf.array("SudokuRow", SudokuCellDataInternal) {}

export class SudokuGrid extends sf.array("SudokuGrid", SudokuRow) {}

/**
 * Main app data schema.
 */
export class SudokuAppData extends sf.object("SudokuAppData", {
	grid: SudokuGrid,
	solutions: sf.map("solutions", sf.string),
}) {}

export const sudokuTreeConfiguration = new TreeViewConfiguration({ schema: SudokuAppData });
