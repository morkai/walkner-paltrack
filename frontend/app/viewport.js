// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/broker',
  'app/core/Viewport'
], function(
  broker,
  Viewport
) {
  'use strict';

  var viewport = new Viewport({
    el: document.body,
    selector: '#app-viewport'
  });

  broker.subscribe('router.executing', function()
  {
    window.scrollTo(0, 0);
  });

  window.viewport = viewport;

  Object.defineProperty(window, 'page', {
    get: function() { return viewport.currentPage; }
  });

  Object.defineProperty(window, 'dialog', {
    get: function() { return viewport.currentDialog; }
  });

  Object.defineProperty(window, 'model', {
    get: function()
    {
      var view = viewport.currentDialog || viewport.currentPage;

      return view && view.model || view.collection;
    }
  });

  return viewport;
});
