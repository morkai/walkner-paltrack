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

    urlRoot: '/registry/gdn',

    clientUrlRoot: '#registry/gdn',

    topicPrefix: 'registry.gdn',

    privilegePrefix: 'REGISTRY',

    nlsDomain: 'registry',

    labelAttribute: 'docNo',

    defaults: function()
    {
      return {
        supplier: user.data.partner,
        receiver: null,
        date: time.getMoment().hours(0).minutes(0).milliseconds(0).toISOString(),
        docNo: null,
        goods: [],
        printedAt: null,
        createdAt: null,
        creator: null,
        updatedAt: null,
        updater: null,
        changes: null,
        checked: false,
        checkedAt: null,
        checker: null
      };
    },

    serialize: function()
    {
      var supplier = partners.get(this.get('supplier'));
      var receiver = partners.get(this.get('receiver'));

      var obj = {
        className: this.get('checked') ? 'is-checked' : '',
        _id: this.id,
        supplier: supplier ? supplier.getLabel() : this.get('supplier'),
        supplierColor: supplier ? supplier.get('supplierColor') : '',
        receiver: receiver ? receiver.getLabel() : this.get('receiver'),
        receiverColor: receiver ? receiver.get('receiverColor') : '',
        date: time.format(this.get('date'), 'YYYY-MM-DD'),
        docNo: this.get('docNo'),
        printedAt: this.get('printedAt') ? time.format(this.get('printedAt'), 'LLLL') : null,
        createdAt: this.get('createdAt') ? time.format(this.get('createdAt'), 'LLLL') : null,
        updatedAt: this.get('updatedAt') ? time.format(this.get('updatedAt'), 'LLLL') : null,
        checkedAt: this.get('checkedAt') ? time.format(this.get('checkedAt'), 'LLLL') : null,
        creator: renderUserInfo({userInfo: this.get('creator')}),
        updater: renderUserInfo({userInfo: this.get('updater')}),
        checker: renderUserInfo({userInfo: this.get('checker')}),
        checked: '<i class="fa fa-thumbs-' + (this.get('checked') ? 'up' : 'down') + '"></i>',
        goods: []
      };

      var goods = this.get('goods');

      Object.keys(goods).forEach(function(palletKind)
      {
        obj.goods.push({
          palletKind: palletKind,
          count: goods[palletKind]
        });

        obj['goods.' + palletKind] = goods[palletKind].toLocaleString();
      });

      return obj;
    }

  });
});
