import type { SudokuUser } from "./User.svelte";
import { PresenceWorkspaceManager } from "./PresenceWorkspaceManager.svelte";

export class UserMetadataManager extends PresenceWorkspaceManager<SudokuUser> {}
