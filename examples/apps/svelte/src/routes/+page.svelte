<script lang="ts">
import { SvelteMap as Map } from "svelte/reactivity";
import type { CoordinateString } from "../helpers/coordinate";
import { loadPuzzle, type PuzzleGrid } from "../helpers/puzzles";
import Sudoku from "../Sudoku.svelte";

let puzzle: PuzzleGrid = $state(new Map());
loadPuzzle(0, puzzle);

let presence: Map<CoordinateString, boolean> = $state(new Map());

const clientSessionId = "local";
</script>

<Sudoku {puzzle} {presence} {clientSessionId} />
