// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../user',
  '../core/Model',
  'app/core/templates/userInfo',
  '../data/partners'
], function(
  time,
  user,
  Model,
  renderUserInfo,
  partners
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/daily-balance',

    clientUrlRoot: '#reports/daily-balance',

    privilegePrefix: 'REPORTS',

    nlsDomain: 'reports',

    defaults: function()
    {
      return {
        goods: null
      };
    },

    serialize: function()
    {
      var partner = partners.get(this.id);

      var obj = {
        _id: this.id,
        partner: partner ? partner.getLabel() : this.id,
        total: 0
      };

      var goods = this.get('goods');

      Object.keys(goods).forEach(function(palletKind)
      {
        obj['goods.' + palletKind] = goods[palletKind];
        obj.total += goods[palletKind];
      });

      return obj;
    }

  });
});
