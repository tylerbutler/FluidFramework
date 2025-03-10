<script lang="ts">
import { Navbar, NavBrand, NavUl, NavLi, Heading, uiHelpers } from "svelte-5-ui-lib";
import UserButton from "clerk-sveltekit/client/UserButton.svelte";
import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";
import logo from "$lib/assets/fluid-icon.svg";

import { page } from "$app/state";

import "../app.css";
import "../sudoku.css";

let { children } = $props();

let activeUrl = $state(page.url.pathname);
let nav = uiHelpers();
let navStatus = $state(false);
let toggleNav = nav.toggle;
let closeNav = nav.close;
$effect(() => {
	navStatus = nav.isOpen;
	activeUrl = page.url.pathname;
});
</script>

<div class="relative">
  <Navbar {toggleNav} {closeNav} {navStatus} navClass="absolute w-full z-20 top-0 start-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
    {#snippet brand()}
      <NavBrand siteName="Fluid Sudoku">
        <img width="30" src={logo} alt="Fluid Framework icon" />
      </NavBrand>
    {/snippet}

    <NavUl {activeUrl}>
			<SignedIn>
				<NavLi href="/create">New Session</NavLi>
				<NavLi><UserButton afterSignOutUrl="/" /></NavLi>
			</SignedIn>
			<SignedOut>
				<NavLi color="primary" href="/login">Log in</NavLi>
			</SignedOut>
    </NavUl>
  </Navbar>

	<Heading tag="h2">Fluid Sudoku</Heading>

	{@render children()}
</div>
