<script lang="ts">
	import { afterNavigate } from "$app/navigation";

	import "../app.css";
	import "../sudoku.css";

	let { children } = $props();

	afterNavigate(() => {
		window.HSStaticMethods.autoInit();
	});

<span class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
  <span class="size-1.5 inline-block rounded-full bg-blue-800 dark:bg-blue-500"></span>
  Badge
</span>
