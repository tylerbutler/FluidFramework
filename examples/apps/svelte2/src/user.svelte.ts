import { setContext, getContext } from "svelte";
import { mapStringToColor, type ColorType } from "./colors";
import type { User } from "@clerk/backend";
import { SudokuUserContextKey } from "./constants";

export interface ClerkUserProperties extends Pick<User, "id" | "fullName"> {}

// export class SudokuUser implements ClerkUserProperties {
// 	public id = $state("");
// 	public fullName = $state("");
// 	public color: ColorType = $derived.by(()=>mapStringToColor(this.id));

// 	constructor({ id, fullName }: ClerkUserProperties) {
// 		this.id = id;
// 		this.fullName = fullName ?? "NO_FULL_NAME";
// 	}
// }

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
		fullName: props.fullName,
		color: mapStringToColor(props.id),
	};
};
