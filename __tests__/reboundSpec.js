import rebound from '../src/index.js';
const {
  SimulationLooper,
  SpringConfig,
  SpringSystem,
  SteppingSimulationLooper,
} = rebound;

describe('SpringSystem', () => {
  let springSystem;

  beforeEach(() => {
    springSystem = new SpringSystem(new SimulationLooper());
    jest.spyOn(springSystem, 'registerSpring');
    jest.spyOn(springSystem, 'activateSpring');
  });

  it('creates springs and maintains a registry of springs', () => {
    const spring = springSystem.createSpring();
    expect(springSystem.getAllSprings().length).toBe(1);
    expect(springSystem.registerSpring).toHaveBeenCalledWith(spring);
  });

  it('starts out idle', () => {
    springSystem.createSpring();
    expect(springSystem.getIsIdle()).toBe(true);
  });

  it('activates when a spring is moved', () => {
    const spring = springSystem.createSpring();
    expect(springSystem.getIsIdle()).toBe(true);
    spring.setEndValue(1);
    expect(springSystem.activateSpring).toHaveBeenCalledWith(spring.getId());
  });

  it('can have listeners', () => {
    const dummyListener = {};
    springSystem.addListener(dummyListener);
    expect(springSystem.listeners.length).toBe(1);
    springSystem.removeListener(dummyListener);
    expect(springSystem.listeners.length).toBe(0);
    springSystem.addListener({});
    springSystem.addListener({});
    springSystem.addListener({});
    springSystem.addListener({});
    expect(springSystem.listeners.length).toBe(4);
    springSystem.removeAllListeners();
    expect(springSystem.listeners.length).toBe(0);
  });

  it('should call its listeners on each frame of the animation', () => {
    const looper = new SteppingSimulationLooper();
    const timestep = 16.667;
    const listener = {
      onBeforeIntegrate: jest.fn(),
      onAfterIntegrate: jest.fn(),
    };

    springSystem.setLooper(looper);
    springSystem.addListener(listener);

    const spring = springSystem.createSpring();
    spring.setEndValue(1);
    looper.step(timestep);
    expect(listener.onBeforeIntegrate).toHaveBeenCalledWith(springSystem);
    expect(listener.onAfterIntegrate).toHaveBeenCalledWith(springSystem);
  });
});

describe('Spring', () => {
  let springSystem, spring;
  beforeEach(() => {
    springSystem = new SpringSystem(new SimulationLooper());
    spring = springSystem.createSpring();
  });

  it('is created at rest', () => {
    expect(spring.isAtRest()).toBe(true);
    expect(spring.getCurrentValue()).toBe(0);
    expect(spring.getEndValue()).toBe(0);
    expect(spring.getVelocity()).toBe(0);
  });

  it('can have listeners', () => {
    const dummyListener = {};
    spring.addListener(dummyListener);
    expect(spring.listeners.length).toBe(1);
    spring.removeListener(dummyListener);
    expect(spring.listeners.length).toBe(0);
    spring.addListener({});
    spring.addListener({});
    spring.addListener({});
    spring.addListener({});
    expect(spring.listeners.length).toBe(4);
    spring.removeAllListeners();
    expect(spring.listeners.length).toBe(0);
  });

  it('performs the expected numerical integration', () => {
    const actualValues = [];
    const actualVelocities = [];

    spring.addListener({
      onSpringUpdate: jest.fn(() => {
        actualValues.push(spring.getCurrentValue());
        actualVelocities.push(spring.getVelocity());
      }),
    });

    spring.setEndValue(1);
    expect(actualValues).toMatchSnapshot();
    expect(actualVelocities).toMatchSnapshot();
  });

  it('should not oscillate if overshoot clamping is enabled', () => {
    const actualValues = [];

    spring.addListener({
      onSpringUpdate: jest.fn(() => {
        actualValues.push(spring.getCurrentValue());
      }),
    });
    spring.setOvershootClampingEnabled(true);
    spring.setEndValue(1);

    let didOscillate = false;
    let priorValue = -1;
    for (let i = 0; i < actualValues.length; i++) {
      const currentValue = actualValues[i];
      if (currentValue < priorValue) {
        didOscillate = true;
        break;
      }
      priorValue = currentValue;
    }

    expect(didOscillate).toBe(false);
  });

  it('should not oscillate if the spring has 0 tension', () => {
    const actualValues = [];

    spring.addListener({
      onSpringUpdate: jest.fn(() => {
        actualValues.push(spring.getCurrentValue());
      }),
    });
    spring.setSpringConfig(SpringConfig.coastingConfigWithOrigamiFriction(7));
    spring.setVelocity(1000);

    let didOscillate = false;
    let priorValue = -1;
    for (let i = 0; i < actualValues.length; i++) {
      const currentValue = actualValues[i];
      if (currentValue < priorValue) {
        didOscillate = true;
        break;
      }
      priorValue = currentValue;
    }

    expect(didOscillate).toBe(false);
  });

  it('should be at rest after calling setCurrentValue', () => {
    const _springSystem = new SpringSystem();
    const _spring = _springSystem.createSpring();
    _spring.setEndValue(1);
    _spring.setCurrentValue(-1);
    expect(_spring.isAtRest()).toBe(true);
    expect(_spring.getCurrentValue()).toBe(-1);
    expect(_spring.getEndValue()).toBe(-1);
  });

  it('should not be at rest if the skipSetAtRest parameter is passed to setCurrentValue while moving', () => {
    const _springSystem = new SpringSystem();
    const _spring = _springSystem.createSpring();
    _spring.setEndValue(1);
    _spring.setCurrentValue(-1, true);
    expect(_spring.isAtRest()).toBe(false);
    expect(_spring.getCurrentValue()).toBe(-1);
    expect(_spring.getEndValue()).toBe(1);
  });
});

describe('Rebound Utilities', () => {
  it('should interpolate numbers in ranges', () => {
    const val = rebound.util.mapValueInRange(150, 100, 200, 0, -300);
    expect(val).toBe(-150);
  });

  it('should convert degrees to radians', () => {
    const val = rebound.util.degreesToRadians(57.29577951308232);
    expect(val).toEqual(1);
  });

  it('should convert radian to degrees', () => {
    const val = rebound.util.radiansToDegrees(1);
    expect(val).toBe(57.29577951308232);
  });

  it('should interpolate hex colors', () => {
    expect(rebound.util.interpolateColor(0.5, '#ff0000', '#0000ff')).toBe(
      '#7f007f',
    );
  });

  it('should interpolate hex colors with an optional input range', () => {
    expect(
      rebound.util.interpolateColor(100, '#ff0000', '#0000ff', 0, 200),
    ).toBe('#7f007f');
  });

  it('should interpolate hex colors with an optional rgb return value', () => {
    expect(
      rebound.util.interpolateColor(0.5, '#ff0000', '#0000ff', 0, 1, true),
    ).toBe('rgb(127,0,127)');
  });

  it('should call functions async with onFrame', done => {
    let called;
    rebound.util.onFrame(() => {
      called = true;
      done();
    });
    expect(called).not.toBe(true);
  });
});
