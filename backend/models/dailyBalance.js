// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var lodash = require('lodash');

module.exports = function setupDailyBalanceModel(app, mongoose)
{
  var dailyBalanceSchema = mongoose.Schema({
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    goods: {}
  }, {
    id: false
  });

  dailyBalanceSchema.index({date: -1});
  dailyBalanceSchema.index({partner: 1, date: -1});

  dailyBalanceSchema.methods.reset = function()
  {
    this.goods = {
      total: {},
      gnTotal: {},
      gnByPartner: {},
      grnTotal: {},
      grnByPartner: {},
      gdnTotal: {},
      gdnByPartner: {}
    };
  };

  dailyBalanceSchema.methods.applyOb = function(ob)
  {
    this.reset();

    this.goods.total = ob && ob.goods ? lodash.cloneDeep(ob.goods) : {};
  };

  dailyBalanceSchema.methods.applyPrevDailyBalance = function(prevDailyBalance)
  {
    if (prevDailyBalance && prevDailyBalance.goods)
    {
      this.goods = lodash.cloneDeep(prevDailyBalance.goods);
    }
    else
    {
      this.reset();
    }
  };

  dailyBalanceSchema.methods.inc = function(partnerId, goods)
  {
    this.incDec(1, partnerId, goods);
  };

  dailyBalanceSchema.methods.dec = function(partnerId, goods)
  {
    this.incDec(-1, partnerId, goods);
  };

  dailyBalanceSchema.methods.incDec = function(incDec, partnerId, goods)
  {
    if (typeof partnerId !== 'string')
    {
      partnerId = partnerId.toString();
    }

    if (this.goods === null)
    {
      this.reset();
    }

    var grn = incDec === 1;
    var balanceGoods = this.goods;

    Object.keys(goods).forEach(function(palletKindId)
    {
      var value = goods[palletKindId];

      if (value < 1)
      {
        return;
      }

      var count = value * incDec;

      incPropertyValue(balanceGoods.total, palletKindId, count);
      incPropertyValue(balanceGoods.gnTotal, palletKindId, count);
      incPropertyPropertyValue(balanceGoods.gnByPartner, partnerId, palletKindId, count);

      if (grn)
      {
        incPropertyValue(balanceGoods.grnTotal, palletKindId, value);
        incPropertyPropertyValue(balanceGoods.grnByPartner, partnerId, palletKindId, value);
      }
      else
      {
        incPropertyValue(balanceGoods.gdnTotal, palletKindId, value);
        incPropertyPropertyValue(balanceGoods.gdnByPartner, partnerId, palletKindId, value);
      }
    });

    this.markModified('goods');
  };

  mongoose.model('DailyBalance', dailyBalanceSchema);
};

function incPropertyValue(obj, propertyName, value)
{
  if (!obj[propertyName])
  {
    obj[propertyName] = value;
  }
  else
  {
    obj[propertyName] += value;
  }
}

function incPropertyPropertyValue(obj, propertyName1, propertyName2, value)
{
  if (!obj[propertyName1])
  {
    obj[propertyName1] = {};
  }

  if (!obj[propertyName1][propertyName2])
  {
    obj[propertyName1][propertyName2] = 0;
  }

  obj[propertyName1][propertyName2] += value;
}
