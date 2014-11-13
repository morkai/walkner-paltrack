// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
      t.bound('reports', 'BREADCRUMBS:partnerBalance')
    ]

  });
});
