// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
