<script lang="ts">
import type { PageProps } from "./$types";
import Sudoku from "../../Sudoku.svelte";
import { loadIncludedPuzzle } from "../../helpers/sudokuPuzzle.svelte";

const { data }: PageProps = $props();
const { presence, sessionClientId } = data;

let puzzle = loadIncludedPuzzle(0);

// let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());
</script>

<Sudoku {puzzle} {presence} {sessionClientId} />
