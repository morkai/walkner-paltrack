// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/partners',

    clientUrlRoot: '#partners',

    topicPrefix: 'partners',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'partners',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        name: '',
        address: null,
        clientNo: null,
        supplierColor: null,
        receiverColor: null,
        autoGdn: false,
        autoGdnPartners: [],
        autoGrn1: false,
        autoGrn1Partners: [],
        autoGrn2: false,
        autoGrn2Partner: null,
        autoGrn2Partners: []
      };
    }

  });
});
