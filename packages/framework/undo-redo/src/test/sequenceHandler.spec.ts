/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";

import { SharedString } from "@fluidframework/sequence/internal";
import {
	MockContainerRuntimeFactory,
	MockFluidDataStoreRuntime,
	MockStorage,
} from "@fluidframework/test-runtime-utils/internal";

import { SharedSegmentSequenceUndoRedoHandler } from "../sequenceHandler.js";
import { UndoRedoStackManager } from "../undoRedoStackManager.js";

const text =
	"The SharedSegmentSequenceRevertible does the heavy lifting of tracking and reverting changes on the underlying SharedSegmentSequence. This is accomplished via TrackingGroup objects.";

function insertTextAsChunks(sharedString: SharedString, targetLength = text.length): number {
	let chunks = 0;
	while (sharedString.getLength() < targetLength && sharedString.getLength() < text.length) {
		const len = (sharedString.getLength() % 13) + 1;
		sharedString.insertText(
			sharedString.getLength(),
			text.slice(sharedString.getLength(), sharedString.getLength() + len),
		);
		chunks++;
	}
	return chunks;
}
function deleteTextByChunk(sharedString: SharedString, targetLength = 0): number {
	let chunks = 0;
	while (sharedString.getLength() > targetLength && sharedString.getLength() > 0) {
		const len = (sharedString.getLength() % 17) + 1;
		sharedString.removeText(
			Math.max(sharedString.getLength() - len, 0),
			sharedString.getLength(),
		);
		chunks++;
	}
	return chunks;
}

describe("SharedSegmentSequenceUndoRedoHandler", () => {
	const documentId = "fakeId";
	let containerRuntimeFactory: MockContainerRuntimeFactory;
	let sharedString: SharedString;
	let undoRedoStack: UndoRedoStackManager;

	beforeEach(() => {
		const dataStoreRuntime = new MockFluidDataStoreRuntime({
			registry: [SharedString.getFactory()],
		});

		containerRuntimeFactory = new MockContainerRuntimeFactory();
		containerRuntimeFactory.createContainerRuntime(dataStoreRuntime);
		const services = {
			deltaConnection: dataStoreRuntime.createDeltaConnection(),
			objectStorage: new MockStorage(undefined),
		};

		sharedString = SharedString.create(dataStoreRuntime, documentId);
		sharedString.initializeLocal();
		sharedString.bindToContext();
		sharedString.connect(services);

		undoRedoStack = new UndoRedoStackManager();
	});

	it("Undo and Redo Delete", () => {
		insertTextAsChunks(sharedString);
		const handler = new SharedSegmentSequenceUndoRedoHandler(undoRedoStack);
		handler.attachSequence(sharedString);

		deleteTextByChunk(sharedString);

		assert.equal(sharedString.getText(), "");

		while (undoRedoStack.undoOperation()) {
			// intentionally empty
		}

		assert.equal(sharedString.getText(), text);

		while (undoRedoStack.redoOperation()) {
			// intentionally empty
		}

		assert.equal(sharedString.getText(), "");
	});

	it("Undo and Redo Insert", () => {
		const handler = new SharedSegmentSequenceUndoRedoHandler(undoRedoStack);
		handler.attachSequence(sharedString);
		insertTextAsChunks(sharedString);

		assert.equal(sharedString.getText(), text);

		while (undoRedoStack.undoOperation()) {
			// intentionally empty
		}

		assert.equal(sharedString.getText(), "");

		while (undoRedoStack.redoOperation()) {
			// intentionally empty
		}

		assert.equal(sharedString.getText(), text);
	});

	it("Undo and Redo Insert & Delete", () => {
		const handler = new SharedSegmentSequenceUndoRedoHandler(undoRedoStack);
		handler.attachSequence(sharedString);
		for (let i = 1; i < text.length; i *= 2) {
			insertTextAsChunks(sharedString, text.length - i);
			deleteTextByChunk(sharedString, i);
		}
		const finalText = sharedString.getText();

		assert.equal(sharedString.getText(), finalText);

		while (undoRedoStack.undoOperation()) {
			// intentionally empty
		}

		assert.equal(sharedString.getText(), "");

		while (undoRedoStack.redoOperation()) {
			// intentionally empty
		}

		assert.equal(sharedString.getText(), finalText, sharedString.getText());
	}).timeout(4000); // double the default timeout. This test is a bit slow.

	it("Undo and redo insert of split segment", () => {
		const handler = new SharedSegmentSequenceUndoRedoHandler(undoRedoStack);
		handler.attachSequence(sharedString);

		// insert all text as a single segment
		sharedString.insertText(0, text);

		containerRuntimeFactory.processAllMessages();

		// this will split that into three segment
		sharedString.walkSegments(() => true, 20, 30, undefined, true);

		assert.equal(sharedString.getText(), text);

		// undo and redo split insert
		undoRedoStack.undoOperation();
		undoRedoStack.redoOperation();

		assert.equal(sharedString.getText(), text);
	});
});
