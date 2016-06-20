// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/data/palletKinds',
  'app/registry/templates/goodsTable'
], function(
  View,
  palletKinds,
  goodsTableTemplate
) {
  'use strict';

  return View.extend({

    template: goodsTableTemplate,

    serialize: function()
    {
      var goods = this.model.get('goods');
      var ths = [];
      var tds = [];

      Object.keys(goods).forEach(function(palletKindId)
      {
        var palletKind = palletKinds.get(palletKindId);

        ths.push(palletKind ? palletKind.getLabel() : palletKindId);
        tds.push(goods[palletKindId]);
      });

      return {
        ths: ths,
        tds: tds
      };
    }

  });
});
