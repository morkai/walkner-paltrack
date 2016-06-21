// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/data/palletKinds',
  'app/registry/templates/goodsTable'
], function(
  _,
  View,
  palletKinds,
  goodsTableTemplate
) {
  'use strict';

  return View.extend({

    template: goodsTableTemplate,

    serialize: function()
    {
      var goods = _.clone(this.model.get('goods'));
      var ths = [];
      var tds = [];

      palletKinds.forEach(function(palletKind)
      {
        var count = goods[palletKind.id];

        if (count)
        {
          ths.push(palletKind.getLabel());
          tds.push(count);
        }

        delete goods[palletKind.id];
      });

      Object.keys(goods).forEach(function(palletKindId)
      {
        ths.push(palletKindId);
        tds.push(goods[palletKindId]);
      });

      return {
        ths: ths,
        tds: tds
      };
    }

  });
});
