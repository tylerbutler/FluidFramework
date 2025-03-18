import { setContext, getContext } from "svelte";
import { mapStringToColor, type ColorType } from "$lib/colors";
import type { User } from "@clerk/backend";
import { SudokuUserContextKey } from "$lib/constants";

export interface ClerkUserProperties extends Pick<User, "id" | "username" | "fullName"> {
	name: string;
}

export type LeveeServiceUser = ClerkUserProperties;

export function setUserContext(user: SudokuClientUser) {
	setContext(SudokuUserContextKey, user);
}

export function getUserContext(): SudokuClientUser {
	return getContext<SudokuClientUser>(SudokuUserContextKey);
}

export type SudokuClientUser = ClerkUserProperties & { color: ColorType };

export const createNewUser = (props: ClerkUserProperties): SudokuClientUser => {
	return {
		id: props.id,
		username: props.username,
		fullName: props.fullName,
		name: props.name,
		color: mapStringToColor(props.id),
	};
};
