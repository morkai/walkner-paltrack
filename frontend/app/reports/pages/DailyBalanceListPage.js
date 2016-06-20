// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/DailyBalanceFilterView',
  '../views/DailyBalanceListView'
], function(
  _,
  time,
  user,
  t,
  FilteredListPage,
  DailyBalanceFilterView,
  DailyBalanceListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: DailyBalanceFilterView,

    ListView: DailyBalanceListView,

    actions: null,

    breadcrumbs: [
      t.bound('reports', 'BREADCRUMBS:dailyBalance')
    ],

    initialize: function()
    {
      FilteredListPage.prototype.initialize.call(this);

      this.sub = null;

      this.subscribe();

      this.listenTo(this.filterView, 'filterChanged', this.subscribe.bind(this));
    },

    destroy: function()
    {
      this.sub = null;

      FilteredListPage.prototype.destroy.call(this);
    },

    subscribe: function()
    {
      if (this.sub)
      {
        this.sub.cancel();
        this.sub = null;
      }

      var topic = 'balance.daily.' + this.getSelectedDate() + '.' + (user.data.partner || '*');

      this.sub = this.pubsub.subscribe(topic, this.listView.refreshCollection.bind(this.listView));
    },

    getSelectedDate: function()
    {
      var dateTerm = _.find(this.collection.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date';
      });

      return dateTerm ? dateTerm.args[1] : time.format(Date.now(), 'YYYY-MM-DD');
    }

  });
});
