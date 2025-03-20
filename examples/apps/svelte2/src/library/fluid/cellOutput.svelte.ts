import { CoordinateString } from "$lib/coordinate";
import { SudokuNumber } from "$lib/sudokuNumber";
import { Tree } from "fluid-framework";
import { schemaFactory as sf } from "./schemaFactory.js";
import { CellData } from "./cellInput";

export class ReactiveCellData
	extends sf.object("ReactiveCellData", {
		_value: sf.number,
		_correctValue: sf.number,
		_startingClue: sf.boolean,
		_coordinate: sf.string,
	})
	implements CellData
{
	#value = $state(this._value);

	get value() {
		return this.#value as SudokuNumber;
	}

	set value(v) {
		this._value = v;
	}

	#correctValue = $state(this._correctValue);

	get correctValue() {
		return this.#correctValue as SudokuNumber;
	}

	set correctValue(v) {
		this._correctValue = v;
	}

	#startingClue = $state(this._startingClue);

	get startingClue() {
		return this.#startingClue as boolean;
	}

	set startingClue(v) {
		this._startingClue = v;
	}

	#coordinate = $state(this._coordinate);

	get coordinate() {
		return this.#coordinate as CoordinateString;
	}

	#wireReactiveProperties = (() => {
		Tree.on(this, "nodeChanged", () => {
			this.refreshReactiveProperties();
		});
	})();

	refreshReactiveProperties(): void {
		this.#value = this._value;
		this.#correctValue = this._correctValue;
		this.#startingClue = this._startingClue;
		this.#coordinate = this._coordinate;
	}
}
