<script lang="ts">
import type { PageProps } from "./$types";
import Sudoku from "../../../Sudoku.svelte";
import { loadIncludedPuzzle } from "../../../sudokuPuzzle.svelte";

const { data }: PageProps = $props();
const { presence, sessionClient } = data;

let puzzle = $state(loadIncludedPuzzle(0));

// let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());
</script>

<Sudoku {puzzle} {presence} {sessionClient} />
