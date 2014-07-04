// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
