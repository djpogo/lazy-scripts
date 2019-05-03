(function script2() {
  console.log("Script 2 loaded, parsed, executed - it's a IIFE");
  document.querySelector('[data-script-two-target').textContent = 'Script 2 loaded, parsed and executed… and look moment is here: ' + moment().format('MMMM Do YYYY, h:mm:ss a');
}());
