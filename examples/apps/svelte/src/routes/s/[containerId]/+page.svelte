<script lang="ts">
import type { PageProps } from "./$types";
import { Alert } from "flowbite-svelte";
import Sudoku from "../../../Sudoku.svelte";
import { loadIncludedPuzzle } from "../../../sudokuPuzzle.svelte";

const { data }: PageProps = $props();
const { presence, sessionClient } = data;

let puzzle = loadIncludedPuzzle(0);

// let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());
</script>

<div class="p-8">
  <Alert>
    <span class="font-medium">Testing!</span>
    Is it working?
  </Alert>
</div>

<Sudoku {puzzle} {presence} {sessionClient} />
