/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { sm } from "jssm";
import { StateMachine } from "./machines";

/**
 * The state machine definitions in this file are written in Finite State Language (FSL), which is documented at
 * {@link https://fsl.tools/}.
 *
 * They can be visualized using the browser-based tool at
 * {@link https://stonecypher.github.io/jssm-viz-demo/graph_explorer.html}. Just copy/paste the FSL string for the
 * machine into the editor.
 */

/**
 * An FSL state machine that encodes the Fluid release process.
 *
 * @alpha
 */
export const UnifiedReleaseMachineDefinition = sm`
 machine_name: "Fluid Unified Release Process";

 Init 'success'
 => CheckShouldRunChecks 'success'
 => CheckValidReleaseGroup 'success'
 => CheckPolicy 'success'
 => CheckBranchName 'success'
 => CheckHasRemote 'success'
 => CheckBranchUpToDate 'success'
 => CheckNoPrereleaseDependencies 'success'
 => CheckReleaseBranchDoesNotExist 'success'
 => CheckInstallBuildTools 'success'
 => DoReleaseGroupBumpMinor 'success'
 => CheckShouldCommitBump 'success'
 => PromptToPRBump;

 CheckShouldRunChecks 'failure'
 => CheckNoPrereleaseDependencies;

 [
 Init
 CheckValidReleaseGroup
 CheckPolicy
 CheckBranchName
 CheckHasRemote
 CheckBranchUpToDate
 CheckReleaseBranchDoesNotExist
 CheckInstallBuildTools
 ] 'failure' => Failed;

 CheckNoPrereleaseDependencies 'failure'
 // for DoBumpReleasedDependencies, success means that there were none to bump
 // failure means there were bumps and thus local changes that need to be merged
 => DoBumpReleasedDependencies 'success'
 => CheckNoMorePrereleaseDependencies 'success'
 => CheckShouldCommitDeps 'success'
 => PromptToPRDeps;

 [
 DoReleaseGroupBumpMinor
 ] 'failure' => Failed;

 CheckShouldCommitBump 'failure'
 => PromptToCommitBump;

 CheckShouldCommitDeps 'failure'
 => PromptToCommitDeps;

 DoBumpReleasedDependencies 'failure'
 => CheckNoPrereleaseDependencies2 'failure'
 => PromptToReleaseDeps;

 CheckNoPrereleaseDependencies2 'success'
 => CheckShouldCommitReleasedDepsBump 'success'
 => PromptToPRReleasedDepsBump;

 CheckNoMorePrereleaseDependencies 'failure'
 => PromptToReleaseDeps;

 CheckShouldCommitReleasedDepsBump 'failure'
 => PromptToCommitReleasedDepsBump;

 [
 DoBumpReleasedDependencies
 ] ~> Failed;

 // visual styling
 state DoReleaseGroupBumpMinor: {
     background-color : steelblue;
     text-color       : white;
 };

 state DoBumpReleasedDependencies: {
     background-color : steelblue;
     text-color       : white;
 };

 state PromptToCommitReleasedDepsBump: {
     background-color : #ffdddd;
     text-color       : black;
 };

 state PromptToPRReleasedDepsBump: {
     background-color : #ffdddd;
     text-color       : black;
 };
 `;

export const UnifiedReleaseMachine: StateMachine = {
    knownActions: ["success", "failure"],
    knownStates: [
    ],
    machine: UnifiedReleaseMachineDefinition,
};
