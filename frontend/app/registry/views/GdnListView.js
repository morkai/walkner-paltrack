// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  './GrnListView'
], function(
  _,
  t,
  user,
  ListView,
  GrnListView
) {
  'use strict';

  return GrnListView.extend({

    className: 'registryList gdn',

    firstPartnerProperty: 'supplier',
    secondPartnerProperty: 'receiver',

    events: _.extend({}, GrnListView.prototype.events, {
      'click .action-print': function(e)
      {
        window.open(e.currentTarget.href);

        return false;
      }
    }),

    initialize: function()
    {
      GrnListView.prototype.initialize.call(this);

      var printedTopic = 'registry.gdn.printed.'
        + user.data.partner ? (user.data.partner + '.*') : '**';

      this.pubsub.subscribe(printedTopic, this.onGdnPrinted.bind(this));
    },

    serializeActions: function()
    {
      var collection = this.collection;
      var canManage = user.isAllowedTo('REGISTRY:MANAGE');

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [
          {
            id: 'print',
            icon: 'print',
            label: t('registry', 'LIST:ACTION:print'),
            href: model.url() + ';print'
          },
          ListView.actions.viewDetails(model)
        ];

        if (canManage && !model.get('printedAt'))
        {
          actions.push(
            ListView.actions.edit(model),
            ListView.actions.delete(model)
          );
        }

        return actions;
      };
    },

    onGdnPrinted: function(message)
    {
      var gdn = this.collection.get(message._id);

      if (gdn)
      {
        gdn.set('printedAt', message.printedAt);

        this.$('.list-item[data-id="' + gdn.id + '"]')
          .find('.action-edit, .action-delete')
          .remove();
      }
    }

  });
});
