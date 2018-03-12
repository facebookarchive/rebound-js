import rebound from 'rebound';
import {
  createSpring,
  downEvt,
  drawGridLines,
  mapValueFromRangeToRange,
  scale,
  upEvt,
} from '../util';

const example1 = function() {
  const springSystem = new rebound.SpringSystem();
  const spring = createSpring(springSystem, 40, 3);
  const springConfig = spring.getSpringConfig();
  const photo = document.getElementById('example-photo');
  spring.addListener({
    onSpringUpdate(_spring) {
      scale(
        photo,
        mapValueFromRangeToRange(_spring.getCurrentValue(), 0, -1, 1, 0.5),
      );
    },
  });

  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  const graphScale = 80;

  let time = 0;
  class GraphingSpringSystemListener {
    constructor() {
      this.height = canvas.height;
      this.width = canvas.width;
      this.lastTime = 0;
    }

    onBeforeIntegrate() {}

    onAfterIntegrate() {
      time += 3;
      this.graphSpring(spring, 'black');

      if (time >= 600) {
        ctx.moveTo(0, canvas.height / 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGridLines(canvas, ctx, graphScale);
        time = 0;
        graphingSpringSystemListener.lastTime = time;
      }
      this.lastTime = time;
    }

    graphSpring(_spring, color) {
      const x = time;
      const y = _spring.getCurrentValue() * graphScale + this.height / 2;
      if (this.lastX > x) {
        this.lastX = 1;
      }
      ctx.beginPath();
      ctx.moveTo(this.lastTime, _spring.lastY || this.height / 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();
      _spring.lastY = y;
    }
  }

  const graphingSpringSystemListener = new GraphingSpringSystemListener();
  drawGridLines(canvas, ctx, graphScale);
  springSystem.addListener(graphingSpringSystemListener);

  photo.addEventListener(downEvt, () => {
    spring.setEndValue(-1);
  });

  document.body.addEventListener(upEvt, () => {
    spring.setEndValue(0);
  });

  const frictionControl = document.getElementById('friction');
  const frictionValue = document.getElementById('friction_value');
  const tensionControl = document.getElementById('tension');
  const tensionValue = document.getElementById('tension_value');

  const onFrictionChange = function() {
    springConfig.friction = rebound.OrigamiValueConverter.frictionFromOrigamiValue(
      frictionControl.value,
    );
    frictionValue.innerHTML = frictionControl.value;
  };

  const onTensionChange = function() {
    springConfig.tension = rebound.OrigamiValueConverter.tensionFromOrigamiValue(
      tensionControl.value,
    );
    tensionValue.innerHTML = tensionControl.value;
  };

  frictionControl.addEventListener('change', onFrictionChange);
  frictionControl.addEventListener('input', onFrictionChange);

  tensionControl.addEventListener('change', onTensionChange);
  tensionControl.addEventListener('input', onTensionChange);
};

document.addEventListener('DOMContentLoaded', example1);
