/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	IDocumentService,
	IDocumentStorageService,
} from "@fluidframework/driver-definitions/internal";

import { DocumentServiceProxy } from "../../documentServiceProxy.js";

import { ICompressionStorageConfig } from "./compressionTypes.js";
import { DocumentStorageServiceCompressionAdapter as DocumentStorageServiceSummaryBlobCompressionAdapter } from "./summaryblob/index.js";

export class DocumentServiceCompressionAdapter extends DocumentServiceProxy {
	constructor(
		service: IDocumentService,
		private readonly _config: ICompressionStorageConfig,
	) {
		super(service);
		// Back-compat Old driver
		if (service.on !== undefined) {
			service.on("metadataUpdate", (metadata: Record<string, string>) =>
				// TypeScript doesn't see emit() on DocumentServiceCompressionAdapter, but it exists via base class
				// @ts-expect-error TS2339 - emit() exists at runtime via inheritance from EventEmitter
				this.emit("metadataUpdate", metadata),
			);
		}
	}

	public async connectToStorage(): Promise<IDocumentStorageService> {
		const storage = await super.connectToStorage();
		const wrapped = new DocumentStorageServiceSummaryBlobCompressionAdapter(
			storage,
			this._config,
		);
		await wrapped.getSnapshotTree();
		return wrapped;
	}
}
