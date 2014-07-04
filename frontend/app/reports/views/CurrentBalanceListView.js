// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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

    className: 'currentBalanceList',

    localTopics: {
      'partners.synced': 'render',
      'palletKinds.synced': 'render'
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['balance.current.' + (user.data.partner || '*')] = 'refreshCollection';

      return topics;
    },

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
          tdAttrs: 'class="number"'
        });
      });

      columns.push({
        id: 'total',
        label: t('reports', 'PROPERTY:total'),
        tdAttrs: 'class="number"'
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
