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

    localTopics: {
      'partners.synced': 'render'
    },

    columns: ['lastName', 'firstName', 'partner', 'login', 'email'],

    serializeRows: function()
    {
      return this.collection.map(decorateUser);
    }

  });
});
