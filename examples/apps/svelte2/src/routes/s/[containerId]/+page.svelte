<script lang="ts">
import type { PageProps } from "./$types";
import { SignedIn, SignedOut } from "svelte-clerk";
import SudokuApp from "../../../SudokuApp/SudokuApp.svelte";

const { data }: PageProps = $props();
const { appData, presence } = data;
</script>

<div class="p-8">
  <SignedIn>
    <SudokuApp data={appData.root} {presence} sessionClient={presence.getMyself()}
    />
  </SignedIn>
  <SignedOut>
    You need to be signed in.
  </SignedOut>
</div>
