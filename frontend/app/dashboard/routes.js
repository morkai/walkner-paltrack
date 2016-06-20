// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  './pages/DashboardPage',
  'i18n!app/nls/dashboard'
], function(
  router,
  viewport,
  DashboardPage
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new DashboardPage());
  });
});
