// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'jquery',
  'app/data/palletKinds',
  'app/data/partners',
  'app/core/views/ListView',
  'app/core/util/idAndLabel',
  'app/reports/templates/_palletKindColumns',
  'app/reports/templates/partnerBalanceList'
], function(
  $,
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

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);
    },

    destroy: function()
    {
      ListView.prototype.destroy.call(this);
    },

    serialize: function()
    {
      var palletKindsList = palletKinds.sort().map(idAndLabel);
      var partnersMap = {};

      partners.forEach(function(partner)
      {
        partnersMap[partner.id] = partner.getLabel();
      });

      var rows = this.collection.toJSON();
      var summary = rows.pop();

      return {
        idPrefix: this.idPrefix,
        palletKindColumns: renderPalletKindColumns({palletKinds: palletKindsList}),
        palletKinds: palletKindsList,
        partnersMap: partnersMap,
        rows: rows,
        summary: summary
      };
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      this.toggleRows(this.options.rows);
    },

    toggleRows: function(rows)
    {
      this.options.rows = rows;

      this.$id('summary').toggle(!rows.length || rows.indexOf('summary') !== -1);

      var partner = rows.indexOf('partner') !== -1;
      var total = rows.indexOf('total') !== -1;
      var balance = rows.indexOf('balance') !== -1;

      var $dailis = this.$('.partnerBalanceList-daily');

      if (!partner && !total && !balance)
      {
        return $dailis.hide();
      }

      $dailis.each(function()
      {
        var $daily = $(this).show();

        $daily.find('.partnerBalanceList-partner').toggle(partner);
        $daily.find('.partnerBalanceList-total').toggle(total);
        $daily.find('.partnerBalanceList-balance').toggle(balance);

        if ($daily.find('> tr:visible').length === 1)
        {
          $daily.hide();
        }
      });
    }

  });
});
