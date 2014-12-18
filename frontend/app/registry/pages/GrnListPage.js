// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../GrnCollection',
  '../views/GrnFilterView',
  '../views/GrnListView',
  'app/core/templates/listPage'
], function(
  _,
  t,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  GrnCollection,
  GrnFilterView,
  GrnListView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    Collection: GrnCollection,
    FilterView: GrnFilterView,
    ListView: GrnListView,

    template: listPageTemplate,

    layoutName: 'page',

    breadcrumbs: [
      t.bound('registry', 'BREADCRUMBS:grn:browse')
    ],

    actions: function()
    {
      return [
        {
          label: t.bound('registry', 'PAGE_ACTION:printList'),
          icon: 'print',
          callback: this.printList.bind(this)
        },
        pageActions.add(this.collection)
      ];
    },

    initialize: function()
    {
      this.$printListMsg = null;

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    destroy: function()
    {
      this.$printListMsg = null;
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new this.Collection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new this.FilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });

      this.listView = new this.ListView({collection: this.collection});
    },

    defineBindings: function()
    {
      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    },

    printList: function(e)
    {
      var paginationData = this.collection.paginationData;
      var rqlQuery = this.collection.rqlQuery;

      if (this.$printListMsg !== null)
      {
        viewport.msg.hide(this.$printListMsg);
        this.$printListMsg = null;
      }

      if (paginationData.get('totalCount') === 0)
      {
        this.$printListMsg = viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('registry', 'printList:msg:empty')
        });

        return;
      }

      var hasPartnerTerm = _.any(rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && (term.args[0] === 'supplier' || term.args[0] === 'receiver');
      });

      if (!user.data.partner && !hasPartnerTerm)
      {
        this.filterView.focusFirstPartner();

        this.$printListMsg = viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('registry', 'printList:msg:partner')
        });

        return;
      }

      var hasFromTerm = _.any(rqlQuery.selector.args, function(term)
      {
        return term.name === 'ge' && term.args[0] === 'date';
      });
      var hasToTerm = _.any(rqlQuery.selector.args, function(term)
      {
        return term.name === 'lt' && term.args[0] === 'date';
      });

      if (!hasFromTerm || !hasToTerm)
      {
        this.filterView.focusEmptyDate();

        this.$printListMsg = viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('registry', 'printList:msg:date')
        });

        return;
      }

      var href = this.collection.url + ';print?' + rqlQuery;

      if (e.which === 2 || (e.which === 1 && e.ctrlKey))
      {
        window.open(href);
      }
      else if (e.which === 1)
      {
        window.location.href = href;
      }
    }

  });
});
