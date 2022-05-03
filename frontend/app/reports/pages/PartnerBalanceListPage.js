// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/PartnerBalanceFilterView',
  '../views/PartnerBalanceListView'
], function(
  _,
  time,
  user,
  t,
  FilteredListPage,
  PartnerBalanceFilterView,
  PartnerBalanceListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: PartnerBalanceFilterView,

    ListView: PartnerBalanceListView,

    actions: null,

    breadcrumbs: [
      t.bound('reports', 'BREADCRUMB:partnerBalance')
    ],

    defineViews: function()
    {
      FilteredListPage.prototype.defineViews.call(this);

      this.listenTo(this.filterView, 'rowsChanged', this.onRowsChanged);
    },

    createListView: function()
    {
      var rowsTerm = this.findRowsTerm();

      return new PartnerBalanceListView({
        collection: this.collection,
        rows: rowsTerm ? rowsTerm.args[1] : ['partner', 'total', 'balance', 'summary']
      });
    },

    onRowsChanged: function(rows)
    {
      var rowsTerm = this.findRowsTerm();

      if (!rowsTerm)
      {
        rowsTerm = {
          name: 'in',
          args: ['rows', null]
        };

        this.collection.rqlQuery.selector.args.push(rowsTerm);
      }

      rowsTerm.args[1] = rows;

      this.updateClientUrl();
      this.listView.toggleRows(rows);
    },

    findRowsTerm: function()
    {
      return _.find(this.collection.rqlQuery.selector.args, function(term)
      {
        return term.name === 'in' && term.args[0] === 'rows';
      });
    }

  });
});
