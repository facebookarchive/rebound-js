import rebound from 'rebound';
import {xlat, xfrm} from '../util';

const onFrame = rebound.util.onFrame;

class Cascade {
  constructor(onEndListener) {
    this.springSystem = new rebound.SpringSystem(
      new rebound.SimulationLooper(),
    );
    this.spring = this.springSystem.createSpring(40, 4);
    this.spring.setRestSpeedThreshold = 0.5;
    this.spring.setRestDisplacementThreshold = 0.5;
    this.frames = [];
    this.players = [];
    this.currentFrame = 0;
    this.recordSpring(1);
    this.onEndListener = onEndListener;
    this._boundFrameCallback = this.renderFrame.bind(this);
  }

  reset() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].frame = 0;
    }
    this.currentFrame = 0;
    return this;
  }

  recordSpring(pos) {
    this.start = this.spring.getCurrentValue();
    this.end = pos;
    this.frames = [];
    this.spring.addListener(this);
    this.spring.setEndValue(pos);
    this.spring.removeListener(this);
    return this;
  }

  onSpringUpdate(spring) {
    this.frames.push(spring.getCurrentValue());
  }

  addPlayer(fn) {
    this.players.push({frame: 0, fn, pos: this.players.length});
  }

  play() {
    if (this.playing) {
      return;
    }
    this.reset();
    if (this.didPlayOnce) {
      const target = this.spring.getEndValue() === 1 ? 0 : 1;
      this.spring.setOvershootClampingEnabled(target !== 1);
      this.recordSpring(target);
      this.players = this.players.reverse();
    }
    this.didPlayOnce = true;
    this.playing = true;
    this._boundFrameCallback();
  }

  renderFrame() {
    const toPlay = [];
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (player.frame < this.frames.length && i <= this.currentFrame) {
        toPlay.push(player);
      }
    }

    if (toPlay.length > 0) {
      for (let j = 0; j < toPlay.length; j++) {
        const _p = toPlay[j];
        const _frame = this.frames[_p.frame];
        _p.fn(_p.pos, _p.frame, _frame, this.start, this.end);
        _p.frame++;
      }
      this.currentFrame++;
      onFrame(this._boundFrameCallback);
    } else {
      this.playing = false;
      this.onEndListener && this.onEndListener();
    }
  }
}

const doit = function() {
  const container = document.getElementById('cascadeEffectExample');

  const button = document.createElement('button');
  button.innerHTML = 'Transition In';
  let movingIn = true;
  button.addEventListener('click', () => {
    button.disabled = true;
    cascade.play();
  });
  container.appendChild(button);

  const secondContainer = document.createElement('div');
  secondContainer.className = 'secondContainer';
  container.appendChild(secondContainer);

  const cascade = new Cascade(() => {
    button.disabled = false;
    if (movingIn) {
      button.innerHTML = 'Transition Out';
      movingIn = false;
    } else {
      button.innerHTML = 'Transition In';
      movingIn = true;
    }
  });

  for (let i = 0; i < 10; i++) {
    const div = document.createElement('div');
    div.className = 'cascadeRow';
    div.innerHTML = 'row ' + (i + 1);
    div.style.opacity = 0;

    const r = Math.floor(rebound.MathUtil.mapValueInRange(i, 0, 9, 203, 255));
    const g = Math.floor(rebound.MathUtil.mapValueInRange(i, 0, 9, 17, 210));
    const b = Math.floor(rebound.MathUtil.mapValueInRange(i, 0, 9, 231, 0));
    div.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';

    container.appendChild(div);

    cascade.addPlayer(
      (function(_div) {
        let clamped = false;
        let lastEnd;
        return function(idx, frame, val, start, end) {
          if (lastEnd !== end) {
            clamped = false;
          }

          const x = rebound.MathUtil.mapValueInRange(val, 0, 1, -200, 0);
          xlat(_div, x, 0);
          if (
            (end > start && val > end) ||
            (end < start && val < end) ||
            clamped
          ) {
            val = end;
            clamped = true;
          }

          _div.style.opacity = val * 0.75;
          lastEnd = end;
        };
      })(div),
    );
  }

  for (let i = 0; i < 117; i++) {
    const div = document.createElement('div');
    div.className = 'dot';
    div.style.opacity = 0;
    secondContainer.appendChild(div);

    const r = Math.floor(rebound.MathUtil.mapValueInRange(i, 0, 117, 17, 0));
    const g = Math.floor(rebound.MathUtil.mapValueInRange(i, 0, 117, 148, 204));
    const b = Math.floor(rebound.MathUtil.mapValueInRange(i, 0, 117, 231, 0));
    div.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';

    cascade.addPlayer(
      (function(_div) {
        let clamped = false;
        let lastEnd;
        return function(idx, frame, val, start, end) {
          if (lastEnd !== end) {
            clamped = false;
          }

          const y = rebound.MathUtil.mapValueInRange(val, 0, 1, 0, 0);
          const x = rebound.MathUtil.mapValueInRange(val, 0, 1, 100, 0);
          const rot = rebound.MathUtil.mapValueInRange(val, 0, 1, 190, 0);
          const scale = rebound.MathUtil.mapValueInRange(val, 0, 1, 0, 1);

          if (
            (end > start && val > end) ||
            (end < start && val < end) ||
            clamped
          ) {
            val = end;
            clamped = true;
          }

          _div.style.opacity = val * 0.5;
          xfrm(_div, x, y, scale, rot);

          lastEnd = end;
        };
      })(div),
    );
  }

  setTimeout(() => {
    if (cascade.playing) {
      return;
    }
    button.disabled = true;
    cascade.play();
  }, 1000);
};

document.addEventListener('DOMContentLoaded', doit);
