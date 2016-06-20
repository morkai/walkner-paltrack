// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  './GoodsTableView',
  'app/registry/templates/obDetails'
], function(
  DetailsView,
  GoodsTableView,
  obDetailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: obDetailsTemplate,

    initialize: function()
    {
      DetailsView.prototype.initialize.call(this);

      this.insertView('.panel', new GoodsTableView({model: this.model}));
    }

  });
});
