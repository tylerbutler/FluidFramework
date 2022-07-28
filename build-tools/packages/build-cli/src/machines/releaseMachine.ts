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
 */

export const ReleaseMachineDefinition = sm`
machine_name: "Fluid Release Process";

Init 'success'
=> CheckShouldRunChecks 'success'
=> CheckValidReleaseGroup 'success'
=> CheckPolicy 'success'
=> CheckBranchName 'success'
=> CheckHasRemote 'success'
=> CheckBranchUpToDate 'success'
=> CheckNoPrereleaseDependencies 'success'
=> CheckIfCurrentReleaseGroupIsReleased 'success'
=> DoReleaseGroupBumpPatch 'success'
=> CheckShouldCommitBump 'success'
=> PromptToPRBump;

CheckShouldRunChecks 'failure'
=> CheckNoPrereleaseDependencies;

[
CheckValidReleaseGroup
CheckPolicy
CheckBranchName
CheckHasRemote
CheckBranchUpToDate
DoReleaseGroupBumpPatch
] 'failure' => Failed;

CheckNoPrereleaseDependencies 'failure'
// for DoBumpReleasedDependencies, success means that there were none to bump
// failure means there were bumps and thus local changes that need to be merged
=> DoBumpReleasedDependencies 'success'
=> CheckNoMorePrereleaseDependencies 'success'
=> CheckShouldCommitDeps 'success'
=> PromptToPRDeps;

DoBumpReleasedDependencies 'failure'
=> CheckNoPrereleaseDependencies2 'failure'
=> PromptToReleaseDeps;

CheckNoMorePrereleaseDependencies 'failure'
=> PromptToReleaseDeps;

CheckNoPrereleaseDependencies2 'success'
=> CheckShouldCommitReleasedDepsBump 'success'
=> PromptToPRReleasedDepsBump;

CheckShouldCommitBump 'failure'
=> PromptToCommitBump;

CheckShouldCommitDeps 'failure'
=> PromptToCommitDeps;

CheckIfCurrentReleaseGroupIsReleased 'failure'
=> PromptToRelease;

// visual styling
state DoReleaseGroupBumpPatch: {
    background-color : steelblue;
    text-color       : white;
};

state DoBumpReleasedDependencies: {
    background-color : steelblue;
    text-color       : white;
};
 `;

/**
 * A state machine that encodes the release process for a release group, including checking for prerelease dependencies
 * and requiring them to be released, updating said prerelease dependencies, and bumping the release group to the next
 * patch after release.
 */
export const ReleaseMachine: StateMachine = {
    knownActions: ["success", "failure"],
    knownStates: [
        "Init",
        "Failed",
        "CheckBranchName",
        "CheckBranchUpToDate",
        "CheckHasRemote",
        "CheckIfCurrentReleaseGroupIsReleased",
        "CheckNoPrereleaseDependencies",
        "CheckNoMorePrereleaseDependencies",
        "CheckPolicy",
        "CheckShouldCommitBump",
        "CheckShouldCommitDeps",
        "CheckShouldRunChecks",
        "CheckValidReleaseGroup",
        "DoBumpReleasedDependencies",
        "DoReleaseGroupBumpPatch",
        "PromptToCommitBump",
        "PromptToCommitDeps",
        "PromptToPRBump",
        "PromptToPRDeps",
        "PromptToRelease",
        "PromptToReleaseDeps",
    ],
    machine: ReleaseMachineDefinition,
};
