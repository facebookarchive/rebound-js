(function() {
  var hb = {};

  var deg2rad = rebound.MathUtil.degreesToRadians;
  var mapVal = rebound.MathUtil.mapValueInRange;

  hb.HamburgerButton = function(container, size, color, cornerRadius) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.padding = size * 0.1;
    this.size = size - this.padding * 2;
    this.width = this.size;
    this.height = this.size;
    this.canvas.width = size;
    this.canvas.height = size;
    this.barHeight = this.size / 5;
    this.rotatedXlat = Math.sqrt((this.barHeight * this.barHeight) / 2);
    this.radius = cornerRadius || this .size * 0.05;
    var ab = (this.width - this.rotatedXlat);
    this.rotatedWidth = Math.sqrt(ab * ab + ab * ab);
    this.color = color;

    this.container = container;
    this.container.innerHTML = '';

    this.springSystem = new rebound.SpringSystem();
    this.animationSpring = this.springSystem.createSpring();
    this.animationSpring.addListener(this);

    this.render();
    container.appendChild(this.canvas);
    this.canvas.addEventListener('click', bind(this.toggle, this));
  };

  extend(hb.HamburgerButton.prototype, {
    toggle: function() {
      if (this.animationSpring.getEndValue() === 1) {
        this.animationSpring.setEndValue(0);
      } else {
        this.animationSpring.setEndValue(1);
      }
    },

    onSpringUpdate: function(spring) {
      this.render();
    },

    drawBar: function(width) {
      this.ctx.fillStyle = this.color;

      this.ctx.moveTo(0, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(this.radius, 0);
      this.ctx.lineTo(width - this.radius, 0);
      this.ctx.quadraticCurveTo(width, 0, width, this.radius);
      this.ctx.lineTo(width, this.barHeight - this.radius);
      this.ctx.quadraticCurveTo(width, this.barHeight, width - this.radius, this.barHeight);
      this.ctx.lineTo(this.radius, this.barHeight);
      this.ctx.quadraticCurveTo(0, this.barHeight, 0, this.barHeight - this.radius);
      this.ctx.lineTo(0, this.radius);
      this.ctx.quadraticCurveTo(0, 0, this.radius, 0);
      this.ctx.closePath();
      this.ctx.fill();
    },

    render: function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.save();
      this.ctx.translate(this.padding, this.padding);

        var xlatX, xlatY, rot, width;
        var pos = this.animationSpring.getCurrentValue();
        var val = this.animationSpring.getCurrentValue();

        xlatX = mapVal(val, 0, 1, 0, this.rotatedXlat);
        rot = mapVal(val, 0, 1, 0, 45);
        width = mapVal(val, 0, 1, this.width, this.rotatedWidth);

        // draw top bar
        this.ctx.save();
        this.ctx.translate(xlatX, 0);
        this.ctx.rotate(deg2rad(rot));
        this.drawBar(width);
        this.ctx.restore();

        // draw middle bar
        this.ctx.save();

        xlatX = mapVal(val, 0, 1, 0, this.width / 2);
        width = mapVal(val, 0, 1, this.width, 0);

        this.ctx.translate(xlatX, this.height / 2 - this.barHeight / 2);
        this.drawBar(width);
        this.ctx.restore();

        // draw bottom bar
        this.ctx.save();

        xlatY = mapVal(val, 0, 1, this.height - this.barHeight, this.height - this.rotatedXlat);
        rot = mapVal(val, 0, 1, 0, -45);
        width = mapVal(val, 0, 1, this.width, this.rotatedWidth);

        this.ctx.translate(0, xlatY);
        this.ctx.rotate(deg2rad(rot));
        this.drawBar(width);
        this.ctx.restore();

      this.ctx.restore();
    }
  });

  // Utils
  if (typeof exports != 'undefined') {
    extend(exports, hb);
  } else if (typeof window != 'undefined') {
    window.hamburgerButton = hb;
  }

  var slice = Array.prototype.slice;
  var concat = Array.prototype.concat;

  function bind(func, context) {
    args = slice.call(arguments, 2);
    return function() {
      func.apply(context, concat.call(args, slice.call(arguments)));
    };
  }

  function extend(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }
})();