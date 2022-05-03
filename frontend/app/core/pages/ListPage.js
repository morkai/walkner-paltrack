// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/ListView',
  './createPageBreadcrumbs'
], function(
  _,
  t,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'list',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this);
    },

    actions: function()
    {
      return [
        pageActions.add(this.getDefaultModel())
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this[this.collection ? 'collection' : 'model'] = bindLoadingMessage(this.getDefaultModel(), this);
    },

    defineViews: function()
    {
      this.view = this.createListView();
    },

    createListView: function()
    {
      return new (this.getViewClass())(this.getViewOptions());
    },

    getViewClass: function()
    {
      return this.ListView || this.options.ListView || ListView;
    },

    getViewOptions: function()
    {
      var ListViewClass = this.getViewClass();

      return {
        collection: this.collection,
        model: this.collection ? undefined : this.getDefaultModel(),
        columns: this.options.columns
          || this.columns
          || ListViewClass.prototype.columns,
        serializeRow: this.options.serializeRow
          || this.serializeRow
          || ListViewClass.prototype.serializeRow,
        serializeActions: this.options.serializeActions
          || this.serializeActions
          || ListViewClass.prototype.serializeActions,
        className: _.find([
          this.options.listClassName,
          this.listClassName,
          ListViewClass.prototype.className,
          'is-clickable'
        ], function(className) { return className !== undefined; })
      };
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
