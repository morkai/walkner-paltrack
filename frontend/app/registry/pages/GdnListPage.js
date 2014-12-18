// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  '../GdnCollection',
  '../views/GdnFilterView',
  '../views/GdnListView',
  './GrnListPage'
], function(
  t,
  GdnCollection,
  GdnFilterView,
  GdnListView,
  GrnListPage
) {
  'use strict';

  return GrnListPage.extend({

    Collection: GdnCollection,
    FilterView: GdnFilterView,
    ListView: GdnListView,

    breadcrumbs: [
      t.bound('registry', 'BREADCRUMBS:gdn:browse')
    ]

  });
});
