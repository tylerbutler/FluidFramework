import { isSudokuNumber, type SudokuNumber } from "$lib/sudokuNumber";
import type {
	ExcludeUnderscoreProperties,
	ReplaceUnderscoreProperties,
} from "$lib/utilityTypes";
import { Tree, type ImplicitFieldSchema, type NodeFromSchema, type RestrictiveStringRecord, type SchemaFactory, type TreeNodeSchemaClass } from "fluid-framework";
import { CellPersistedData } from "./cellData.svelte";

// sf.object("CellPersistedData", {
// 	/**
// 	 * The value stored in the cell. This should be a value between 0 and 9 inclusive. 0 represents an empty cell.
// 	 */
// 	_value: sf.number,

// 	/**
// 	 * The correct value of the cell.
// 	 */
// 	_correctValue: sf.number,

// 	/**
// 	 * True if the cell's value is provided as part of the starting clues for the puzzle; false otherwise.
// 	 */
// 	_startingClue: sf.boolean,

// 	/**
// 	 * The coordinate of the cell in the Sudoku grid, stored as a 2-item array. The first number is row in which the cell
// 	 * is positioned, while the second is the column. The coordinate system is 0-based starting at the upper left; that
// 	 * is, `[0,0]` represents the upper-leftmost cell, `[0,1]` is to its immediate right, etc.
// 	 */
// 	_coordinate: sf.array(sf.number),
// });

export class EchoChamber {
	public static create<V extends RestrictiveStringRecord<ImplicitFieldSchema>>(
		schemaFactory: SchemaFactory,
		className: string,
		initialData: V,
	) {
		// const SchemaClass = schemaFactory.object(className, initialData);
		// type SchemaClass = NodeFromSchema<typeof SchemaClass>;

		class SchemaClass extends schemaFactory.object(className, initialData as any){}

		class EchoClass extends SchemaClass {
			public constructor(data: ConstructorParameters<SchemaClass>[0]) {
				super(data);
				this.createReactiveProperties();
				Tree.on(this, "nodeChanged", () => {
					this.refreshReactiveProperties();
				});
			}

			private reactivePropNames: string[] = [];
			private createReactiveProperties() {
				const properties = Object.getOwnPropertyNames(this);
				properties.forEach((prop) => {
					if (prop.startsWith("_")) {
						const privateProp = `#${prop.slice(1)}`;
						Object.defineProperty(this, privateProp, {
							value: (this as any)[prop],
							writable: true,
							enumerable: false,
							configurable: true,
						});

						Object.defineProperty(this, prop.slice(1), {
							get: () => (this as any)[privateProp],
							set: (value) => {
								(this as any)[prop] = value;
								(this as any)[privateProp] = value;
							},
							enumerable: true,
							configurable: true,
						});
						this.reactivePropNames.push(prop.slice(1));
					}
				});
			}

			private refreshReactiveProperties(): void {
				for (const propName of this.reactivePropNames) {
					const privatePropName = `#${propName}`;
					(this as any)[propName] = (this as any)[privatePropName];
				}
			}
		}

		return new EchoClass(initialData);
	}
}

// const SudokuCellEcho = EchoChamber.create(CellPersistedData, SudokuCellViewData);

// Usage example
const cellData: EchoChamber.create({
	_value: 5,
	_correctValue: 5,
	_startingClue: true,
	_coordinate: [0, 0],
});

// console.log(cellData.value); // Access the dynamically created property
