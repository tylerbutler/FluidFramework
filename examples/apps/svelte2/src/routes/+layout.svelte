<script lang="ts">
import "../app.css";
import "../sudoku.css";
let { children } = $props();

</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/yesvelte@next/css/tabler.min.css" />
</svelte:head>

{@render children()}
