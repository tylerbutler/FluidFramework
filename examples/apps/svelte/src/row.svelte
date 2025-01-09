<script lang="ts">
import { Coordinate, type CoordinateString } from "./helpers/coordinate";

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
