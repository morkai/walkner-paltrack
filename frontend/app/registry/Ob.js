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

    urlRoot: '/registry/ob',

    clientUrlRoot: '#registry/ob',

    topicPrefix: 'registry.ob',

    privilegePrefix: 'REGISTRY',

    nlsDomain: 'registry',

    defaults: function()
    {
      return {
        partner: user.data.partner,
        date: time.getMoment().hours(0).minutes(0).milliseconds(0).toISOString(),
        goods: {},
        createdAt: null,
        creator: null,
        updatedAt: null,
        updater: null,
        changes: null
      };
    },

    getLabel: function()
    {
      return time.format(this.get('date'), 'YYYY-MM-DD');
    },

    serialize: function()
    {
      var partner = partners.get(this.get('partner'));

      var obj = {
        _id: this.id,
        partner: partner ? partner.getLabel() : this.get('partner'),
        date: time.format(this.get('date'), 'YYYY-MM-DD'),
        createdAt: this.get('createdAt') ? time.format(this.get('createdAt'), 'LLLL') : null,
        updatedAt: this.get('updatedAt') ? time.format(this.get('updatedAt'), 'LLLL') : null,
        creator: renderUserInfo({userInfo: this.get('creator')}),
        updater: renderUserInfo({userInfo: this.get('updater')})
      };

      var goods = this.get('goods');

      Object.keys(goods).forEach(function(palletKind)
      {
        obj['goods.' + palletKind] = goods[palletKind];
      });

      return obj;
    }

  });
});
