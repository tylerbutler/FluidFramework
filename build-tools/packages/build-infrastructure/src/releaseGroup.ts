import type { PackageJson } from "type-fest";
import type { IPackage, IReleaseGroup, ReleaseGroupName } from "./interfaces";

export class ReleaseGroup implements IReleaseGroup {
	public readonly name: ReleaseGroupName;
	public constructor(name: string) {
		this.name = name as ReleaseGroupName;
	}

	packages: IPackage<PackageJson>[];
}
