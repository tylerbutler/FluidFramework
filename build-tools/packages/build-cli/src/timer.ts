/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Logger } from "./logging";

export class Timer {
	private lastTime: number = Date.now();
	private totalTime: number = 0;

	// eslint-disable-next-line no-useless-constructor
	constructor(private readonly enabled: boolean, private readonly logger: Logger) {}

	public time(msg?: string, print?: boolean) {
		const currTime = Date.now();
		const diffTime = currTime - this.lastTime;
		this.lastTime = currTime;
		const diffTimeInSeconds = diffTime / 1000;
		if (msg !== undefined) {
			if (this.enabled) {
				if (diffTime > 100) {
					this.logger.log(`${msg} - ${diffTimeInSeconds.toFixed(3)}s`);
				} else {
					this.logger.log(`${msg} - ${diffTime}ms`);
				}
			} else if (print === true) {
				this.logger.log(msg);
			}
		}
		this.totalTime += diffTime;
		return diffTimeInSeconds;
	}

	public getTotalTime() {
		return this.totalTime;
	}
}
