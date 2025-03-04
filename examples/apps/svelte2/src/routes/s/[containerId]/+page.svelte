<script lang="ts">
import type { PageProps } from "./$types";
import { loadIncludedPuzzle } from "../../../loadPuzzle";
import SudokuApp from "../../../SudokuApp/SudokuApp.svelte";

const { data }: PageProps = $props();
const { appData, presence, sessionClient } = data;
// loadIncludedPuzzle(appData.root.grid, 0);

// let presence = $state<SvelteMap<CoordinateString, boolean>>(new SvelteMap());
</script>

<div class="p-8">
  <SudokuApp data={appData.root} {presence} {sessionClient} />
</div>
