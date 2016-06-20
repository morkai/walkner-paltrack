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

    className: 'registryList ob is-clickable',

    localTopics: {
      'partners.synced': 'render',
      'palletKinds.synced': 'render'
    },

    serializeColumns: function()
    {
      var columns = [
        'partner',
        {
          id: 'date',
          tdAttrs: 'class="is-min"'
        }
      ];

      if (user.data.partner)
      {
        columns.shift();
      }

      palletKinds.sort().forEach(function(palletKind)
      {
        columns.push({
          id: 'goods.' + palletKind.id,
          label: palletKind.getLabel(),
          tdAttrs: 'class="number is-min"',
          noData: 0
        });
      });

      columns.unshift({
        id: 'no',
        label: t('core', '#'),
        tdAttrs: 'class="no is-min"'
      });

      return columns;
    },

    serializeRows: function()
    {
      var skip = this.collection.rqlQuery.skip;

      return this.collection.invoke('serialize').map(function(obj, i)
      {
        obj.no = (skip + i + 1) + '.';

        return obj;
      });
    }

  });
});
