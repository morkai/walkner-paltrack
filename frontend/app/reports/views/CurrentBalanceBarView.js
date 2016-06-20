// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/currentBalance',
  'app/data/palletKinds',
  'app/core/View',
  'app/reports/templates/currentBalanceBar'
], function(
  currentBalance,
  palletKinds,
  View,
  currentBalanceBarTemplate
) {
  'use strict';

  return View.extend({

    template: currentBalanceBarTemplate,

    localTopics: {
      'palletKinds.synced': 'render'
    },

    initialize: function()
    {
      this.listenTo(currentBalance, 'reset', this.render);
    },

    serialize: function()
    {
      var goods = currentBalance.length ? currentBalance.at(0).get('goods') : {};
      var viewData = {
        palletKinds: []
      };

      Object.keys(goods).forEach(function(palletKindId)
      {
        var palletKind = palletKinds.get(palletKindId);

        if (palletKind)
        {
          viewData.palletKinds.push({
            label: palletKind.getLabel(),
            count: goods[palletKindId],
            position: palletKind.get('position')
          });
        }
      });

      viewData.palletKinds.sort(function(a, b)
      {
        return a.position - b.position;
      });

      return viewData;
    },

    afterRender: function()
    {
      if (this.el.childElementCount)
      {
        this.$el.show();
        this.el.ownerDocument.body.style.marginBottom = (16 + this.$el.outerHeight(true)) + 'px';
      }
      else
      {
        this.$el.hide();
        this.el.ownerDocument.body.style.marginBottom = '';
      }
    }

  });
});
