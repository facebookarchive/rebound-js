var rebound = require('../rebound');

describe('SpringSystem', function() {
  var springSystem;

  beforeEach(function() {
    springSystem = new rebound.SpringSystem(new rebound.SimulationLooper());
    spyOn(springSystem, 'registerSpring').andCallThrough();
    spyOn(springSystem, 'activateSpring').andCallThrough();
  });

  it('creates springs and maintains a registry of springs', function() {
    var spring = springSystem.createSpring();
    expect(springSystem.getAllSprings().length).toBe(1);
    expect(springSystem.registerSpring).toHaveBeenCalledWith(spring);
  });

  it('starts out idle', function() {
    var spring = springSystem.createSpring();
    expect(springSystem.getIsIdle()).toBe(true);
  });

  it('activates when a spring is moved', function() {
    var spring = springSystem.createSpring();
    expect(springSystem.getIsIdle()).toBe(true);
    spring.setEndValue(1);
    expect(springSystem.activateSpring).toHaveBeenCalledWith(spring.getId());
  });

  it('can have listeners', function() {
    var dummyListener = {};
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

  it('should call its listeners on each frame of the animation', function() {
    var looper = new rebound.SteppingSimulationLooper();
    var timestep = 16.667;
    var listener = {
      onBeforeIntegrate: function() {},
      onAfterIntegrate: function() {},
    };
    spyOn(listener, 'onBeforeIntegrate');
    spyOn(listener, 'onAfterIntegrate');

    springSystem.setLooper(looper);
    springSystem.addListener(listener);
    var spring = springSystem.createSpring();
    spring.setEndValue(1);
    looper.step(timestep);
    expect(listener.onBeforeIntegrate).toHaveBeenCalledWith(springSystem);
    expect(listener.onAfterIntegrate).toHaveBeenCalledWith(springSystem);
  });
});

describe('Spring', function() {
  var springSystem, spring;
  beforeEach(function() {
    springSystem = new rebound.SpringSystem(new rebound.SimulationLooper());
    spring = springSystem.createSpring();
  });

  it('is created at rest', function() {
    expect(spring.isAtRest()).toBe(true);
    expect(spring.getCurrentValue()).toBe(0);
    expect(spring.getEndValue()).toBe(0);
    expect(spring.getVelocity()).toBe(0);
  });

  it('can have listeners', function() {
    var dummyListener = {};
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

  it('performs the expected numerical integration', function() {
    var expectedValues = [
      0.00011425836769833332,
      0.02826894887325712,
      0.09786685539023218,
      0.1906494054868597,
      0.29365843980608936,
      0.40474896134789684,
      0.5107172515563908,
      0.6074646735059072,
      0.6981529338231078,
      0.7754777086457709,
      0.839707819077817,
      0.8948595531478145,
      0.9379716344919623,
      0.9707479956875202,
      0.9962428035545625,
      1.0139342469614867,
      1.0254911376885876,
      1.0326752603538492,
      1.0359769203762703,
      1.0365293261033242,
      1.0350922763323542,
      1.0323542266285861,
      1.0289066506717395,
      1.0249225975602652,
      1.0209434111787616,
      1.0171866123097923,
      1.0135669403763488,
      1.0104047123230713,
      1.0077191568237913,
      1.0053619452157372,
      1.0034760195970387,
      1.0020056186933401,
      1.0008270224418958,
      0.9999766409388905,
      0.9993901328804057,
      0.9989911526141649,
      0.9987676456533224,
      0.9986724777596906,
      0.9986697290588868,
      0.9987342814912026,
      0.9988397756522094,
      0.9989756166030785,
      0.9991200309747728,
      0.9992621551645858,
      0.9994035221256672,
      0.9995303572870538,
      0.9996405939737665,
      0.9997394992090661,
      0.9998204037171646,
      0.9998849475545486,
      0.9999380421221211,
      0.9999775818502517,
      1.0000059803454007,
      1.0000264835439028,
      1,
    ];

    var expectedVelocities = [
      0.2276775324800067,
      3.1774598721505054,
      5.1793267330810915,
      6.295509849377661,
      6.764476633590014,
      6.76742694258232,
      6.431820383696734,
      5.890780309158667,
      5.1974947091126475,
      4.462143087776778,
      3.7394582582521605,
      3.021424291526861,
      2.3776517513733193,
      1.8184393728184831,
      1.3169969453548693,
      0.906988991160123,
      0.5800273047791344,
      0.31119327922524626,
      0.11108882863895153,
      -0.03254366218086566,
      -0.1361569165953432,
      -0.2004956653386716,
      -0.23531870559388396,
      -0.24897437017600185,
      -0.24591942995283073,
      -0.2319823912240368,
      -0.2100747888822411,
      -0.18454561286117094,
      -0.1580280108075904,
      -0.13062975758538428,
      -0.10529753257479642,
      -0.08272714732814185,
      -0.062017752864186065,
      -0.044703645341229135,
      -0.030588635672438014,
      -0.01870387489501671,
      -0.009611048353110578,
      -0.0028653747019518534,
      0.002221614953962866,
      0.005602663755134356,
      0.0076693990836953,
      0.008796769142543886,
      0.009131171230224182,
      0.008922837011801944,
      0.00832006031857832,
      0.007490584515806349,
      0.006556941548531174,
      0.00554210142341889,
      0.004568554860624362,
      0.0036759782316913665,
      0.002836575672722143,
      0.0021186451259753557,
      0.0015206065620057547,
      0.0010057481768040006,
      0,
    ];

    var actualValues = [],
      actualVelocities = [];

    var listener = {
      onSpringUpdate: function() {
        actualValues.push(spring.getCurrentValue());
        actualVelocities.push(spring.getVelocity());
      },
    };

    spyOn(listener, 'onSpringUpdate').andCallThrough();
    spring.addListener(listener);
    spring.setEndValue(1);
    expect(actualValues).toEqual(expectedValues);
    expect(actualVelocities).toEqual(expectedVelocities);
  });

  it('should not oscillate if overshoot clamping is enabled', function() {
    var actualValues = [];
    var listener = {
      onSpringUpdate: function() {
        actualValues.push(spring.getCurrentValue());
      },
    };

    spyOn(listener, 'onSpringUpdate').andCallThrough();
    spring.addListener(listener);
    spring.setOvershootClampingEnabled(true);
    spring.setEndValue(1);

    var didOscillate = false;
    var priorValue = -1;
    for (var i = 0; i < actualValues.length; i++) {
      var currentValue = actualValues[i];
      if (currentValue < priorValue) {
        didOscillate = true;
        break;
      }
      priorValue = currentValue;
    }

    expect(didOscillate).toBe(false);
  });

  it('should not oscillate if the spring has 0 tension', function() {
    var actualValues = [];
    var listener = {
      onSpringUpdate: function() {
        actualValues.push(spring.getCurrentValue());
      },
    };

    spyOn(listener, 'onSpringUpdate').andCallThrough();
    spring.addListener(listener);
    spring.setSpringConfig(
      rebound.SpringConfig.coastingConfigWithOrigamiFriction(7),
    );
    spring.setVelocity(1000);

    var didOscillate = false;
    var priorValue = -1;
    for (var i = 0; i < actualValues.length; i++) {
      var currentValue = actualValues[i];
      if (currentValue < priorValue) {
        didOscillate = true;
        break;
      }
      priorValue = currentValue;
    }

    expect(didOscillate).toBe(false);
  });

  it('should be at rest after calling setCurrentValue', function() {
    var springSystem = new rebound.SpringSystem();
    var spring = springSystem.createSpring();
    spring.setEndValue(1);
    spring.setCurrentValue(-1);
    expect(spring.isAtRest()).toBe(true);
    expect(spring.getCurrentValue()).toBe(-1);
    expect(spring.getEndValue()).toBe(-1);
  });

  it('should not be at rest if the skipSetAtRest parameter is passed to setCurrentValue while moving', function() {
    var springSystem = new rebound.SpringSystem();
    var spring = springSystem.createSpring();
    spring.setEndValue(1);
    spring.setCurrentValue(-1, true);
    expect(spring.isAtRest()).toBe(false);
    expect(spring.getCurrentValue()).toBe(-1);
    expect(spring.getEndValue()).toBe(1);
  });
});

describe('Rebound Utilities', function() {
  it('should interpolate numbers in ranges', function() {
    var val = rebound.util.mapValueInRange(150, 100, 200, 0, -300);
    expect(val).toBe(-150);
  });

  it('should convert degrees to radians', function() {
    var val = rebound.util.degreesToRadians(57.29577951308232);
    expect(val).toEqual(1);
  });

  it('should convert radian to degrees', function() {
    var val = rebound.util.radiansToDegrees(1);
    expect(val).toBe(57.29577951308232);
  });

  it('should interpolate hex colors', function() {
    var middleColor = rebound.util.interpolateColor(0.5, '#ff0000', '#0000ff');
    expect(middleColor).toBe('#7f007f');
  });

  it('should interpolate hex colors with an optional input range', function() {
    var middleColor = rebound.util.interpolateColor(
      100,
      '#ff0000',
      '#0000ff',
      0,
      200,
    );
    expect(middleColor).toBe('#7f007f');
  });

  it('should interpolate hex colors with an optional rgb return value', function() {
    var middleColor = rebound.util.interpolateColor(
      0.5,
      '#ff0000',
      '#0000ff',
      0,
      1,
      true,
    );
    expect(middleColor).toBe('rgb(127,0,127)');
  });

  it('should call functions async with onFrame', function() {
    // checks for setImmediate in node
    var called = false;
    var next = function() {
      called = true;
    };
    runs(function() {
      rebound.util.onFrame(next);
    });
    waitsFor(
      function() {
        return called;
      },
      'next not called',
      10,
    );
    runs(function() {
      expect(called).toBe(true);
    });
  });
});
