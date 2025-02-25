import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { containerSchema } from "./schema";

const client = new TinyliciousClient();

export async function createFluidContainer() {
	// The client will create a new detached container using the schema
	// A detached container will enable the app to modify the container before attaching it to the client
	const { container } = await client.createContainer(containerSchema, "2");

	// If the app is in a `createNew` state, and the container is detached, we attach the container.
	// This uploads the container to the service and connects to the collaboration session.
	// The newly attached container is given a unique ID that can be used to access the container in another session
	const containerId = await container.attach();
	return { containerId, container };

	// // Retrieve a reference to the presence APIs via the data object.
	// const presence = acquirePresenceViaDataObject(container.initialObjects.presence);
	// return { containerId: containerIdToReturn, container, presence };
}

export async function getFluidContainer(containerId: string) {
	// Use the unique container ID to fetch the container created earlier.  It will already be connected to the
	// collaboration session.
	const { container } = await client.getContainer(containerId, containerSchema, "2");
	return container;
}
