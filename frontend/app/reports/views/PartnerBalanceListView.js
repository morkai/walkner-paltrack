// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/data/palletKinds',
  'app/data/partners',
  'app/core/views/ListView',
  'app/core/util/idAndLabel',
  'app/reports/templates/_palletKindColumns',
  'app/reports/templates/partnerBalanceList'
], function(
  palletKinds,
  partners,
  ListView,
  idAndLabel,
  renderPalletKindColumns,
  template
) {
  'use strict';

  return ListView.extend({

    template: template,

    className: 'partnerBalanceList',

    localTopics: null,
    remoteTopics: null,

    serialize: function()
    {
      var palletKindsList = palletKinds.sort().map(idAndLabel);
      var partnersMap = {};

      partners.forEach(function(partner)
      {
        partnersMap[partner.id] = partner.getLabel();
      });

      return {
        palletKindColumns: renderPalletKindColumns({palletKinds: palletKindsList}),
        palletKinds: palletKindsList,
        partnersMap: partnersMap,
        rows: this.collection.toJSON()
      };
    }

  });
});
