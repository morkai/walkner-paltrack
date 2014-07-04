// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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

    beforeFilterChanged: function(rqlQuery)
    {
      localStorage.GDN_LIMIT = rqlQuery.limit;
    }

  });
});
