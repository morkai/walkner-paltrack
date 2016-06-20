// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

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
    goods: {},
    daily: {}
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
    this.resetDaily();
  };

  dailyBalanceSchema.methods.resetDaily = function()
  {
    this.daily = {
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

    this.goods.total = ob && ob.goods ? _.cloneDeep(ob.goods) : {};
  };

  dailyBalanceSchema.methods.applyPrevDailyBalance = function(prevDailyBalance)
  {
    if (prevDailyBalance && prevDailyBalance.goods)
    {
      this.goods = _.cloneDeep(prevDailyBalance.goods);
      this.resetDaily();
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

    if (!this.goods)
    {
      this.reset();
    }

    if (!this.daily)
    {
      this.resetDaily();
    }

    var grn = incDec === 1;
    var balanceGoods = this.goods;
    var dailyGoods = this.daily;

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

      incPropertyValue(dailyGoods.gnTotal, palletKindId, count);
      incPropertyPropertyValue(dailyGoods.gnByPartner, partnerId, palletKindId, count);

      if (grn)
      {
        incPropertyValue(balanceGoods.grnTotal, palletKindId, value);
        incPropertyPropertyValue(balanceGoods.grnByPartner, partnerId, palletKindId, value);

        incPropertyValue(dailyGoods.grnTotal, palletKindId, value);
        incPropertyPropertyValue(dailyGoods.grnByPartner, partnerId, palletKindId, value);
      }
      else
      {
        incPropertyValue(balanceGoods.gdnTotal, palletKindId, value);
        incPropertyPropertyValue(balanceGoods.gdnByPartner, partnerId, palletKindId, value);

        incPropertyValue(dailyGoods.gdnTotal, palletKindId, value);
        incPropertyPropertyValue(dailyGoods.gdnByPartner, partnerId, palletKindId, value);
      }
    });

    this.markModified('goods');
    this.markModified('daily');
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
