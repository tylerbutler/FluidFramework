<script lang="ts">
import type { PageProps } from "./$types";
import Sudoku from "../../../Sudoku.svelte";
import { loadIncludedPuzzle } from "../../../loadPuzzle";

const { data }: PageProps = $props();
const { appData, presence, sessionClient } = data;

loadIncludedPuzzle(appData.root, 0);

// let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());
</script>

<div class="p-8">
  <Sudoku data={appData.root} {presence} {sessionClient} />
</div>
