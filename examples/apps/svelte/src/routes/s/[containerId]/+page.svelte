<script lang="ts">
import type { PageProps } from "./$types";
import { Alert } from 'flowbite-svelte';
import Sudoku from "../../../Sudoku.svelte";
import { loadIncludedPuzzle } from "../../../sudokuPuzzle.svelte";
import { Alert } from 'flowbite-svelte';
import { Alert as A2 } from "svelte-5-ui-lib";

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

<div class="p-8">
  <A2>
    <span class="font-medium">Testing!</span>
    Is it working?
	</A2>
</div>

<Sudoku {puzzle} {presence} {sessionClient} />
