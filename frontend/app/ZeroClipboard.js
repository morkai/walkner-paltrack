// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'zeroclipboard'
], function(
  ZeroClipboard
) {
  'use strict';

  ZeroClipboard.config({
    moviePath: '/vendor/zeroclipboard/ZeroClipboard.swf',
    cacheBust: false,
    zIndex: 100
  });

  return ZeroClipboard;
});
