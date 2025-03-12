import { mapStringToColor, type ColorType } from "./colors";
import type { User } from "@clerk/backend";

export interface ClerkUserProperties extends Pick<User, "id" | "fullName"> {}

export class SudokuUser implements ClerkUserProperties {
	public id = $state("");
	public fullName = $state("");
	public color: ColorType = $derived(mapStringToColor(this.id));

	constructor({ id, fullName }: ClerkUserProperties) {
		this.id = id;
		this.fullName = fullName ?? "NO_FULL_NAME";
	}
}
