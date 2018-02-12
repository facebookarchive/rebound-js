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

import * as OrigamiValueConverter from './OrigamiValueConverter';
import BouncyConversion from './BouncyConversion';

/**
 * Maintains a set of tension and friction constants
 * for a Spring. You can use fromOrigamiTensionAndFriction to convert
 * values from the [Origami](http://facebook.github.io/origami/)
 * design tool directly to Rebound spring constants.
 * @public
 */
class SpringConfig {
  friction: number;
  tension: number;

  static DEFAULT_ORIGAMI_SPRING_CONFIG = SpringConfig.fromOrigamiTensionAndFriction(
    40,
    7,
  );

  /**
   * Convert an origami Spring tension and friction to Rebound spring
   * constants. If you are prototyping a design with Origami, this
   * makes it easy to make your springs behave exactly the same in
   * Rebound.
   * @public
   */
  static fromOrigamiTensionAndFriction(
    tension: number,
    friction: number,
  ): SpringConfig {
    return new SpringConfig(
      OrigamiValueConverter.tensionFromOrigamiValue(tension),
      OrigamiValueConverter.frictionFromOrigamiValue(friction),
    );
  }

  /**
   * Convert an origami PopAnimation Spring bounciness and speed to Rebound
   * spring constants. If you are using PopAnimation patches in Origami, this
   * utility will provide springs that match your prototype.
   * @public
   */
  static fromBouncinessAndSpeed(
    bounciness: number,
    speed: number,
  ): SpringConfig {
    const bouncyConversion = new BouncyConversion(bounciness, speed);
    return SpringConfig.fromOrigamiTensionAndFriction(
      bouncyConversion.bouncyTension,
      bouncyConversion.bouncyFriction,
    );
  }

  /**
   * Create a SpringConfig with no tension or a coasting spring with some
   * amount of Friction so that it does not coast infininitely.
   * @public
   */
  static coastingConfigWithOrigamiFriction(friction: number): SpringConfig {
    return new SpringConfig(
      0,
      OrigamiValueConverter.frictionFromOrigamiValue(friction),
    );
  }

  constructor(tension: number, friction: number) {
    this.tension = tension;
    this.friction = friction;
  }
}

export default SpringConfig;
