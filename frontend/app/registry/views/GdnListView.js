// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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

    className: 'registryList gdn is-clickable',

    firstPartnerProperty: 'supplier',
    secondPartnerProperty: 'receiver',

    events: _.extend({}, GrnListView.prototype.events, {
      'click .action-print': function(e)
      {
        window.open(e.currentTarget.href);

        return false;
      }
    }),

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

        if (canManage)
        {
          actions.push(
            ListView.actions.edit(model),
            ListView.actions.delete(model)
          );
        }

        return actions;
      };
    }

  });
});
