// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  './GoodsTableView',
  'app/registry/templates/grnDetails'
], function(
  DetailsView,
  GoodsTableView,
  grnDetailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: grnDetailsTemplate,

    remoteTopics: function()
    {
      var topics = DetailsView.prototype.remoteTopics.call(this);

      topics[this.model.getTopicPrefix() + '.checked.' + this.model.id] = 'onGrnChecked';

      return topics;
    },

    initialize: function()
    {
      DetailsView.prototype.initialize.call(this);

      this.insertView('.panel', new GoodsTableView({model: this.model}));
    },

    onGrnChecked: function()
    {
      this.promised(this.model.fetch());
    }

  });
});
