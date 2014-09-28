// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
