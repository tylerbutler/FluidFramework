import { Package } from "@fluidframework/build-tools";
import { PackageCommand } from "../BasePackageCommand";
// import { PackageWithKind } from "../filter";
// import { BaseCommand } from "../base";

export default class PackagesCommand extends PackageCommand<typeof PackagesCommand> {
	static readonly summary = ``;
	static readonly description = ``;

	// hide the command from help since it's only supposed to be used for internal testing
	// static readonly hidden = true;

	static readonly enableJsonFlag = true;

	protected async processPackage(pkg: Package): Promise<void> {
		// this.log(`${pkg.name} - ${pkg.kind} - ${pkg.group}`);
	}

	// protected async processPackages(packages: PackageWithKind[]): Promise<void> {
	// 	let i = 0;
	// 	for (const pkg of this.filteredPackages ?? []) {
	// 		this.log(`${i}: ${pkg.name} - ${pkg.kind} - ${pkg.group}`);
	// 		i++;
	// 	}
	// }

	public async run(): Promise<{ packages: Package[] }> {
		const context = await this.getContext();

		for (const [wsName, workspace] of context.repo.workspaces) {
			this.log(wsName);
			for (const group of workspace.releaseGroups) {
				this.logIndent(group);
			}
		}

		// for (const group of context.repo.groups) {
		// 	this.log(group);
		// }

		// await super.run();
		return { packages: context.repo.packages.packages };

		// const pkgs = {
		// 	selected: this.selectedPackages.map((p) => {
		// 		return {
		// 			name: p.name,
		// 			directory: context.repo.relativeToRepo(p.directory),
		// 		};
		// 	}),
		// 	filtered: this.filteredPackages.map((p) => {
		// 		return {
		// 			name: p.name,
		// 			directory: context.repo.relativeToRepo(p.directory),
		// 		};
		// 	}),
		// };

		// return pkgs;
	}
}
