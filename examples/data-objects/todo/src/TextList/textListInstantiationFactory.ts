/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DataObjectFactory } from "@fluidframework/aqueduct";
import { IEvent } from "@fluidframework/common-definitions";
import { SharedString } from "@fluidframework/sequence";
import { TextListName } from "./TextList";
import { TextList } from "./index";

// eslint-disable-next-line @typescript-eslint/ban-types
export const TextListInstantiationFactory = new DataObjectFactory<TextList, object, undefined, IEvent>(
    TextListName,
    TextList,
    [
        SharedString.getFactory(),
    ],
    {});
