import type { CellCoordinate } from "$lib/coordinate";
import {
	Tree,
	type ImplicitFieldSchema,
	type NodeFromSchema,
	type SchemaFactory,
} from "fluid-framework";
import { schemaFactory } from "./schemaFactory";

export interface CellData {
	value: number;
	correctValue: number;
	startingClue: boolean;
	coordinate: Readonly<CellCoordinate>;
}

export const initialData: CellData = {
	value: 0,
	correctValue: 0,
	startingClue: false,
	coordinate: [0, 0],
};

export function createSchemaClass<T extends { readonly [x: string]: ImplicitFieldSchema }>(
	sf: SchemaFactory,
	className: string,
	initialData: T,
) {
	const schema = sf.object(className, initialData);
	type schema = NodeFromSchema<typeof schema>;

	class EchoChamber {
		public constructor(data: T) {
			const node = new schema(data as any);
			this.createReactiveProperties(data);
			Tree.on(node, "nodeChanged", () => {
				this.refreshReactiveProperties();
			});
		}
		private createReactiveProperties(data: T) {
			const properties = Object.getOwnPropertyNames(data);
			properties.forEach((prop) => {
				const privateProp = `#${prop}`;
				Object.defineProperty(this, privateProp, {
					value: (this as any)[prop],
					writable: true,
					enumerable: false,
					configurable: true,
				});

				Object.defineProperty(this, prop, {
					get: () => (this as any)[privateProp],
					set: (value) => {
						(this as any)[prop] = value;
						(this as any)[privateProp] = value;
					},
					enumerable: true,
					configurable: true,
				});
			});
		}

		private refreshReactiveProperties(data: T): void {
			const properties = Object.getOwnPropertyNames(data);
			for (const propName of properties) {
				const privatePropName = `#${propName}`;
				(this as any)[propName] = (this as any)[privatePropName];
			}
		}
	}

	return new EchoChamber(initialData);
}
