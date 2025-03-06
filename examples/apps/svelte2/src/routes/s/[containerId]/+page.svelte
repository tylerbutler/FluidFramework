<script lang="ts">
import type { PageProps } from "./$types";
import SudokuApp from "../../../SudokuApp/SudokuApp.svelte";

const { data }: PageProps = $props();
const { appData, presence } = data;
</script>

<div class="p-8">
  <SudokuApp data={appData.root} {presence} sessionClient={presence.getMyself()}
  />
</div>
