// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'partners.synced': 'render'
    },

    columns: [
      {id: 'login', className: 'is-min'},
      {id: 'lastName', className: 'is-min'},
      {id: 'firstName', className: 'is-min'},
      {id: 'email', className: 'is-min'},
      'partner'
    ]

  });
});
