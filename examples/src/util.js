import rebound from 'rebound';

export function createSpring(springSystem, friction, tension, rawValues) {
  const spring = springSystem.createSpring();
  let springConfig;
  if (rawValues) {
    springConfig = new rebound.SpringConfig(friction, tension);
  } else {
    springConfig = rebound.SpringConfig.fromOrigamiTensionAndFriction(
      friction,
      tension,
    );
  }
  spring.setSpringConfig(springConfig);
  spring.setCurrentValue(0);
  return spring;
}

export function xlat(el, x, y) {
  el.style.mozTransform = el.style.msTransform = el.style.webkitTransform = el.style.transform =
    'translate3d(' + x + 'px, ' + y + 'px, 0px)';
}

export function scale(el, val) {
  el.style.mozTransform = el.style.msTransform = el.style.webkitTransform = el.style.transform =
    'scale3d(' + val + ', ' + val + ', 1)';
}

export function xfrm(el, xlatX = 0, xlatY = 0, _scale = 1, rot = 0) {
  const transformString =
    'translate3d(' +
    xlatX +
    'px, ' +
    xlatY +
    'px, 0px) ' +
    'scale3d(' +
    _scale +
    ', ' +
    _scale +
    ', 1) ' +
    'rotate(' +
    rot +
    'deg)';
  el.style.mozTransform = el.style.msTransform = el.style.webkitTransform = el.style.transform = transformString;
}

export function drawGridLines(canvas, ctx, graphScale) {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(0, -1 * graphScale + canvas.height / 2);
  ctx.lineTo(canvas.width, -1 * graphScale + canvas.height / 2);
  ctx.moveTo(0, 1 * graphScale + canvas.height / 2);
  ctx.lineTo(canvas.width, 1 * graphScale + canvas.height / 2);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#ff0000';
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = 0.25;
  ctx.beginPath();
  for (let i = 0; i < 600; i += 10) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
  }
  for (let i = 0; i < 600; i += 10) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
  }
  ctx.strokeStyle = '#0000ff';
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.closePath();
}

export function mapValueFromRangeToRange(
  value,
  fromLow,
  fromHigh,
  toLow,
  toHigh,
) {
  const fromRangeSize = fromHigh - fromLow;
  const toRangeSize = toHigh - toLow;
  const valueScale = (value - fromLow) / fromRangeSize;
  return toLow + valueScale * toRangeSize;
}

export const downEvt =
  window.ontouchstart !== undefined ? 'touchstart' : 'mousedown';
export const upEvt = window.ontouchend !== undefined ? 'touchend' : 'mouseup';
