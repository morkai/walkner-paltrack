// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/dashboard/templates/dashboard'
], function(
  View,
  dashboardTemplate
) {
  'use strict';

  return View.extend({

    template: dashboardTemplate

  });
});
