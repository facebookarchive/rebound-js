[![Build
Status](https://travis-ci.org/facebook/rebound-js.svg?branch=master)](https://travis-ci.org/facebook/rebound-js)

# Rebound
**Rebound** is a simple library that models Spring dynamics for the
purpose of driving physical animations.

## Origin
[Rebound](http://facebook.github.io/rebound) was originally written
in Java to provide a lightweight physics system for
[Home](https://play.google.com/store/apps/details?id=com.facebook.home) and
[Chat Heads](https://play.google.com/store/apps/details?id=com.facebook.orca)
on Android. It's now been adopted by several other Android
applications. This JavaScript port was written to provide a quick
way to demonstrate Rebound animations on the web for a
[conference talk](https://www.youtube.com/watch?v=s5kNm-DgyjY). Since then
the JavaScript version has been used to build some really nice interfaces.
Check out [brandonwalkin.com](http://brandonwalkin.com) for an
example.

## Overview
The Library provides a SpringSystem for maintaining a set of Spring
objects and iterating those Springs through a physics solver loop
until equilibrium is achieved. The Spring class is the basic
animation driver provided by Rebound. By attaching a listener to
a Spring, you can observe its motion. The observer function is
notified of position changes on the spring as it solves for
equilibrium. These position updates can be mapped to an animation
range to drive animated property updates on your user interface
elements (translation, rotation, scale, etc).

Check out the
[tests](http://facebook.github.io/rebound-js/browser_test/index.html), and
[examples](http://facebook.github.io/rebound-js/examples) for more details.

## Example
Here's a simple example. Pressing and releasing on the logo below
will cause it to scale up and down with a springy animation.

```html
<div style="text-align:center; margin-bottom:50px; margin-top:50px">
  <img
    src="http://facebook.github.io/rebound/images/rebound.png"
    id="logo"
  />
</div>
<script src="../rebound.min.js"></script>
<script>
  function scale(el, val) {
    el.style.mozTransform =
    el.style.msTransform =
    el.style.webkitTransform =
    el.style.transform = 'scale3d(' + val + ', ' + val + ', 1)';
  }
  var el = document.getElementById('logo');

  var springSystem = new rebound.SpringSystem();
  var spring = springSystem.createSpring(50, 3);
  spring.addListener({
    onSpringUpdate: function(spring) {
      var val = spring.getCurrentValue();
      val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0.5);
      scale(el, val);
    }
  });

  el.addEventListener('mousedown', function() {
    spring.setEndValue(1);
  });

  el.addEventListener('mouseout', function() {
    spring.setEndValue(0);
  });

  el.addEventListener('mouseup', function() {
    spring.setEndValue(0);
  });
</script>
```

### Here's how it works.

```js
// Get a reference to the logo element.
var el = document.getElementById('logo');

// create a SpringSystem and a Spring with a bouncy config.
var springSystem = new rebound.SpringSystem();
var spring = springSystem.createSpring(50, 3);

// Add a listener to the spring. Every time the physics
// solver updates the Spring's value onSpringUpdate will
// be called.
spring.addListener({
  onSpringUpdate: function(spring) {
    var val = spring.getCurrentValue();
    val = rebound.MathUtil
                 .mapValueInRange(val, 0, 1, 1, 0.5);
    scale(el, val);
  }
});

// Listen for mouse down/up/out and toggle the
//springs endValue from 0 to 1.
el.addEventListener('mousedown', function() {
  spring.setEndValue(1);
});

el.addEventListener('mouseout', function() {
  spring.setEndValue(0);
});

el.addEventListener('mouseup', function() {
  spring.setEndValue(0);
});

// Helper for scaling an element with css transforms.
function scale(el, val) {
  el.style.mozTransform =
  el.style.msTransform =
  el.style.webkitTransform =
  el.style.transform = 'scale3d(' +
    val + ', ' + val + ', 1)';
}
```

### [Code of Conduct](https://code.facebook.com/codeofconduct)

Facebook has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](https://code.facebook.com/codeofconduct) so that you can understand what actions will and will not be tolerated.

