<script lang="ts">
import { SvelteMap } from "svelte/reactivity";
import type { CoordinateString } from "../helpers/coordinate";
import Sudoku from "../Sudoku.svelte";
import { loadIncludedPuzzle } from "../helpers/sudokuPuzzle.svelte";

let puzzle = loadIncludedPuzzle(0);

let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());

const clientSessionId = "local";
</script>

<Sudoku {puzzle} {presence} {clientSessionId} />
