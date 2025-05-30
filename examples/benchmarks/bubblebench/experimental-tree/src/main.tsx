/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IClient } from "@fluid-example/bubblebench-common";
import { SharedTree, WriteFormat } from "@fluid-experimental/tree";
import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct/legacy";
import { IFluidHandle } from "@fluidframework/core-interfaces";

import { TreeObjectProxy } from "./proxy/index.js";
import { AppState } from "./state.js";

interface IApp {
	clients: IClient[];
}

/**
 * @internal
 */
export class Bubblebench extends DataObject {
	public static readonly Name = "@fluid-example/bubblebench-sharedtree";
	private maybeTree?: SharedTree = undefined;
	private maybeAppState?: AppState = undefined;

	protected async initializingFirstTime(): Promise<void> {
		const tree = (this.maybeTree = SharedTree.create(this.runtime));

		const p = TreeObjectProxy<IApp>(tree, tree.currentView.root, tree.applyEdit.bind(tree));
		p.clients = [];

		this.root.set("tree", this.maybeTree.handle);
	}

	protected async initializingFromExisting(): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.maybeTree = await this.root.get<IFluidHandle<SharedTree>>("tree")!.get();
	}

	protected async hasInitialized(): Promise<void> {
		this.maybeAppState = new AppState(
			this.tree,
			/* stageWidth: */ 640,
			/* stageHeight: */ 480,
			/* numBubbles: */ 1,
		);

		const onConnected = (): void => {
			// Out of paranoia, we periodically check to see if your client Id has changed and
			// update the tree if it has.
			setInterval(() => {
				const clientId = this.runtime.clientId;
				if (clientId !== undefined && clientId !== this.appState.localClient.clientId) {
					this.appState.localClient.clientId = clientId;
				}
			}, 1000);
		};

		// Wait for connection to begin checking client Id.
		if (this.runtime.connected) {
			onConnected();
		} else {
			this.runtime.once("connected", onConnected);
		}
	}

	private get tree(): SharedTree {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.maybeTree!;
	}

	public get appState(): AppState {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.maybeAppState!;
	}
}

/**
 * The DataObjectFactory declares the Fluid object and defines any additional distributed data structures.
 * To add a SharedSequence, SharedMap, or any other structure, put it in the array below.
 * @internal
 */
export const BubblebenchInstantiationFactory = new DataObjectFactory({
	type: Bubblebench.Name,
	ctor: Bubblebench,
	sharedObjects: [SharedTree.getFactory(WriteFormat.v0_1_1)],
});
