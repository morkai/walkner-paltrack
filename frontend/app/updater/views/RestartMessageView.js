// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View'
], function(
  View
) {
  'use strict';

  return View.extend({

    destroy: function()
    {
      this.el.ownerDocument.body.style.marginBottom = '';
    },

    afterRender: function()
    {
      this.el.ownerDocument.body.style.marginBottom = (this.$el.outerHeight() + 15) + 'px';
    }

  });
});
