/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import type SpringSystem from './SpringSystem';
import * as util from './util';

/**
 * Plays each frame of the SpringSystem on animation
 * timing loop. This is the default type of looper for a new spring system
 * as it is the most common when developing UI.
 * @public
 */
export class AnimationLooper {
  springSystem: ?SpringSystem = null;

  run() {
    const springSystem = getSpringSystem.call(this);

    util.onFrame(() => {
      springSystem.loop(Date.now());
    });
  }
}

/**
 * Resolves the SpringSystem to a resting state in a
 * tight and blocking loop. This is useful for synchronously generating
 * pre-recorded animations that can then be played on a timing loop later.
 * Sometimes this lead to better performance to pre-record a single spring
 * curve and use it to drive many animations; however, it can make dynamic
 * response to user input a bit trickier to implement.
 * @public
 */
export class SimulationLooper {
  springSystem: ?SpringSystem = null;
  timestep: number;
  time: number = 0;
  running: boolean = false;

  constructor(timestep: number) {
    this.timestep = timestep || 16.667;
  }

  run() {
    const springSystem = getSpringSystem.call(this);

    if (this.running) {
      return;
    }
    this.running = true;
    while (!springSystem.getIsIdle()) {
      springSystem.loop((this.time += this.timestep));
    }
    this.running = false;
  }
}

/**
 * Resolves the SpringSystem one step at a
 * time controlled by an outside loop. This is useful for testing and
 * verifying the behavior of a SpringSystem or if you want to control your own
 * timing loop for some reason e.g. slowing down or speeding up the
 * simulation.
 * @public
 */
export class SteppingSimulationLooper {
  springSystem: ?SpringSystem = null;
  timestep: number;
  time: number = 0;
  running: boolean = false;

  run() {
    // this.run is NOOP'd here to allow control from the outside using
    // this.step.
  }

  // Perform one step toward resolving the SpringSystem.
  step(timestep: number) {
    const springSystem = getSpringSystem.call(this);
    springSystem.loop((this.time += timestep));
  }
}

function getSpringSystem(): SpringSystem {
  if (this.springSystem == null) {
    throw new Error('cannot run looper without a springSystem');
  }
  return this.springSystem;
}
