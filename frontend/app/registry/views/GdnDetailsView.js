// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/core/views/DetailsView',
  './GoodsTableView',
  'app/registry/templates/gdnDetails'
], function(
  DetailsView,
  GoodsTableView,
  gdnDetailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: gdnDetailsTemplate,

    initialize: function()
    {
      DetailsView.prototype.initialize.call(this);

      this.insertView('.panel', new GoodsTableView({model: this.model}));
    }

  });
});
