// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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

    urlRoot: '/reports/current-balance',

    clientUrlRoot: '#registry/current-balance',

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
