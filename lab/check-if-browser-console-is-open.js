//http://nepjua.org/check-if-browser-console-is-open/
/*
Today i wanted to detect if user's inspector is open or not. I remembered a code i saw in meteor's test runner. I gave it a shot and implemented it. It's a very hacky way but it works.

The theory behind this method is that time spent between two statements are low, i didn't get the actual number but i know that it's low than 100ms. It might be even less than miliseconds. So if we check the time spent between startTime and endTime we can know that the inspecter is open. Anyway, here is the code:
*/
function isConsoleOpen() {  
  var startTime = new Date();
  debugger;
  var endTime = new Date();

  return endTime - startTime > 100;
}

$(function() {
  $(window).resize(function() {
    if(isConsoleOpen()) {
        alert("You're one sneaky dude, aren't you ?")
    }
  });
});
/*
There is always a hacky way to do something in javascript. Above code is written only to demonstrate the theory i explained here and it's a very poor implementation of it.

It would be more pleasent if we could do this without having to pause user's debugger on the debugger; statement. Anyway we could still be able to achieve what we wanted. You can use this trick to a few things, for example hiring a developer. If someone is inspecting your web application he/she might be interested in working with you.
*/


//https://github.com/tuzebra/devtools-detect/blob/gh-pages/devtools-detect.js
var threshold = 160;
(window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || 
window.outerWidth - window.innerWidth > threshold ||
window.outerHeight - window.innerHeight > threshold)