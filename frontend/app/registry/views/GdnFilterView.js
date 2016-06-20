// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/idAndLabel',
  'app/data/partners',
  './GrnFilterView'
], function(
  idAndLabel,
  partners,
  GrnFilterView
) {
  'use strict';

  return GrnFilterView.extend({

    firstPartnerProperty: 'supplier',
    secondPartnerProperty: 'receiver',

    getSuppliers: function()
    {
      return partners.map(idAndLabel);
    },

    getReceivers: function()
    {
      return partners.withoutUsersPartner().map(idAndLabel);
    },

    onFilterChanged: function(rqlQuery)
    {
      localStorage.GDN_LIMIT = rqlQuery.limit;
    }

  });
});
