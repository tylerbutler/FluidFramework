<script lang="ts">
import { SvelteMap } from "svelte/reactivity";
import type { CoordinateString } from "../helpers/coordinate";
import { loadPuzzle, type SudokuGrid, type SudokuPuzzle } from "../helpers/puzzles";
import Sudoku from "../Sudoku.svelte";

let puzzle = $state<SudokuPuzzle>();
puzzle = loadPuzzle(0);

let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());

const clientSessionId = "local";
</script>

<Sudoku {puzzle} {presence} {clientSessionId} />
