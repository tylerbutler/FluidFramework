import { BaseCommand } from "@fluid-tools/build-cli";
import { Flags } from "@oclif/core";

export default class DoctorCommand extends BaseCommand<typeof DoctorCommand> {
	static readonly summary =
		"Checks a project for common dependency and configuration problems when using the Fluid Framework.";

	static flags = {
		name: Flags.string({
			char: "n",
			summary: "Name to print.",
			required: true,
		}),
	} as const;

	public async run(): Promise<void> {
		for (const [flag, value] of Object.entries(this.flags)) {
			this.log(`${flag}: ${value}`);
		}
	}
}
