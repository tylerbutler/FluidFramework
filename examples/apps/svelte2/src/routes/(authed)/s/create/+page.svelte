 <script lang="ts">
import type { PageProps } from "./$types";
import { createAttachedFluidContainer } from "../../../../fluid/init";
import { isRedirect, redirect } from "@sveltejs/kit";

const { data }: PageProps = $props();
const { client } = data;

let loadState = $state("Creating new Fluid container...");;
let containerId = $state("");

createAttachedFluidContainer(client)
	.then(async ({ containerId: id, container }) => {
		loadState = "Loading Fluid container...";
		containerId = id;
		window.location.href = `/s/${id}`;
	});

</script>

<div>
	{loadState}
</div>
