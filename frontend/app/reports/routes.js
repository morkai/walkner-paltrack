// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../router',
  '../viewport',
  '../user',
  './pages/CurrentBalanceListPage',
  'i18n!app/nls/reports'
], function(
  router,
  viewport,
  user,
  CurrentBalanceListPage
) {
  'use strict';

  var canView = user.auth('REGISTRY:VIEW');

  router.map('/reports/current-balance', canView, function(req)
  {
    viewport.showPage(new CurrentBalanceListPage({rql: req.rql}));
  });
});
