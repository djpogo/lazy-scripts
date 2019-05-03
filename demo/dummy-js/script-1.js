(function script1() {
  console.log('Script 1 loaded, parsed, executed - it\'s a IIFE');
  document.querySelector('[data-script-one-target]').textContent = 'Script 1 loaded, parsed and executed…';
}());
