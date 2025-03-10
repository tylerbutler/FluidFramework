import { mapStringToColor } from "./colors";

export interface SudokuUser {
	fullName: string;
	color: string;
}

export class SudokuAppUser implements SudokuUser {
	public fullName = $state("");
	public color = $derived(mapStringToColor(this.fullName));

	constructor(fullName: string) {
		this.fullName = fullName;
	}
}
