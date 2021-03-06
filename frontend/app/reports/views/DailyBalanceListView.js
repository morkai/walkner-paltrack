// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/user',
  'app/data/palletKinds',
  'app/core/views/ListView'
], function(
  $,
  _,
  t,
  user,
  palletKinds,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'dailyBalanceList',

    localTopics: {
      'partners.synced': 'render',
      'palletKinds.synced': 'render'
    },

    remoteTopics: null,

    serializeColumns: function()
    {
      var columns = [{
        id: 'partner',
        label: t('reports', 'PROPERTY:partner')
      }];

      palletKinds.sort().forEach(function(palletKind)
      {
        columns.push({
          id: 'goods.' + palletKind.id,
          label: palletKind.getLabel(),
          noData: 0,
          tdAttrs: 'class="is-number"'
        });
      });

      columns.push({
        id: 'total',
        label: t('reports', 'PROPERTY:total'),
        tdAttrs: 'class="is-number"'
      });

      columns.push({
        id: '',
        label: '&nbsp;',
        noData: ''
      });

      return columns;
    },

    serializeActions: function()
    {
      return null;
    },

    serializeRows: function()
    {
      return this.collection.invoke('serialize').sort(function(a, b)
      {
        return a.partner.localeCompare(b.partner);
      });
    }

  });
});
