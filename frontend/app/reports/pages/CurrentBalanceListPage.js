// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../CurrentBalanceCollection',
  '../views/CurrentBalanceListView'
], function(
  t,
  bindLoadingMessage,
  View,
  CurrentBalanceCollection,
  CurrentBalanceListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: [
      t.bound('reports', 'BREADCRUMBS:currentBalance')
    ],

    initialize: function()
    {
      this.collection = bindLoadingMessage(
        new CurrentBalanceCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.view = new CurrentBalanceListView({collection: this.collection});
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
