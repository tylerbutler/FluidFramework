/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DataObjectFactory } from "@fluidframework/aqueduct";
import { IEvent } from "@fluidframework/common-definitions";
import { SharedCell } from "@fluidframework/cell";
import { SharedMap } from "@fluidframework/map";
import { SharedObjectSequence, SharedString } from "@fluidframework/sequence";
import { TodoItem } from "../TodoItem";

import { TodoName } from "./Todo";
import { Todo } from "./index";

export const TodoInstantiationFactory =
    // eslint-disable-next-line @typescript-eslint/ban-types
    new DataObjectFactory<Todo, object, undefined, IEvent>(
        TodoName,
        Todo,
        [
            SharedMap.getFactory(),
            SharedString.getFactory(),
            SharedCell.getFactory(),
            SharedObjectSequence.getFactory(),
        ],
        {},
        new Map([
            TodoItem.getFactory().registryEntry,
        ]),
    );
