// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
      var summaryPartners = {};
      var summary = {
        date: null,
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

      for (var i = 0, l = res.length; i < l; ++i)
      {
        var data = res[i];
        var goods = data.goods;

        if (!goods)
        {
          continue;
        }

        var daily = data.daily || {
          grnByPartner: {},
          gdnByPartner: {}
        };
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

        var palletKindIds = Object.keys(goods.total);
        var ii;
        var ll;

        for (ii = 0, ll = palletKindIds.length; ii < ll; ++ii)
        {
          var palletKindId = palletKindIds[ii];
          var balanceCount = goods.total[palletKindId];

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

        var grnPartnerIds = daily.grnByPartner === undefined ? [] : Object.keys(daily.grnByPartner);
        var iii;
        var lll;

        for (ii = 0, ll = grnPartnerIds.length; ii < ll; ++ii)
        {
          var grnPartnerId = grnPartnerIds[ii];
          var grnByPartner = daily.grnByPartner[grnPartnerId];
          var grnPalletKindIds = Object.keys(grnByPartner);

          if (summaryPartners[grnPartnerId] === undefined)
          {
            summaryPartners[grnPartnerId] = {
              id: grnPartnerId,
              grn: {total: 0},
              gdn: {total: 0}
            };

            summary.partners.push(summaryPartners[grnPartnerId]);
          }

          var grnSummaryPartner = summaryPartners[grnPartnerId];

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

            if (summary.totals.grn[grnPalletKindId] === undefined)
            {
              summary.totals.grn[grnPalletKindId] = grnCount;
            }
            else
            {
              summary.totals.grn[grnPalletKindId] += grnCount;
            }

            summary.totals.grn.total += grnCount;

            if (grnSummaryPartner.grn[grnPalletKindId] === undefined)
            {
              grnSummaryPartner.grn[grnPalletKindId] = grnCount;
            }
            else
            {
              grnSummaryPartner.grn[grnPalletKindId] += grnCount;
            }

            grnSummaryPartner.grn.total += grnCount;

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

        var gdnPartnerIds = daily.gdnByPartner === undefined ? [] : Object.keys(daily.gdnByPartner);

        for (ii = 0, ll = gdnPartnerIds.length; ii < ll; ++ii)
        {
          var gdnPartnerId = gdnPartnerIds[ii];
          var gdnByPartner = daily.gdnByPartner[gdnPartnerId];
          var gdnPalletKindIds = Object.keys(gdnByPartner);

          if (summaryPartners[gdnPartnerId] === undefined)
          {
            summaryPartners[gdnPartnerId] = {
              id: gdnPartnerId,
              grn: {total: 0},
              gdn: {total: 0}
            };

            summary.partners.push(summaryPartners[gdnPartnerId]);
          }

          var gdnSummaryPartner = summaryPartners[gdnPartnerId];

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

            if (summary.totals.gdn[gdnPalletKindId] === undefined)
            {
              summary.totals.gdn[gdnPalletKindId] = gdnCount;
            }
            else
            {
              summary.totals.gdn[gdnPalletKindId] += gdnCount;
            }

            summary.totals.gdn.total += gdnCount;

            if (gdnSummaryPartner.gdn[gdnPalletKindId] === undefined)
            {
              gdnSummaryPartner.gdn[gdnPalletKindId] = gdnCount;
            }
            else
            {
              gdnSummaryPartner.gdn[gdnPalletKindId] += gdnCount;
            }

            gdnSummaryPartner.gdn.total += gdnCount;

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

      if (results.length > 0)
      {
        summary.balance = results[results.length - 1].balance;
      }

      results.push(summary);

      return results;
    }

  });
});
