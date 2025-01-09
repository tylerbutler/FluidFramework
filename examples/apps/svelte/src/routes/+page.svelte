<script lang="ts">
import { loadPuzzle, type PuzzleGrid } from "../helpers/puzzles";
import Sudoku from "../Sudoku.svelte";

let puzzle: PuzzleGrid = new Map();
loadPuzzle(0, puzzle);

</script>

<Sudoku {puzzle} />
