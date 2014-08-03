createHamburgerButtonExample = function(container, size, color, bgColor) {
  var ex = document.createElement('div');
  ex.className = 'example';
  container.appendChild(ex);
  ex.style.backgroundColor = bgColor;
  new hamburgerButton.HamburgerButton(ex, size, color);
};

var doit = function() {
  var container = document.getElementById('hamburgerButtonExample');
  createHamburgerButtonExample(container, 200, '#1194e7');
  createHamburgerButtonExample(container, 100, '#cc0000');
  createHamburgerButtonExample(container, 50, '#00cc00');
  createHamburgerButtonExample(container, 25, '#cc00ff');
  createHamburgerButtonExample(container, 25, '#00ccff');
  createHamburgerButtonExample(container, 25, '#ffcc00');
  createHamburgerButtonExample(container, 25, '#ccff00');
};

document.addEventListener('DOMContentLoaded', doit);