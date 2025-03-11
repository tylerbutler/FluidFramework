import { mapStringToColor, type ColorType } from "./colors";
import type { User } from "@clerk/backend";

export interface ClerkUserProperties extends Pick<User, "id" | "fullName"> {}

export class ClerkUserProperties implements ClerkUserProperties {}

export interface SudokuUser extends ClerkUserProperties {
	color: ColorType;
}

export class SudokuAppUser implements SudokuUser {
	public id = $state("");
	public fullName = $state("");
	public color = $derived(mapStringToColor(this.fullName));

	constructor(metadata: ClerkUserProperties) {
		this.id = metadata.id;
		this.fullName = metadata.fullName ?? metadata.id;
	}
}
