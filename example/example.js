createHamburgerButtonExample = function(container, size, color, bgColor) {
  var ex = document.createElement('div');
  ex.className = 'example';
  container.appendChild(ex);
  ex.style.backgroundColor = bgColor;
  new hamburgerButton.HamburgerButton(ex, size, color);
};

var doit = function() {
  var container = document.getElementById('hamburgerButton');
  createHamburgerButtonExample(container, 200, '#999');
  createHamburgerButtonExample(container, 200, '#FFFFFF', '#000');
  createHamburgerButtonExample(container, 100, '#FF0000');
  createHamburgerButtonExample(container, 50, '#00FF00');
  createHamburgerButtonExample(container, 25, '#0000FF');
};

document.addEventListener('DOMContentLoaded', doit);