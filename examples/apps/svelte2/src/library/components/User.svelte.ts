import { setContext, getContext } from "svelte";
import { mapStringToColor, type ColorType } from "$lib/colors";
import type { User } from "@clerk/backend";
import { SudokuUserContextKey } from "$lib/constants";

export interface ClerkUserProperties extends Pick<User, "id" | "username" | "fullName"> {
	name: string;
}

export type LeveeServiceUser = ClerkUserProperties;

export function setUserContext(user: SudokuUser) {
	setContext(SudokuUserContextKey, user);
}

export function getUserContext(): SudokuUser {
	return getContext<SudokuUser>(SudokuUserContextKey);
}

export type SudokuUser = ClerkUserProperties & { color: ColorType };

export const createNewUser = (props: ClerkUserProperties): SudokuUser => {
	return {
		id: props.id,
		username: props.username,
		fullName: props.fullName,
		name: props.name,
		color: mapStringToColor(props.id),
	};
};
