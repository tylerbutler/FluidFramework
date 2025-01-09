<script lang="ts">
import { Coordinate, type CoordinateString } from "./helpers/coordinate";

/**
 * Returns CSS border properties to use when rendering a cell. This helps give the grid that authentic Sudoku look.
 */
function getCellBorderStyles(coord: CoordinateString): React.CSSProperties {
	const borderStyle = "solid medium";
	const styles: React.CSSProperties = {
		borderTop: "none",
		borderBottom: "none",
		borderLeft: "none",
		borderRight: "none",
		borderColor: "var(--neutralPrimaryAlt)",
	};
	const [row, col] = Coordinate.asArrayNumbers(coord);

	switch (row) {
		case 0:
		case 3:
		case 6:
			styles.borderTop = borderStyle;
			styles.paddingTop = 4;
			break;
		case 2:
		case 5:
		case 8:
			styles.borderBottom = borderStyle;
			styles.paddingBottom = 4;
			break;
		default: // Nothing
	}

	switch (col) {
		case 0:
		case 3:
		case 6:
			styles.borderLeft = borderStyle;
			styles.paddingLeft = 4;
			break;
		case 2:
		case 5:
		case 8:
			styles.borderRight = borderStyle;
			styles.paddingRight = 4;
			break;
		default: // Nothing
	}
	return styles;
}
</script>

<td class="sudoku-cell" style={getCellBorderStyles(coord)}>
	<input
		id={`${props.clientId}-${coord}`}
		class={inputClasses}
		type="text"
		readOnly={true}
		onFocus={handleInputFocus}
		onBlur={handleInputBlur}
		onKeyDown={handleKeyDown}
		value={SudokuCell.getDisplayString(currentCell)}
		max={1}
		// Disabled={disabled}
		data-cellcoordinate={coord}
	/>
</td>
