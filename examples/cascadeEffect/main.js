(function () {
  var extend = rebound.util.extend;
  var bind = rebound.util.bind;
  var onFrame = rebound.util.onFrame;

  var Cascade = function() {
    this.springSystem = new rebound.SpringSystem(new rebound.SimulationLooper());
    this.spring = this.springSystem.createSpring();
    this.frames = [];
    this.recordSpring();
    this.players = [];
    this.currentFrame = 0;
    this._boundFrameCallback = bind(this.renderFrame, this);
  };

  extend(Cascade.prototype, {

    recordSpring: function() {
      this.spring.addListener(this);
      this.spring.setEndValue(1);
      this.spring.removeListener(this);
    },

    onSpringUpdate: function(spring) {
      this.frames.push(spring.getCurrentValue())
    },

    addPlayer: function(fn) {
      this.players.push({frame: 0, fn: fn, pos: this.players.length});
    },

    play: function() {
      if (this.playing) {
        return;
      }
      this.playing = true;
      this._boundFrameCallback();
    },

    renderFrame: function() {
      var toPlay = [];
      for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (player.frame < this.frames.length && i <= this.currentFrame) {
          toPlay.push(player);
        }
      }

      if (toPlay.length > 0) {
        for (var j = 0; j < toPlay.length; j++) {
          var _p = toPlay[j];
          var _frame = this.frames[_p.frame]
          _p.fn(_p.pos, _frame, _p.frame);
          _p.frame++;
        }
        this.currentFrame++;
        onFrame(this._boundFrameCallback);
      } else {
        this.playing = false;
      }
    }
  });


  var doit = function() {
    var container = document.getElementById('cascadeEffectExample');
    var cascade = new Cascade();

    for (var i = 0; i < 10; i++) {
      var div = document.createElement('div');
      div.className = 'cascadeRow'
      div.innerHTML = 'row ' + (i+1);
      div.style.opacity = 0;
      container.appendChild(div);
      cascade.addPlayer(
        (function(div) {
          return function(idx, val, frame) {
            var x = rebound.MathUtil.mapValueInRange(val, 0, 1, 200, 0);
            xlat(div, x, 0);
            div.style.opacity = val;
            div.style.display = 'block';
          };
        })(div)
      );
    }

    setTimeout(function() {
      cascade.play();
    }, 1000);
  };

  document.addEventListener('DOMContentLoaded', doit);
})();
