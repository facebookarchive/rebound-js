export class SpringSystem {
  listeners: Array<Listener>|null;
  looper: Looper;

  constructor(looper?: Looper);

  setLooper(looper: Looper): void;

  createSpring(tension?: number, friction?: number): Spring;
  createSpringWithBouncinessAndSpeed(bounciness?: number, speed?: number):
      Spring;
  createSpringWithConfig(kwargs: SpringConfigDict): Spring;

  getIsIdle(): boolean;
  getSpringById(id: number): Spring;
  getAllSprings(): Array<Spring>;

  registerSpring(value: Spring): void;
  deregisterSpring(value: Spring): void;

  advance(time: number, deltaTime: number): void;
  loop(currentTimeMillis: number): void;

  activateSpring(springId: number): void;

  addListener(listener: Listener): void;
  removeListener(listener: Listener): void;
  removeAllListeners(): void;
}

export class Spring {
  static MAX_DELTA_TIME_SEC: number;
  static SOLVER_TIMESTEP_SEC: number;

  listeners: Array<Listener>|null;

  constructor(system: SpringSystem);

  destroy(): void;

  getId(): number;

  getSpringConfig(): SpringConfigDict;
  setSpringConfig(value: SpringConfigDict): Spring;

  getCurrentValue(): number;
  setCurrentValue(currentValue: number, skipSetAtRest?: boolean): Spring;

  getStartValue(): number;

  getCurrentDisplacementDistance(): number;
  getCurrentDisplacementDistanceForState(state: PhysicsState): number;

  getEndValue(): number;
  setEndValue(value: number): Spring;

  getVelocity(): number;
  setVelocity(value: number): Spring;

  getRestSpeedThreshold(): number;
  setRestSpeedThreshold(value: number): Spring;

  getRestDisplacementThreshold(): number;

  isOvershootClampingEnabled(): boolean;
  setOvershootClampingEnabled(value: boolean): Spring;

  isOvershooting(): boolean;

  advance(time: number, realDeltaTime: number): void;
  systemShouldAdvance(): boolean;

  notifyPositionUpdated(notifyActivate?: boolean, notifyAtRest?: boolean): void;

  wasAtRest(): boolean;
  isAtRest(): boolean;
  setAtRest(): Spring;

  interpolate(value: number): void;

  getListeners(): Array<Listener>;
  addListener(value: Listener): Spring;
  removeListener(value: Listener): Spring;
  removeAllListeners(): Spring;

  currentValueIsApproximately(value: number): boolean;
}

export interface CompleteListener {
  onSpringEndStateChange(spring: Spring): void;
  onBeforeIntegrate(spring: Spring): void;
  onAfterIntegrate(spring: Spring): void;
  onSpringActivate(spring: Spring): void;
  onSpringUpdate(spring: Spring): void;
  onSpringAtRest(spring: Spring): void;
}

export type Listener = Partial<CompleteListener>;

export type PhysicsState = {
  position: number,
  friction: number,
};

// We can't just export the type alias, because the library provides a factory
// called SpringConfig, so we export the factory as SpringConfig and call the
// type alias SpringConfigDict.

export type SpringConfigDict = {
  tension: number,
  friction: number,
};

export class SpringConfig {
  static DEFAULT_ORIGAMI_SPRING_CONFIG: SpringConfig;

  static fromOrigamiTensionAndFriction(tension: number, friction: number):
      SpringConfig;
  static fromBouncinessAndSpeed(bounciness: number, speed: number):
      SpringConfig;
  static coastingConfigWithOrigamiFriction(friction: number): SpringConfig;

  tension: number;
  friction: number;

  constructor(tension: number, friction: number);
}

export interface Looper {
  springSystem: SpringSystem;

  run(): void;
}

export class AnimationLooper implements Looper {
  springSystem: SpringSystem;

  constructor();

  run(): void;
}

export class SimulationLooper implements Looper {
  springSystem: SpringSystem;

  constructor(timestep?: number);

  run(): void;
}

export class SteppingSimulationLooper extends SimulationLooper {
  step(timestep: number): void;
}

export namespace OrigamiValueConverter {
  function tensionFromOrigamiValue(value: number): number;
  function origamiValueFromTension(value: number): number;
  function frictionFromOrigamiValue(value: number): number;
  function origamiFromFriction(value: number): number;
}

export class BouncyConversion {
  bounciness: number;
  speed: number;

  constructor(bounciness: number, speed: number);

  normalize(value: number, startValue: number, endValue: number): void;
  projectNormal(n: number, start: number, end: number): void;
  linearInterpolation(t: number, start: number, end: number): void;
  quadraticOutInterpolation(t: number, start: number, end: number): void;
  b3Friction1(x: number): void;
  b3Friction2(x: number): void;
  b3Friction3(x: number): void;
  b3Nobounce(tension: number): void;
}

export type RGB = {
  r: number,
  g: number,
  b: number,
};

export type RequestAnimationFrame = typeof requestAnimationFrame;

export namespace util {
  function bind(func: Function, context: any): Function;
  function extend<T, U>(target: T, source: U): T&U;

  function hexToRGB(color: string): RGB;
  function rgbToHex(r: number, g: number, b: number): string;

  const onFrame: RequestAnimationFrame;

  // These are technically aliased to MathUtil, but it's not worth breaking them
  // out
  function mapValueInRange(
      value: number, fromLow: number, fromHigh: number, toLow: number,
      toHigh: number): number;
  function interpolateColor(
      val: number, startColor: string, endColor: string, fromLow?: number,
      fromHigh?: number, asRGB?: boolean): string;
  function degreesToRadians(value: number): number;
  function radiansToDegrees(value: number): number;
}
