// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  var hasCamera = false;

  if (window.navigator.mediaDevices && window.navigator.mediaDevices.enumerateDevices)
  {
    window.navigator.mediaDevices.enumerateDevices().then(
      function(devices)
      {
        hasCamera = devices.some(function(d) { return d.kind === 'videoinput'; });
      },
      function() {}
    );
  }

  return function()
  {
    return hasCamera;
  };
});
