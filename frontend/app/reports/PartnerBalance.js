// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/partner-balance',

    clientUrlRoot: '#reports/partner-balance',

    privilegePrefix: 'REPORTS',

    nlsDomain: 'reports'

  });
});
