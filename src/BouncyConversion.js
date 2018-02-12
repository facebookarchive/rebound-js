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
 * Provides math for converting from Origami PopAnimation
 * config values to regular Origami tension and friction values. If you are
 * trying to replicate prototypes made with PopAnimation patches in Origami,
 * then you should create your springs with
 * SpringSystem.createSpringWithBouncinessAndSpeed, which uses this Math
 * internally to create a spring to match the provided PopAnimation
 * configuration from Origami.
 */
class BouncyConversion {
  bounciness: number;
  bouncyTension: number;
  bouncyFriction: number;
  speed: number;

  constructor(bounciness: number, speed: number) {
    this.bounciness = bounciness;
    this.speed = speed;

    let b = this.normalize(bounciness / 1.7, 0, 20.0);
    b = this.projectNormal(b, 0.0, 0.8);
    const s = this.normalize(speed / 1.7, 0, 20.0);

    this.bouncyTension = this.projectNormal(s, 0.5, 200);
    this.bouncyFriction = this.quadraticOutInterpolation(
      b,
      this.b3Nobounce(this.bouncyTension),
      0.01,
    );
  }

  normalize(value: number, startValue: number, endValue: number): number {
    return (value - startValue) / (endValue - startValue);
  }

  projectNormal(n: number, start: number, end: number): number {
    return start + n * (end - start);
  }

  linearInterpolation(t: number, start: number, end: number) {
    return t * end + (1.0 - t) * start;
  }

  quadraticOutInterpolation(t: number, start: number, end: number): number {
    return this.linearInterpolation(2 * t - t * t, start, end);
  }

  b3Friction1(x: number): number {
    return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
  }

  b3Friction2(x: number): number {
    return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2;
  }

  b3Friction3(x: number): number {
    return (
      0.00000045 * Math.pow(x, 3) -
      0.000332 * Math.pow(x, 2) +
      0.1078 * x +
      5.84
    );
  }

  b3Nobounce(tension: number): number {
    let friction = 0;
    if (tension <= 18) {
      friction = this.b3Friction1(tension);
    } else if (tension > 18 && tension <= 44) {
      friction = this.b3Friction2(tension);
    } else {
      friction = this.b3Friction3(tension);
    }
    return friction;
  }
}

export default BouncyConversion;
