<script lang="ts">
import type { PageProps } from "./$types";
import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";
import SudokuApp from "../../../SudokuApp/SudokuApp.svelte";

const { data }: PageProps = $props();
const { appData, presence } = data;
</script>

<div class="p-8">
  <SignedIn let:user>
    <SudokuApp data={appData.root} {presence} sessionClient={presence.getMyself()} {user}
    />
  </SignedIn>
  <SignedOut>
    You need to be signed in.
  </SignedOut>
</div>
