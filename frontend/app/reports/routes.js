// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './DailyBalanceCollection',
  './PartnerBalanceCollection',
  './pages/DailyBalanceListPage',
  './pages/PartnerBalanceListPage',
  'i18n!app/nls/reports'
], function(
  router,
  viewport,
  user,
  DailyBalanceCollection,
  PartnerBalanceCollection,
  DailyBalanceListPage,
  PartnerBalanceListPage
) {
  'use strict';

  var canView = user.auth('REGISTRY:VIEW');

  router.map('/reports/daily-balance', canView, function(req)
  {
    viewport.showPage(new DailyBalanceListPage({
      collection: new DailyBalanceCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/reports/partner-balance', canView, function(req)
  {
    viewport.showPage(new PartnerBalanceListPage({
      collection: new PartnerBalanceCollection(null, {rqlQuery: req.rql})
    }));
  });
});
