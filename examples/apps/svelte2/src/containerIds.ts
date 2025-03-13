import { createStorage } from "unstorage";
import driver from "unstorage/drivers/netlify-blobs";
// import driver from "unstorage/drivers/memory";
import localStorageDriver from "unstorage/drivers/localstorage";
import overlay from "unstorage/drivers/overlay";

const ls = localStorageDriver({ base: "fluid-sudoku-v0.0.0:" });
const blobs = driver({
	siteID: "8c495c14-22cd-45f4-acdf-de1bc9c49fb1",
	token: "nfp_azmpvqtvNbJfZudSktv7Lm7hPA2tK9Hkb671",
	name: "fluid-sudoku-json-uploads-v0.0.0",
	consistency: "strong",
});
const ol = overlay({
	layers: [ls, blobs],
});

const storage = createStorage({
	driver: ol,
});

export async function setContainerIdMapping(containerId: string, friendlyId: string) {
	return storage.set<string>(friendlyId, containerId);
}

export async function getContainerId(friendlyId: string) {
	return storage.get<string>(friendlyId);
}
