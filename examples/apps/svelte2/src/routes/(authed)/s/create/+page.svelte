 <script lang="ts">
import type { PageProps } from "./$types";
import { createAttachedFluidContainer } from "$lib/fluid/init";

const { data }: PageProps = $props();
const { client } = data;

let loadState = $state("Creating new Fluid container...");

createAttachedFluidContainer(client).then(async ({ containerId }) => {
	loadState = "Loading Fluid container...";
	window.location.href = `/s/${containerId}`;
});
</script>

<div>
	{loadState}
</div>
