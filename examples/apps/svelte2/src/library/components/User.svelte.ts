import type { User } from "@clerk/backend";
import { mapStringToColor, type ColorType } from "$lib/colors";

export interface ClerkUserProperties extends Pick<User, "id" | "username" | "fullName"> {
	name: string;
}

export type LeveeServiceUser = ClerkUserProperties;

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
