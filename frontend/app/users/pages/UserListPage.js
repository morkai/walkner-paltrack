// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  '../views/UserListView',
  '../views/UserFilterView'
], function(
  FilteredListPage,
  UserListView,
  UserFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: UserFilterView,

    ListView: UserListView

  });
});
