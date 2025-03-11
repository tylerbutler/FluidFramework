<script lang="ts">
import { SignedIn, SignedOut } from "svelte-clerk";
import type { PageProps } from "./$types";
import { setContext } from "svelte";
import { SudokuAppUser } from "../user.svelte";
import { SudokuUserKey } from "../constants";

const { data }: PageProps = $props();
const { clerkUser } = data;

if (clerkUser === undefined) {
	throw new Error("sudokuUser is undefined");
}

const sudokuUser = new SudokuAppUser(clerkUser);
setContext(SudokuUserKey, sudokuUser);
</script>

<div class="h-80 mt-[35px]">
<SignedIn>
	<p>Welcome, {sudokuUser.fullName}!</p>
</SignedIn>

<SignedOut>
	<p>You need to log in.</p>
</SignedOut>
</div>
