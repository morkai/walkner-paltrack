// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../core/Collection',
  './PartnerBalance'
], function(
  Collection,
  PartnerBalance
) {
  'use strict';

  return Collection.extend({

    model: PartnerBalance,

    parse: function(res)
    {
      var results = [];

      for (var i = 0, l = res.length; i < l; ++i)
      {
        var data = res[i];

        if (!data.goods)
        {
          continue;
        }

        var partners = {};
        var result = {
          date: data.date,
          partners: [],
          totals: {
            balance: 0,
            grn: {
              total: 0
            },
            gdn: {
              total: 0
            }
          },
          balance: {
            total: 0
          }
        };

        var palletKindIds = Object.keys(data.goods.total);
        var ii;
        var ll;

        for (ii = 0, ll = palletKindIds.length; ii < ll; ++ii)
        {
          var palletKindId = palletKindIds[ii];
          var balanceCount = data.goods.total[palletKindId];

          if (result.balance[palletKindId] === undefined)
          {
            result.balance[palletKindId] = balanceCount;
          }
          else
          {
            result.balance[palletKindId] += balanceCount;
          }

          result.balance.total += balanceCount;
        }

        var grnPartnerIds = data.goods.grnByPartner === undefined ? [] : Object.keys(data.goods.grnByPartner);
        var iii;
        var lll;

        for (ii = 0, ll = grnPartnerIds.length; ii < ll; ++ii)
        {
          var grnPartnerId = grnPartnerIds[ii];
          var grnByPartner = data.goods.grnByPartner[grnPartnerId];
          var grnPalletKindIds = Object.keys(grnByPartner);

          if (partners[grnPartnerId] === undefined)
          {
            partners[grnPartnerId] = {
              id: grnPartnerId,
              grn: {total: 0},
              gdn: {total: 0}
            };

            result.partners.push(partners[grnPartnerId]);
          }

          var grnPartner = partners[grnPartnerId];

          for (iii = 0, lll = grnPalletKindIds.length; iii < lll; ++iii)
          {
            var grnPalletKindId = grnPalletKindIds[iii];
            var grnCount = grnByPartner[grnPalletKindId];

            if (result.totals.grn[grnPalletKindId] === undefined)
            {
              result.totals.grn[grnPalletKindId] = grnCount;
            }
            else
            {
              result.totals.grn[grnPalletKindId] += grnCount;
            }

            result.totals.grn.total += grnCount;

            if (grnPartner.grn[grnPalletKindId] === undefined)
            {
              grnPartner.grn[grnPalletKindId] = grnCount;
            }
            else
            {
              grnPartner.grn[grnPalletKindId] += grnCount;
            }

            grnPartner.grn.total += grnCount;
          }
        }

        var gdnPartnerIds = data.goods.gdnByPartner === undefined ? [] : Object.keys(data.goods.gdnByPartner);

        for (ii = 0, ll = gdnPartnerIds.length; ii < ll; ++ii)
        {
          var gdnPartnerId = gdnPartnerIds[ii];
          var gdnByPartner = data.goods.gdnByPartner[gdnPartnerId];
          var gdnPalletKindIds = Object.keys(gdnByPartner);

          if (partners[gdnPartnerId] === undefined)
          {
            partners[gdnPartnerId] = {
              id: gdnPartnerId,
              grn: {total: 0},
              gdn: {total: 0}
            };

            result.partners.push(partners[gdnPartnerId]);
          }

          var gdnPartner = partners[gdnPartnerId];

          for (iii = 0, lll = gdnPalletKindIds.length; iii < lll; ++iii)
          {
            var gdnPalletKindId = gdnPalletKindIds[iii];
            var gdnCount = gdnByPartner[gdnPalletKindId];

            if (result.totals.gdn[gdnPalletKindId] === undefined)
            {
              result.totals.gdn[gdnPalletKindId] = gdnCount;
            }
            else
            {
              result.totals.gdn[gdnPalletKindId] += gdnCount;
            }

            result.totals.gdn.total += gdnCount;

            if (gdnPartner.gdn[gdnPalletKindId] === undefined)
            {
              gdnPartner.gdn[gdnPalletKindId] = gdnCount;
            }
            else
            {
              gdnPartner.gdn[gdnPalletKindId] += gdnCount;
            }

            gdnPartner.gdn.total += gdnCount;
          }
        }

        result.totals.balance = result.totals.grn.total - result.totals.gdn.total;

        results.push(result);
      }

      return results;
    }

  });
});
