<script lang="ts">
	import type { PageProps } from "./$types";
	// import Sudoku from "../Sudoku.svelte";
	// import { loadIncludedPuzzle } from "../helpers/sudokuPuzzle.svelte";
	import { redirect } from "@sveltejs/kit";

	const { data }: PageProps = $props();
	// const { presence, sessionClientId } = data;
	const { containerId } = data;

	// let puzzle = loadIncludedPuzzle(0);
	redirect(301, `/${containerId}`);

</script>

<!-- <Sudoku {puzzle} {presence} {sessionClientId} /> -->
