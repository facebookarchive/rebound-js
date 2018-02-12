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

/**
 * Consists of a position and velocity. A Spring uses
 * this internally to keep track of its current and prior position and
 * velocity values.
 */
class PhysicsState {
  position: number = 0;
  velocity: number = 0;
}

export default PhysicsState;
