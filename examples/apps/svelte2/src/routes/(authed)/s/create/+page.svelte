 <script lang="ts">
import type { PageProps } from "./$types";
import { createAttachedFluidContainer } from "../../../../fluid/init";
import { redirect } from "@sveltejs/kit";

const { data }: PageProps = $props();
const { client } = data;

createAttachedFluidContainer(client)
	.then(async ({ containerId, container }) => {
		redirect(308, `/s/${containerId}`);
	})
	.catch((error) => {
		console.error("Error creating container:", error, error.stack);
	});
</script>
