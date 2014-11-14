// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/ListView',
  'app/core/templates/listPage'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [t.bound(this.collection.getNlsDomain(), 'BREADCRUMBS:browse')];
    },

    actions: function()
    {
      return [pageActions.add(this.collection)];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(this.collection, this);
    },

    defineViews: function()
    {
      this.listView = this.createListView();

      this.filterView = this.createFilterView();

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);
    },

    createListView: function()
    {
      return new (this.ListView || this.options.ListView || ListView)({
        collection: this.collection
      });
    },

    createFilterView: function()
    {
      return new (this.FilterView || this.options.FilterView)({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    onFilterChanged: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.refreshCollection();
    },

    refreshCollection: function()
    {
      this.listView.refreshCollectionNow();
      this.updateClientUrl();
    },

    updateClientUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + this.collection.rqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
