// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  'app/core/views/ListView',
  './decorateUser'
], function(
  t,
  ListView,
  decorateUser
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
    ],

    serializeRows: function()
    {
      return this.collection.map(decorateUser);
    }

  });
});
