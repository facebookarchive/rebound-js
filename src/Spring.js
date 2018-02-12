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
import type SpringConfig from './SpringConfig';
import type {SpringListener} from './types';

import PhysicsState from './PhysicsState';
import {removeFirst} from './util';

/**
 * Provides a model of a classical spring acting to
 * resolve a body to equilibrium. Springs have configurable
 * tension which is a force multipler on the displacement of the
 * spring from its rest point or `endValue` as defined by [Hooke's
 * law](http://en.wikipedia.org/wiki/Hooke's_law). Springs also have
 * configurable friction, which ensures that they do not oscillate
 * infinitely. When a Spring is displaced by updating it's resting
 * or `currentValue`, the SpringSystems that contain that Spring
 * will automatically start looping to solve for equilibrium. As each
 * timestep passes, `SpringListener` objects attached to the Spring
 * will be notified of the updates providing a way to drive an
 * animation off of the spring's resolution curve.
 * @public
 */
class Spring {
  static _ID: number = 0;
  static MAX_DELTA_TIME_SEC: number = 0.064;
  static SOLVER_TIMESTEP_SEC: number = 0.001;

  listeners: Array<SpringListener> = [];
  _startValue: number = 0;
  _id: string;
  _currentState = new PhysicsState();
  _displacementFromRestThreshold: number = 0.001;
  _endValue: number = 0;
  _overshootClampingEnabled: boolean = false;
  _previousState = new PhysicsState();
  _restSpeedThreshold: number = 0.001;
  _springConfig: SpringConfig;
  _springSystem: SpringSystem;
  _tempState = new PhysicsState();
  _timeAccumulator: number = 0;
  _wasAtRest: boolean = true;

  constructor(springSystem: SpringSystem) {
    this._id = 's' + Spring._ID++;
    this._springSystem = springSystem;
  }

  /**
   * Remove a Spring from simulation and clear its listeners.
   * @public
   */
  destroy(): void {
    this.listeners = [];
    this._springSystem.deregisterSpring(this);
  }

  /**
   * Get the id of the spring, which can be used to retrieve it from
   * the SpringSystems it participates in later.
   * @public
   */
  getId(): string {
    return this._id;
  }

  /**
   * Set the configuration values for this Spring. A SpringConfig
   * contains the tension and friction values used to solve for the
   * equilibrium of the Spring in the physics loop.
   * @public
   */
  setSpringConfig(springConfig: SpringConfig) {
    this._springConfig = springConfig;
    return this;
  }

  /**
   * Retrieve the SpringConfig used by this Spring.
   * @public
   */
  getSpringConfig(): SpringConfig {
    return this._springConfig;
  }

  /**
   * Set the current position of this Spring. Listeners will be updated
   * with this value immediately. If the rest or `endValue` is not
   * updated to match this value, then the spring will be dispalced and
   * the SpringSystem will start to loop to restore the spring to the
   * `endValue`.
   *
   * A common pattern is to move a Spring around without animation by
   * calling.
   *
   * ```
   * spring.setCurrentValue(n).setAtRest();
   * ```
   *
   * This moves the Spring to a new position `n`, sets the endValue
   * to `n`, and removes any velocity from the `Spring`. By doing
   * this you can allow the `SpringListener` to manage the position
   * of UI elements attached to the spring even when moving without
   * animation. For example, when dragging an element you can
   * update the position of an attached view through a spring
   * by calling `spring.setCurrentValue(x)`. When
   * the gesture ends you can update the Springs
   * velocity and endValue
   * `spring.setVelocity(gestureEndVelocity).setEndValue(flingTarget)`
   * to cause it to naturally animate the UI element to the resting
   * position taking into account existing velocity. The codepaths for
   * synchronous movement and spring driven animation can
   * be unified using this technique.
   * @public
   */
  setCurrentValue(currentValue: number, skipSetAtRest: boolean) {
    this._startValue = currentValue;
    this._currentState.position = currentValue;
    if (!skipSetAtRest) {
      this.setAtRest();
    }
    this.notifyPositionUpdated(false, false);
    return this;
  }

  /**
   * Get the position that the most recent animation started at. This
   * can be useful for determining the number off oscillations that
   * have occurred.
   * @public
   */
  getStartValue(): number {
    return this._startValue;
  }

  /**
   * Retrieve the current value of the Spring.
   * @public
   */
  getCurrentValue(): number {
    return this._currentState.position;
  }

  /**
   * Get the absolute distance of the Spring from its resting endValue
   * position.
   * @public
   */
  getCurrentDisplacementDistance(): number {
    return this.getDisplacementDistanceForState(this._currentState);
  }

  /**
   * Get the absolute distance of the Spring from a given state value
   */
  getDisplacementDistanceForState(state: PhysicsState) {
    return Math.abs(this._endValue - state.position);
  }

  /**
   * Set the endValue or resting position of the spring. If this
   * value is different than the current value, the SpringSystem will
   * be notified and will begin running its solver loop to resolve
   * the Spring to equilibrium. Any listeners that are registered
   * for onSpringEndStateChange will also be notified of this update
   * immediately.
   * @public
   */
  setEndValue(endValue: number): this {
    if (this._endValue === endValue && this.isAtRest()) {
      return this;
    }
    this._startValue = this.getCurrentValue();
    this._endValue = endValue;
    this._springSystem.activateSpring(this.getId());
    for (let i = 0, len = this.listeners.length; i < len; i++) {
      const listener = this.listeners[i];
      const onChange = listener.onSpringEndStateChange;
      onChange && onChange(this);
    }
    return this;
  }

  /**
   * Retrieve the endValue or resting position of this spring.
   * @public
   */
  getEndValue(): number {
    return this._endValue;
  }

  /**
   * Set the current velocity of the Spring, in pixels per second. As
   * previously mentioned, this can be useful when you are performing
   * a direct manipulation gesture. When a UI element is released you
   * may call setVelocity on its animation Spring so that the Spring
   * continues with the same velocity as the gesture ended with. The
   * friction, tension, and displacement of the Spring will then
   * govern its motion to return to rest on a natural feeling curve.
   * @public
   */
  setVelocity(velocity: number): this {
    if (velocity === this._currentState.velocity) {
      return this;
    }
    this._currentState.velocity = velocity;
    this._springSystem.activateSpring(this.getId());
    return this;
  }

  /**
   * Get the current velocity of the Spring, in pixels per second.
   * @public
   */
  getVelocity(): number {
    return this._currentState.velocity;
  }

  /**
   * Set a threshold value for the movement speed of the Spring below
   * which it will be considered to be not moving or resting.
   * @public
   */
  setRestSpeedThreshold(restSpeedThreshold: number): this {
    this._restSpeedThreshold = restSpeedThreshold;
    return this;
  }

  /**
   * Retrieve the rest speed threshold for this Spring.
   * @public
   */
  getRestSpeedThreshold(): number {
    return this._restSpeedThreshold;
  }

  /**
   * Set a threshold value for displacement below which the Spring
   * will be considered to be not displaced i.e. at its resting
   * `endValue`.
   * @public
   */
  setRestDisplacementThreshold(displacementFromRestThreshold: number): void {
    this._displacementFromRestThreshold = displacementFromRestThreshold;
  }

  /**
   * Retrieve the rest displacement threshold for this spring.
   * @public
   */
  getRestDisplacementThreshold(): number {
    return this._displacementFromRestThreshold;
  }

  /**
   * Enable overshoot clamping. This means that the Spring will stop
   * immediately when it reaches its resting position regardless of
   * any existing momentum it may have. This can be useful for certain
   * types of animations that should not oscillate such as a scale
   * down to 0 or alpha fade.
   * @public
   */
  setOvershootClampingEnabled(enabled: boolean): this {
    this._overshootClampingEnabled = enabled;
    return this;
  }

  /**
   * Check if overshoot clamping is enabled for this spring.
   * @public
   */
  isOvershootClampingEnabled(): boolean {
    return this._overshootClampingEnabled;
  }

  /**
   * Check if the Spring has gone past its end point by comparing
   * the direction it was moving in when it started to the current
   * position and end value.
   * @public
   */
  isOvershooting(): boolean {
    const start = this._startValue;
    const end = this._endValue;
    return (
      this._springConfig.tension > 0 &&
      ((start < end && this.getCurrentValue() > end) ||
        (start > end && this.getCurrentValue() < end))
    );
  }

  /**
   * The main solver method for the Spring. It takes
   * the current time and delta since the last time step and performs
   * an RK4 integration to get the new position and velocity state
   * for the Spring based on the tension, friction, velocity, and
   * displacement of the Spring.
   * @public
   */
  advance(time: number, realDeltaTime: number): void {
    let isAtRest = this.isAtRest();

    if (isAtRest && this._wasAtRest) {
      return;
    }

    let adjustedDeltaTime = realDeltaTime;
    if (realDeltaTime > Spring.MAX_DELTA_TIME_SEC) {
      adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;
    }

    this._timeAccumulator += adjustedDeltaTime;

    const tension = this._springConfig.tension;
    const friction = this._springConfig.friction;
    let position = this._currentState.position;
    let velocity = this._currentState.velocity;
    let tempPosition = this._tempState.position;
    let tempVelocity = this._tempState.velocity;
    let aVelocity;
    let aAcceleration;
    let bVelocity;
    let bAcceleration;
    let cVelocity;
    let cAcceleration;
    let dVelocity;
    let dAcceleration;
    let dxdt;
    let dvdt;

    while (this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {
      this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

      if (this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC) {
        this._previousState.position = position;
        this._previousState.velocity = velocity;
      }

      aVelocity = velocity;
      aAcceleration =
        tension * (this._endValue - tempPosition) - friction * velocity;

      tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity =
        velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      bVelocity = tempVelocity;
      bAcceleration =
        tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity =
        velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      cVelocity = tempVelocity;
      cAcceleration =
        tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC;
      tempVelocity = velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC;
      dVelocity = tempVelocity;
      dAcceleration =
        tension * (this._endValue - tempPosition) - friction * tempVelocity;

      dxdt =
        1.0 / 6.0 * (aVelocity + 2.0 * (bVelocity + cVelocity) + dVelocity);
      dvdt =
        1.0 /
        6.0 *
        (aAcceleration + 2.0 * (bAcceleration + cAcceleration) + dAcceleration);

      position += dxdt * Spring.SOLVER_TIMESTEP_SEC;
      velocity += dvdt * Spring.SOLVER_TIMESTEP_SEC;
    }

    this._tempState.position = tempPosition;
    this._tempState.velocity = tempVelocity;

    this._currentState.position = position;
    this._currentState.velocity = velocity;

    if (this._timeAccumulator > 0) {
      this._interpolate(this._timeAccumulator / Spring.SOLVER_TIMESTEP_SEC);
    }

    if (
      this.isAtRest() ||
      (this._overshootClampingEnabled && this.isOvershooting())
    ) {
      if (this._springConfig.tension > 0) {
        this._startValue = this._endValue;
        this._currentState.position = this._endValue;
      } else {
        this._endValue = this._currentState.position;
        this._startValue = this._endValue;
      }
      this.setVelocity(0);
      isAtRest = true;
    }

    let notifyActivate = false;
    if (this._wasAtRest) {
      this._wasAtRest = false;
      notifyActivate = true;
    }

    let notifyAtRest = false;
    if (isAtRest) {
      this._wasAtRest = true;
      notifyAtRest = true;
    }

    this.notifyPositionUpdated(notifyActivate, notifyAtRest);
  }

  notifyPositionUpdated(notifyActivate: boolean, notifyAtRest: boolean): void {
    for (let i = 0, len = this.listeners.length; i < len; i++) {
      const listener = this.listeners[i];
      if (notifyActivate && listener.onSpringActivate) {
        listener.onSpringActivate(this);
      }

      if (listener.onSpringUpdate) {
        listener.onSpringUpdate(this);
      }

      if (notifyAtRest && listener.onSpringAtRest) {
        listener.onSpringAtRest(this);
      }
    }
  }

  /**
   * Check if the SpringSystem should advance. Springs are advanced
   * a final frame after they reach equilibrium to ensure that the
   * currentValue is exactly the requested endValue regardless of the
   * displacement threshold.
   * @public
   */
  systemShouldAdvance(): boolean {
    return !this.isAtRest() || !this.wasAtRest();
  }

  wasAtRest(): boolean {
    return this._wasAtRest;
  }

  /**
   * Check if the Spring is atRest meaning that it's currentValue and
   * endValue are the same and that it has no velocity. The previously
   * described thresholds for speed and displacement define the bounds
   * of this equivalence check. If the Spring has 0 tension, then it will
   * be considered at rest whenever its absolute velocity drops below the
   * restSpeedThreshold.
   * @public
   */
  isAtRest(): boolean {
    return (
      Math.abs(this._currentState.velocity) < this._restSpeedThreshold &&
      (this.getDisplacementDistanceForState(this._currentState) <=
        this._displacementFromRestThreshold ||
        this._springConfig.tension === 0)
    );
  }

  /**
   * Force the spring to be at rest at its current position. As
   * described in the documentation for setCurrentValue, this method
   * makes it easy to do synchronous non-animated updates to ui
   * elements that are attached to springs via SpringListeners.
   * @public
   */
  setAtRest(): this {
    this._endValue = this._currentState.position;
    this._tempState.position = this._currentState.position;
    this._currentState.velocity = 0;
    return this;
  }

  _interpolate(alpha: number): void {
    this._currentState.position =
      this._currentState.position * alpha +
      this._previousState.position * (1 - alpha);
    this._currentState.velocity =
      this._currentState.velocity * alpha +
      this._previousState.velocity * (1 - alpha);
  }

  getListeners(): Array<SpringListener> {
    return this.listeners;
  }

  addListener(newListener: SpringListener): this {
    this.listeners.push(newListener);
    return this;
  }

  removeListener(listenerToRemove: SpringListener): this {
    removeFirst(this.listeners, listenerToRemove);
    return this;
  }

  removeAllListeners(): this {
    this.listeners = [];
    return this;
  }

  currentValueIsApproximately(value: number): boolean {
    return (
      Math.abs(this.getCurrentValue() - value) <=
      this.getRestDisplacementThreshold()
    );
  }
}

export default Spring;
