import { setContext, getContext } from "svelte";
import type { SudokuClientUser } from "$lib/components/User.svelte";
import {
	SelectionManagerContextKey,
	SudokuUserContextKey,
	UserMetadataManagerContextKey,
} from "$lib/constants";
import type { SelectionManager, UserMetadataManager } from "./components/props";

export function setUser(user: SudokuClientUser) {
	setContext(SudokuUserContextKey, user);
}

export function getUser(): SudokuClientUser {
	return getContext<SudokuClientUser>(SudokuUserContextKey);
}

export function setUserMetadataManager(userMetadataManager: UserMetadataManager) {
	setContext(UserMetadataManagerContextKey, userMetadataManager);
}

export function getUserMetadataManager(): UserMetadataManager {
	return getContext<UserMetadataManager>(UserMetadataManagerContextKey);
}

export function setSelectionManager(selectionManager: SelectionManager) {
	setContext(SelectionManagerContextKey, selectionManager);
}

export function getSelectionManager(): SelectionManager {
	return getContext<SelectionManager>(SelectionManagerContextKey);
}
