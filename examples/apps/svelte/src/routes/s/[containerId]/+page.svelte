<script lang="ts">
import type { PageProps } from "./$types";
import Sudoku from "../../../Sudoku.svelte";
import { loadIncludedPuzzle } from "../../../sudokuPuzzle.svelte";

const { data }: PageProps = $props();
const { presence, sessionClient } = data;

let puzzle = loadIncludedPuzzle(0);

// let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());
</script>

<div class="p-8">
  <Sudoku {puzzle} {presence} {sessionClient} />
</div>
