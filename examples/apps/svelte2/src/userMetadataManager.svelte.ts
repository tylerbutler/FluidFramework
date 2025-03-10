import type { SudokuAppUser } from "./user.svelte";
import { PresenceWorkspaceManager } from "./presenceManager";

export class UserMetadataManager extends PresenceWorkspaceManager<SudokuAppUser> {}
