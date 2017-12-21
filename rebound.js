(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.rebound = factory());
}(this, (function () { 'use strict';

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var _onFrame;
if (typeof window !== 'undefined') {
  _onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
}

if (!_onFrame && typeof process !== 'undefined' && process.title === 'node') {
  _onFrame = setImmediate;
}

_onFrame = _onFrame || function (callback) {
  window.setTimeout(callback, 1000 / 60);
};

var _onFrame$1 = _onFrame;

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

// Bind a function to a context object.
function bind(func, context) {
  var args = slice.call(arguments, 2);
  return function () {
    func.apply(context, concat.call(args, slice.call(arguments)));
  };
}

// Add all the properties in the source to the target.
function extend(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

// Cross browser/node timer functions.
function onFrame(func) {
  return _onFrame$1(func);
}

// Lop off the first occurence of the reference in the Array.
function removeFirst(array, item) {
  var idx = array.indexOf(item);
  idx != -1 && array.splice(idx, 1);
}

// Here are a couple of function to convert colors between hex codes and RGB
// component values. These are handy when performing color
// tweening animations.
var colorCache = {};
function hexToRGB(color) {
  if (colorCache[color]) {
    return colorCache[color];
  }
  color = color.replace('#', '');
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  var parts = color.match(/.{2}/g);
  if (!parts || parts.length < 3) {
    throw new Error('Expected a color string of format #rrggbb');
  }

  var ret = {
    r: parseInt(parts[0], 16),
    g: parseInt(parts[1], 16),
    b: parseInt(parts[2], 16)
  };

  colorCache[color] = ret;
  return ret;
}

function rgbToHex(rNum, gNum, bNum) {
  var r = rNum.toString(16);
  var g = gNum.toString(16);
  var b = bNum.toString(16);
  r = r.length < 2 ? '0' + r : r;
  g = g.length < 2 ? '0' + g : g;
  b = b.length < 2 ? '0' + b : b;
  return '#' + r + g + b;
}

var util = Object.freeze({
	bind: bind,
	extend: extend,
	onFrame: onFrame,
	removeFirst: removeFirst,
	hexToRGB: hexToRGB,
	rgbToHex: rgbToHex
});

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

// This helper function does a linear interpolation of a value from
// one range to another. This can be very useful for converting the
// motion of a Spring to a range of UI property values. For example a
// spring moving from position 0 to 1 could be interpolated to move a
// view from pixel 300 to 350 and scale it from 0.5 to 1. The current
// position of the `Spring` just needs to be run through this method
// taking its input range in the _from_ parameters with the property
// animation range in the _to_ parameters.
function mapValueInRange(value, fromLow, fromHigh, toLow, toHigh) {
  var fromRangeSize = fromHigh - fromLow;
  var toRangeSize = toHigh - toLow;
  var valueScale = (value - fromLow) / fromRangeSize;
  return toLow + valueScale * toRangeSize;
}

// Interpolate two hex colors in a 0 - 1 range or optionally provide a
// custom range with fromLow,fromHight. The output will be in hex by default
// unless asRGB is true in which case it will be returned as an rgb string.
function interpolateColor(val, startColorStr, endColorStr, fromLow, fromHigh, asRGB) {
  fromLow = fromLow === undefined ? 0 : fromLow;
  fromHigh = fromHigh === undefined ? 1 : fromHigh;
  var startColor = hexToRGB(startColorStr);
  var endColor = hexToRGB(endColorStr);
  var r = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r));
  var g = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g));
  var b = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b));
  if (asRGB) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  } else {
    return rgbToHex(r, g, b);
  }
}

function degreesToRadians(deg) {
  return deg * Math.PI / 180;
}

function radiansToDegrees(rad) {
  return rad * 180 / Math.PI;
}

var MathUtil = Object.freeze({
	mapValueInRange: mapValueInRange,
	interpolateColor: interpolateColor,
	degreesToRadians: degreesToRadians,
	radiansToDegrees: radiansToDegrees
});

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

// Math for converting from
// [Origami](http://facebook.github.io/origami/) to
// [Rebound](http://facebook.github.io/rebound).
// You mostly don't need to worry about this, just use
// SpringConfig.fromOrigamiTensionAndFriction(v, v);
function tensionFromOrigamiValue(oValue) {
  return (oValue - 30.0) * 3.62 + 194.0;
}

function origamiValueFromTension(tension) {
  return (tension - 194.0) / 3.62 + 30.0;
}

function frictionFromOrigamiValue(oValue) {
  return (oValue - 8.0) * 3.0 + 25.0;
}

function origamiFromFriction(friction) {
  return (friction - 25.0) / 3.0 + 8.0;
}

var OrigamiValueConverter = Object.freeze({
	tensionFromOrigamiValue: tensionFromOrigamiValue,
	origamiValueFromTension: origamiValueFromTension,
	frictionFromOrigamiValue: frictionFromOrigamiValue,
	origamiFromFriction: origamiFromFriction
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

// Loopers
// -------
// **AnimationLooper** plays each frame of the SpringSystem on animation
// timing loop. This is the default type of looper for a new spring system
// as it is the most common when developing UI.
/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var AnimationLooper = function () {
  function AnimationLooper() {
    classCallCheck(this, AnimationLooper);
    this.springSystem = null;
  }

  AnimationLooper.prototype.run = function run() {
    var springSystem = getSpringSystem.call(this);

    onFrame(function () {
      springSystem.loop(Date.now());
    });
  };

  return AnimationLooper;
}();

// **SimulationLooper** resolves the SpringSystem to a resting state in a
// tight and blocking loop. This is useful for synchronously generating
// pre-recorded animations that can then be played on a timing loop later.
// Sometimes this lead to better performance to pre-record a single spring
// curve and use it to drive many animations; however, it can make dynamic
// response to user input a bit trickier to implement.
var SimulationLooper = function () {
  function SimulationLooper(timestep) {
    classCallCheck(this, SimulationLooper);
    this.springSystem = null;
    this.time = 0;
    this.running = false;

    this.timestep = timestep || 16.667;
  }

  SimulationLooper.prototype.run = function run() {
    var springSystem = getSpringSystem.call(this);

    if (this.running) {
      return;
    }
    this.running = true;
    while (!springSystem.getIsIdle()) {
      springSystem.loop(this.time += this.timestep);
    }
    this.running = false;
  };

  return SimulationLooper;
}();

// **SteppingSimulationLooper** resolves the SpringSystem one step at a
// time controlled by an outside loop. This is useful for testing and
// verifying the behavior of a SpringSystem or if you want to control your own
// timing loop for some reason e.g. slowing down or speeding up the
// simulation.
var SteppingSimulationLooper = function () {
  function SteppingSimulationLooper() {
    classCallCheck(this, SteppingSimulationLooper);
    this.springSystem = null;
    this.time = 0;
    this.running = false;
  }

  SteppingSimulationLooper.prototype.run = function run() {}
  // this.run is NOOP'd here to allow control from the outside using
  // this.step.


  // Perform one step toward resolving the SpringSystem.
  ;

  SteppingSimulationLooper.prototype.step = function step(timestep) {
    var springSystem = getSpringSystem.call(this);
    springSystem.loop(this.time += timestep);
  };

  return SteppingSimulationLooper;
}();

function getSpringSystem() {
  if (this.springSystem == null) {
    throw new Error('cannot run looper without a springSystem');
  }
  return this.springSystem;
}



var Loopers = Object.freeze({
	AnimationLooper: AnimationLooper,
	SimulationLooper: SimulationLooper,
	SteppingSimulationLooper: SteppingSimulationLooper
});

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

// BouncyConversion provides math for converting from Origami PopAnimation
// config values to regular Origami tension and friction values. If you are
// trying to replicate prototypes made with PopAnimation patches in Origami,
// then you should create your springs with
// SpringSystem.createSpringWithBouncinessAndSpeed, which uses this Math
// internally to create a spring to match the provided PopAnimation
// configuration from Origami.
var BouncyConversion = function () {
  function BouncyConversion(bounciness, speed) {
    classCallCheck(this, BouncyConversion);

    this.bounciness = bounciness;
    this.speed = speed;

    var b = this.normalize(bounciness / 1.7, 0, 20.0);
    b = this.projectNormal(b, 0.0, 0.8);
    var s = this.normalize(speed / 1.7, 0, 20.0);

    this.bouncyTension = this.projectNormal(s, 0.5, 200);
    this.bouncyFriction = this.quadraticOutInterpolation(b, this.b3Nobounce(this.bouncyTension), 0.01);
  }

  BouncyConversion.prototype.normalize = function normalize(value, startValue, endValue) {
    return (value - startValue) / (endValue - startValue);
  };

  BouncyConversion.prototype.projectNormal = function projectNormal(n, start, end) {
    return start + n * (end - start);
  };

  BouncyConversion.prototype.linearInterpolation = function linearInterpolation(t, start, end) {
    return t * end + (1.0 - t) * start;
  };

  BouncyConversion.prototype.quadraticOutInterpolation = function quadraticOutInterpolation(t, start, end) {
    return this.linearInterpolation(2 * t - t * t, start, end);
  };

  BouncyConversion.prototype.b3Friction1 = function b3Friction1(x) {
    return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
  };

  BouncyConversion.prototype.b3Friction2 = function b3Friction2(x) {
    return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2.;
  };

  BouncyConversion.prototype.b3Friction3 = function b3Friction3(x) {
    return 0.00000045 * Math.pow(x, 3) - 0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;
  };

  BouncyConversion.prototype.b3Nobounce = function b3Nobounce(tension) {
    var friction = 0;
    if (tension <= 18) {
      friction = this.b3Friction1(tension);
    } else if (tension > 18 && tension <= 44) {
      friction = this.b3Friction2(tension);
    } else {
      friction = this.b3Friction3(tension);
    }
    return friction;
  };

  return BouncyConversion;
}();

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

// SpringConfig
// ------------
// **SpringConfig** maintains a set of tension and friction constants
// for a Spring. You can use fromOrigamiTensionAndFriction to convert
// values from the [Origami](http://facebook.github.io/origami/)
// design tool directly to Rebound spring constants.

var SpringConfig = function () {

  // Convert an origami Spring tension and friction to Rebound spring
  // constants. If you are prototyping a design with Origami, this
  // makes it easy to make your springs behave exactly the same in
  // Rebound.
  SpringConfig.fromOrigamiTensionAndFriction = function fromOrigamiTensionAndFriction(tension, friction) {
    return new SpringConfig(tensionFromOrigamiValue(tension), frictionFromOrigamiValue(friction));
  };

  // Convert an origami PopAnimation Spring bounciness and speed to Rebound
  // spring constants. If you are using PopAnimation patches in Origami, this
  // utility will provide springs that match your prototype.
  SpringConfig.fromBouncinessAndSpeed = function fromBouncinessAndSpeed(bounciness, speed) {
    var bouncyConversion = new BouncyConversion(bounciness, speed);
    return SpringConfig.fromOrigamiTensionAndFriction(bouncyConversion.bouncyTension, bouncyConversion.bouncyFriction);
  };

  // Create a SpringConfig with no tension or a coasting spring with some
  // amount of Friction so that it does not coast infininitely.
  SpringConfig.coastingConfigWithOrigamiFriction = function coastingConfigWithOrigamiFriction(friction) {
    return new SpringConfig(0, frictionFromOrigamiValue(friction));
  };

  function SpringConfig(tension, friction) {
    classCallCheck(this, SpringConfig);

    this.tension = tension;
    this.friction = friction;
  }

  return SpringConfig;
}();

SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG = SpringConfig.fromOrigamiTensionAndFriction(40, 7);

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

// PhysicsState
// ------------
// **PhysicsState** consists of a position and velocity. A Spring uses
// this internally to keep track of its current and prior position and
// velocity values.

var PhysicsState = function PhysicsState() {
  classCallCheck(this, PhysicsState);
  this.position = 0;
  this.velocity = 0;
};

// Spring
// ------
// **Spring** provides a model of a classical spring acting to
// resolve a body to equilibrium. Springs have configurable
// tension which is a force multipler on the displacement of the
// spring from its rest point or `endValue` as defined by [Hooke's
// law](http://en.wikipedia.org/wiki/Hooke's_law). Springs also have
// configurable friction, which ensures that they do not oscillate
// infinitely. When a Spring is displaced by updating it's resting
// or `currentValue`, the SpringSystems that contain that Spring
// will automatically start looping to solve for equilibrium. As each
// timestep passes, `SpringListener` objects attached to the Spring
// will be notified of the updates providing a way to drive an
// animation off of the spring's resolution curve.

var Spring = function () {
  function Spring(springSystem) {
    classCallCheck(this, Spring);
    this.listeners = [];
    this._startValue = 0;
    this._currentState = new PhysicsState();
    this._displacementFromRestThreshold = 0.001;
    this._endValue = 0;
    this._overshootClampingEnabled = false;
    this._previousState = new PhysicsState();
    this._restSpeedThreshold = 0.001;
    this._tempState = new PhysicsState();
    this._timeAccumulator = 0;
    this._wasAtRest = true;

    this._id = 's' + Spring._ID++;
    this._springSystem = springSystem;
  }

  // Remove a Spring from simulation and clear its listeners.


  Spring.prototype.destroy = function destroy() {
    this.listeners = [];
    this._springSystem.deregisterSpring(this);
  };

  // Get the id of the spring, which can be used to retrieve it from
  // the SpringSystems it participates in later.
  Spring.prototype.getId = function getId() {
    return this._id;
  };

  // Set the configuration values for this Spring. A SpringConfig
  // contains the tension and friction values used to solve for the
  // equilibrium of the Spring in the physics loop.
  Spring.prototype.setSpringConfig = function setSpringConfig(springConfig) {
    this._springConfig = springConfig;
    return this;
  };

  // Retrieve the SpringConfig used by this Spring.
  Spring.prototype.getSpringConfig = function getSpringConfig() {
    return this._springConfig;
  };

  // Set the current position of this Spring. Listeners will be updated
  // with this value immediately. If the rest or `endValue` is not
  // updated to match this value, then the spring will be dispalced and
  // the SpringSystem will start to loop to restore the spring to the
  // `endValue`.
  //
  // A common pattern is to move a Spring around without animation by
  // calling.
  //
  // ```
  // spring.setCurrentValue(n).setAtRest();
  // ```
  //
  // This moves the Spring to a new position `n`, sets the endValue
  // to `n`, and removes any velocity from the `Spring`. By doing
  // this you can allow the `SpringListener` to manage the position
  // of UI elements attached to the spring even when moving without
  // animation. For example, when dragging an element you can
  // update the position of an attached view through a spring
  // by calling `spring.setCurrentValue(x)`. When
  // the gesture ends you can update the Springs
  // velocity and endValue
  // `spring.setVelocity(gestureEndVelocity).setEndValue(flingTarget)`
  // to cause it to naturally animate the UI element to the resting
  // position taking into account existing velocity. The codepaths for
  // synchronous movement and spring driven animation can
  // be unified using this technique.
  Spring.prototype.setCurrentValue = function setCurrentValue(currentValue, skipSetAtRest) {
    this._startValue = currentValue;
    this._currentState.position = currentValue;
    if (!skipSetAtRest) {
      this.setAtRest();
    }
    this.notifyPositionUpdated(false, false);
    return this;
  };

  // Get the position that the most recent animation started at. This
  // can be useful for determining the number off oscillations that
  // have occurred.
  Spring.prototype.getStartValue = function getStartValue() {
    return this._startValue;
  };

  // Retrieve the current value of the Spring.
  Spring.prototype.getCurrentValue = function getCurrentValue() {
    return this._currentState.position;
  };

  // Get the absolute distance of the Spring from it's resting endValue
  // position.
  Spring.prototype.getCurrentDisplacementDistance = function getCurrentDisplacementDistance() {
    return this.getDisplacementDistanceForState(this._currentState);
  };

  Spring.prototype.getDisplacementDistanceForState = function getDisplacementDistanceForState(state) {
    return Math.abs(this._endValue - state.position);
  };

  // Set the endValue or resting position of the spring. If this
  // value is different than the current value, the SpringSystem will
  // be notified and will begin running its solver loop to resolve
  // the Spring to equilibrium. Any listeners that are registered
  // for onSpringEndStateChange will also be notified of this update
  // immediately.
  Spring.prototype.setEndValue = function setEndValue(endValue) {
    if (this._endValue == endValue && this.isAtRest()) {
      return this;
    }
    this._startValue = this.getCurrentValue();
    this._endValue = endValue;
    this._springSystem.activateSpring(this.getId());
    for (var i = 0, len = this.listeners.length; i < len; i++) {
      var listener = this.listeners[i];
      var onChange = listener.onSpringEndStateChange;
      onChange && onChange(this);
    }
    return this;
  };

  // Retrieve the endValue or resting position of this spring.
  Spring.prototype.getEndValue = function getEndValue() {
    return this._endValue;
  };

  // Set the current velocity of the Spring, in pixels per second. As
  // previously mentioned, this can be useful when you are performing
  // a direct manipulation gesture. When a UI element is released you
  // may call setVelocity on its animation Spring so that the Spring
  // continues with the same velocity as the gesture ended with. The
  // friction, tension, and displacement of the Spring will then
  // govern its motion to return to rest on a natural feeling curve.
  Spring.prototype.setVelocity = function setVelocity(velocity) {
    if (velocity === this._currentState.velocity) {
      return this;
    }
    this._currentState.velocity = velocity;
    this._springSystem.activateSpring(this.getId());
    return this;
  };

  // Get the current velocity of the Spring, in pixels per second.
  Spring.prototype.getVelocity = function getVelocity() {
    return this._currentState.velocity;
  };

  // Set a threshold value for the movement speed of the Spring below
  // which it will be considered to be not moving or resting.
  Spring.prototype.setRestSpeedThreshold = function setRestSpeedThreshold(restSpeedThreshold) {
    this._restSpeedThreshold = restSpeedThreshold;
    return this;
  };

  // Retrieve the rest speed threshold for this Spring.
  Spring.prototype.getRestSpeedThreshold = function getRestSpeedThreshold() {
    return this._restSpeedThreshold;
  };

  // Set a threshold value for displacement below which the Spring
  // will be considered to be not displaced i.e. at its resting
  // `endValue`.
  Spring.prototype.setRestDisplacementThreshold = function setRestDisplacementThreshold(displacementFromRestThreshold) {
    this._displacementFromRestThreshold = displacementFromRestThreshold;
  };

  // Retrieve the rest displacement threshold for this spring.
  Spring.prototype.getRestDisplacementThreshold = function getRestDisplacementThreshold() {
    return this._displacementFromRestThreshold;
  };

  // Enable overshoot clamping. This means that the Spring will stop
  // immediately when it reaches its resting position regardless of
  // any existing momentum it may have. This can be useful for certain
  // types of animations that should not oscillate such as a scale
  // down to 0 or alpha fade.
  Spring.prototype.setOvershootClampingEnabled = function setOvershootClampingEnabled(enabled) {
    this._overshootClampingEnabled = enabled;
    return this;
  };

  // Check if overshoot clamping is enabled for this spring.
  Spring.prototype.isOvershootClampingEnabled = function isOvershootClampingEnabled() {
    return this._overshootClampingEnabled;
  };

  // Check if the Spring has gone past its end point by comparing
  // the direction it was moving in when it started to the current
  // position and end value.
  Spring.prototype.isOvershooting = function isOvershooting() {
    var start = this._startValue;
    var end = this._endValue;
    return this._springConfig.tension > 0 && (start < end && this.getCurrentValue() > end || start > end && this.getCurrentValue() < end);
  };

  // Spring.advance is the main solver method for the Spring. It takes
  // the current time and delta since the last time step and performs
  // an RK4 integration to get the new position and velocity state
  // for the Spring based on the tension, friction, velocity, and
  // displacement of the Spring.
  Spring.prototype.advance = function advance(time, realDeltaTime) {
    var isAtRest = this.isAtRest();

    if (isAtRest && this._wasAtRest) {
      return;
    }

    var adjustedDeltaTime = realDeltaTime;
    if (realDeltaTime > Spring.MAX_DELTA_TIME_SEC) {
      adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;
    }

    this._timeAccumulator += adjustedDeltaTime;

    var tension = this._springConfig.tension,
        friction = this._springConfig.friction,
        position = this._currentState.position,
        velocity = this._currentState.velocity,
        tempPosition = this._tempState.position,
        tempVelocity = this._tempState.velocity,
        aVelocity,
        aAcceleration,
        bVelocity,
        bAcceleration,
        cVelocity,
        cAcceleration,
        dVelocity,
        dAcceleration,
        dxdt,
        dvdt;

    while (this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {

      this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

      if (this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC) {
        this._previousState.position = position;
        this._previousState.velocity = velocity;
      }

      aVelocity = velocity;
      aAcceleration = tension * (this._endValue - tempPosition) - friction * velocity;

      tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity = velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      bVelocity = tempVelocity;
      bAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity = velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      cVelocity = tempVelocity;
      cAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC;
      tempVelocity = velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC;
      dVelocity = tempVelocity;
      dAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

      dxdt = 1.0 / 6.0 * (aVelocity + 2.0 * (bVelocity + cVelocity) + dVelocity);
      dvdt = 1.0 / 6.0 * (aAcceleration + 2.0 * (bAcceleration + cAcceleration) + dAcceleration);

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

    if (this.isAtRest() || this._overshootClampingEnabled && this.isOvershooting()) {

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

    var notifyActivate = false;
    if (this._wasAtRest) {
      this._wasAtRest = false;
      notifyActivate = true;
    }

    var notifyAtRest = false;
    if (isAtRest) {
      this._wasAtRest = true;
      notifyAtRest = true;
    }

    this.notifyPositionUpdated(notifyActivate, notifyAtRest);
  };

  Spring.prototype.notifyPositionUpdated = function notifyPositionUpdated(notifyActivate, notifyAtRest) {
    for (var i = 0, len = this.listeners.length; i < len; i++) {
      var listener = this.listeners[i];
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
  };

  // Check if the SpringSystem should advance. Springs are advanced
  // a final frame after they reach equilibrium to ensure that the
  // currentValue is exactly the requested endValue regardless of the
  // displacement threshold.
  Spring.prototype.systemShouldAdvance = function systemShouldAdvance() {
    return !this.isAtRest() || !this.wasAtRest();
  };

  Spring.prototype.wasAtRest = function wasAtRest() {
    return this._wasAtRest;
  };

  // Check if the Spring is atRest meaning that it's currentValue and
  // endValue are the same and that it has no velocity. The previously
  // described thresholds for speed and displacement define the bounds
  // of this equivalence check. If the Spring has 0 tension, then it will
  // be considered at rest whenever its absolute velocity drops below the
  // restSpeedThreshold.
  Spring.prototype.isAtRest = function isAtRest() {
    return Math.abs(this._currentState.velocity) < this._restSpeedThreshold && (this.getDisplacementDistanceForState(this._currentState) <= this._displacementFromRestThreshold || this._springConfig.tension === 0);
  };

  // Force the spring to be at rest at its current position. As
  // described in the documentation for setCurrentValue, this method
  // makes it easy to do synchronous non-animated updates to ui
  // elements that are attached to springs via SpringListeners.
  Spring.prototype.setAtRest = function setAtRest() {
    this._endValue = this._currentState.position;
    this._tempState.position = this._currentState.position;
    this._currentState.velocity = 0;
    return this;
  };

  Spring.prototype._interpolate = function _interpolate(alpha) {
    this._currentState.position = this._currentState.position * alpha + this._previousState.position * (1 - alpha);
    this._currentState.velocity = this._currentState.velocity * alpha + this._previousState.velocity * (1 - alpha);
  };

  Spring.prototype.getListeners = function getListeners() {
    return this.listeners;
  };

  Spring.prototype.addListener = function addListener(newListener) {
    this.listeners.push(newListener);
    return this;
  };

  Spring.prototype.removeListener = function removeListener(listenerToRemove) {
    removeFirst(this.listeners, listenerToRemove);
    return this;
  };

  Spring.prototype.removeAllListeners = function removeAllListeners() {
    this.listeners = [];
    return this;
  };

  Spring.prototype.currentValueIsApproximately = function currentValueIsApproximately(value) {
    return Math.abs(this.getCurrentValue() - value) <= this.getRestDisplacementThreshold();
  };

  return Spring;
}();

Spring._ID = 0;
Spring.MAX_DELTA_TIME_SEC = 0.064;
Spring.SOLVER_TIMESTEP_SEC = 0.001;

// SpringSystem
// ------------
// **SpringSystem** is a set of Springs that all run on the same physics
// timing loop. To get started with a Rebound animation you first
// create a new SpringSystem and then add springs to it.

var SpringSystem = function () {
  function SpringSystem(looper) {
    classCallCheck(this, SpringSystem);
    this._springRegistry = {};
    this._activeSprings = [];
    this.listeners = [];
    this._idleSpringIndices = [];
    this._isIdle = true;
    this._lastTimeMillis = -1;

    this.looper = looper || new AnimationLooper();
    this.looper.springSystem = this;
  }

  // A SpringSystem is iterated by a looper. The looper is responsible
  // for executing each frame as the SpringSystem is resolved to idle.
  // There are three types of Loopers described below AnimationLooper,
  // SimulationLooper, and SteppingSimulationLooper. AnimationLooper is
  // the default as it is the most useful for common UI animations.


  SpringSystem.prototype.setLooper = function setLooper(looper) {
    this.looper = looper;
    looper.springSystem = this;
  };

  // Add a new spring to this SpringSystem. This Spring will now be solved for
  // during the physics iteration loop. By default the spring will use the
  // default Origami spring config with 40 tension and 7 friction, but you can
  // also provide your own values here.
  SpringSystem.prototype.createSpring = function createSpring(tension, friction) {
    var springConfig;
    if (tension === undefined || friction === undefined) {
      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
    } else {
      springConfig = SpringConfig.fromOrigamiTensionAndFriction(tension, friction);
    }
    return this.createSpringWithConfig(springConfig);
  };

  // Add a spring with a specified bounciness and speed. To replicate Origami
  // compositions based on PopAnimation patches, use this factory method to
  // create matching springs.
  SpringSystem.prototype.createSpringWithBouncinessAndSpeed = function createSpringWithBouncinessAndSpeed(bounciness, speed) {
    var springConfig;
    if (bounciness === undefined || speed === undefined) {
      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
    } else {
      springConfig = SpringConfig.fromBouncinessAndSpeed(bounciness, speed);
    }
    return this.createSpringWithConfig(springConfig);
  };

  // Add a spring with the provided SpringConfig.
  SpringSystem.prototype.createSpringWithConfig = function createSpringWithConfig(springConfig) {
    var spring = new Spring(this);
    this.registerSpring(spring);
    spring.setSpringConfig(springConfig);
    return spring;
  };

  // You can check if a SpringSystem is idle or active by calling
  // getIsIdle. If all of the Springs in the SpringSystem are at rest,
  // i.e. the physics forces have reached equilibrium, then this
  // method will return true.
  SpringSystem.prototype.getIsIdle = function getIsIdle() {
    return this._isIdle;
  };

  // Retrieve a specific Spring from the SpringSystem by id. This
  // can be useful for inspecting the state of a spring before
  // or after an integration loop in the SpringSystem executes.
  SpringSystem.prototype.getSpringById = function getSpringById(id) {
    return this._springRegistry[id];
  };

  // Get a listing of all the springs registered with this
  // SpringSystem.
  SpringSystem.prototype.getAllSprings = function getAllSprings() {
    var vals = [];
    for (var id in this._springRegistry) {
      if (this._springRegistry.hasOwnProperty(id)) {
        vals.push(this._springRegistry[id]);
      }
    }
    return vals;
  };

  // registerSpring is called automatically as soon as you create
  // a Spring with SpringSystem#createSpring. This method sets the
  // spring up in the registry so that it can be solved in the
  // solver loop.
  SpringSystem.prototype.registerSpring = function registerSpring(spring) {
    this._springRegistry[spring.getId()] = spring;
  };

  // Deregister a spring with this SpringSystem. The SpringSystem will
  // no longer consider this Spring during its integration loop once
  // this is called. This is normally done automatically for you when
  // you call Spring#destroy.
  SpringSystem.prototype.deregisterSpring = function deregisterSpring(spring) {
    removeFirst(this._activeSprings, spring);
    delete this._springRegistry[spring.getId()];
  };

  SpringSystem.prototype.advance = function advance(time, deltaTime) {
    while (this._idleSpringIndices.length > 0) {
      this._idleSpringIndices.pop();
    }for (var i = 0, len = this._activeSprings.length; i < len; i++) {
      var spring = this._activeSprings[i];
      if (spring.systemShouldAdvance()) {
        spring.advance(time / 1000.0, deltaTime / 1000.0);
      } else {
        this._idleSpringIndices.push(this._activeSprings.indexOf(spring));
      }
    }
    while (this._idleSpringIndices.length > 0) {
      var idx = this._idleSpringIndices.pop();
      idx >= 0 && this._activeSprings.splice(idx, 1);
    }
  };

  // This is our main solver loop called to move the simulation
  // forward through time. Before each pass in the solver loop
  // onBeforeIntegrate is called on an any listeners that have
  // registered themeselves with the SpringSystem. This gives you
  // an opportunity to apply any constraints or adjustments to
  // the springs that should be enforced before each iteration
  // loop. Next the advance method is called to move each Spring in
  // the systemShouldAdvance forward to the current time. After the
  // integration step runs in advance, onAfterIntegrate is called
  // on any listeners that have registered themselves with the
  // SpringSystem. This gives you an opportunity to run any post
  // integration constraints or adjustments on the Springs in the
  // SpringSystem.
  SpringSystem.prototype.loop = function loop(currentTimeMillis) {
    var listener;
    if (this._lastTimeMillis === -1) {
      this._lastTimeMillis = currentTimeMillis - 1;
    }
    var ellapsedMillis = currentTimeMillis - this._lastTimeMillis;
    this._lastTimeMillis = currentTimeMillis;

    var i = 0,
        len = this.listeners.length;
    for (i = 0; i < len; i++) {
      listener = this.listeners[i];
      listener.onBeforeIntegrate && listener.onBeforeIntegrate(this);
    }

    this.advance(currentTimeMillis, ellapsedMillis);
    if (this._activeSprings.length === 0) {
      this._isIdle = true;
      this._lastTimeMillis = -1;
    }

    for (i = 0; i < len; i++) {
      listener = this.listeners[i];
      listener.onAfterIntegrate && listener.onAfterIntegrate(this);
    }

    if (!this._isIdle) {
      this.looper.run();
    }
  };

  // activateSpring is used to notify the SpringSystem that a Spring
  // has become displaced. The system responds by starting its solver
  // loop up if it is currently idle.
  SpringSystem.prototype.activateSpring = function activateSpring(springId) {
    var spring = this._springRegistry[springId];
    if (this._activeSprings.indexOf(spring) == -1) {
      this._activeSprings.push(spring);
    }
    if (this.getIsIdle()) {
      this._isIdle = false;
      this.looper.run();
    }
  };

  // Add a listener to the SpringSystem so that you can receive
  // before/after integration notifications allowing Springs to be
  // constrained or adjusted.
  SpringSystem.prototype.addListener = function addListener(listener) {
    this.listeners.push(listener);
  };

  // Remove a previously added listener on the SpringSystem.
  SpringSystem.prototype.removeListener = function removeListener(listener) {
    removeFirst(this.listeners, listener);
  };

  // Remove all previously added listeners on the SpringSystem.
  SpringSystem.prototype.removeAllListeners = function removeAllListeners() {
    this.listeners = [];
  };

  return SpringSystem;
}();

/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var index = _extends({}, Loopers, {
  OrigamiValueConverter: OrigamiValueConverter,
  MathUtil: MathUtil,
  Spring: Spring,
  SpringConfig: SpringConfig,
  SpringSystem: SpringSystem,
  util: _extends({}, util, MathUtil)
});

return index;

})));
