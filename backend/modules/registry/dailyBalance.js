// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');

module.exports = function setUpDailyBalance(app, registryModule)
{
  var partnersModule = app[registryModule.config.partnersId];
  var mongoose = app[registryModule.config.mongooseId];
  var DailyBalance = mongoose.model('DailyBalance');
  var Ob = mongoose.model('Ob');
  var Grn = mongoose.model('Grn');
  var Gdn = mongoose.model('Gdn');

  var cachedDailyBalances = {};
  var lastDay = moment().date();

  registryModule.recountDailyBalance = recountDailyBalance;
  registryModule.recountDailyBalanceBetweenDates = recountDailyBalanceBetweenDates;
  registryModule.recountPartnersDailyBalance = recountPartnersDailyBalance;

  app.broker
    .subscribe('app.started')
    .setLimit(1)
    .on('message', function()
    {
      DailyBalance
        .findOne({}, {date: 1})
        .sort({date: -1})
        .lean()
        .exec(function(err, lastDailyBalance)
        {
          if (err)
          {
            return registryModule.error("Failed to find the last daily balance: %s", err.message);
          }

          recountPartnersDailyBalance(
            null, lastDailyBalance ? lastDailyBalance.date : null, function() {}
          );
        });

      setTimeout(checkDayChange, 60000);
    });

  app.broker.subscribe('registry.grn.added', onGrnAdded);
  app.broker.subscribe('registry.grn.edited', onGrnEdited);
  app.broker.subscribe('registry.grn.deleted', onGrnDeleted);
  app.broker.subscribe('registry.gdn.added', onGdnAdded);
  app.broker.subscribe('registry.gdn.edited', onGdnEdited);
  app.broker.subscribe('registry.gdn.deleted', onGdnDeleted);
  app.broker.subscribe('registry.ob.added', onObAdded);
  app.broker.subscribe('registry.ob.edited', onObEdited);
  app.broker.subscribe('registry.ob.deleted', onObDeleted);

  function checkDayChange()
  {
    var currentDay = moment().date();

    if (currentDay === lastDay)
    {
      return setTimeout(checkDayChange, 60000);
    }

    registryModule.info("Detected a new day: creating daily balances...");

    lastDay = currentDay;

    recountPartnersDailyBalance(
      null, moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate(), function()
      {
        setTimeout(checkDayChange, 60000);
      }
    );
  }

  function getDailyBalance(partnerId, date, done)
  {
    var cachedDailyBalance = getCachedDailyBalance(partnerId, date);

    if (cachedDailyBalance)
    {
      return done(null, cachedDailyBalance);
    }

    DailyBalance.findOne({partner: partnerId, date: date}, function(err, dailyBalance)
    {
      if (err)
      {
        return done(err);
      }

      if (dailyBalance)
      {
        done(null, dailyBalance);
      }
      else
      {
        createDailyBalance(partnerId, date, done);
      }
    });
  }

  function createDailyBalance(partnerId, date, done)
  {
    var newDailyBalance = new DailyBalance({
      partner: partnerId,
      date: date,
      goods: null
    });

    newDailyBalance.save(function(err)
    {
      done(err, err ? null : cacheDailyBalance(newDailyBalance));
    });
  }

  function getPrevDailyBalance(partnerId, date, done)
  {
    var prevDay = moment(date.getTime()).subtract('days', 1).toDate();
    var cachedPrevDailyBalance = getCachedDailyBalance(partnerId, prevDay);

    if (cachedPrevDailyBalance)
    {
      return done(null, cachedPrevDailyBalance);
    }

    DailyBalance
      .findOne({partner: partnerId, date: {$lte: prevDay}})
      .sort({partner: 1, date: -1})
      .exec(function(err, prevDailyBalance)
      {
        done(err, cacheDailyBalance(prevDailyBalance));
      });
  }

  function getCachedDailyBalance(partnerId, date)
  {
    var cachedPartnerDailyBalances = cachedDailyBalances[partnerId];

    if (!cachedPartnerDailyBalances)
    {
      return null;
    }

    var dailyBalance = cachedPartnerDailyBalances[date.getTime()];

    if (!dailyBalance)
    {
      return null;
    }

    return dailyBalance;
  }

  function cacheDailyBalance(dailyBalance)
  {
    if (!dailyBalance)
    {
      return;
    }

    var partnerId = dailyBalance.partner.toString();

    if (!cachedDailyBalances[partnerId])
    {
      cachedDailyBalances[partnerId] = {};
    }
    else
    {
      var keys = Object.keys(cachedDailyBalances[partnerId]);

      if (keys.length > 30)
      {
        var reduced = {};

        _.takeRight(keys.map(Number).sort(), 7).forEach(function(key)
        {
          reduced[key] = cachedDailyBalances[partnerId][key];
        });

        cachedDailyBalances[partnerId] = reduced;
      }
    }

    cachedDailyBalances[partnerId][dailyBalance.date.getTime()] = dailyBalance;

    return dailyBalance;
  }

  function recountDailyBalance(partnerId, date, done)
  {
    var dateString = moment(date).format('YYYY-MM-DD');

    step(
      function()
      {
        getDailyBalance(partnerId, date, this.parallel());
        getPrevDailyBalance(partnerId, date, this.parallel());
        Ob.findOne({partner: partnerId, date: date}, {goods: 1}).lean().exec(this.parallel());
      },
      function(err, dailyBalance, prevDailyBalance, ob)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (ob)
        {
          dailyBalance.applyOb(ob);
        }
        else if (prevDailyBalance)
        {
          dailyBalance.applyPrevDailyBalance(prevDailyBalance);
        }

        var grnStream = Grn
          .find({receiver: dailyBalance.partner, date: dailyBalance.date})
          .select({supplier: 1, goods: 1})
          .lean()
          .stream();

        var gdnStream = Gdn
          .find({supplier: dailyBalance.partner, date: dailyBalance.date})
          .select({receiver: 1, goods: 1})
          .lean()
          .stream();

        handleGoodsNoteStream('supplier', 'inc', dailyBalance, grnStream, this.parallel());
        handleGoodsNoteStream('receiver', 'dec', dailyBalance, gdnStream, this.parallel());

        this.dailyBalance = dailyBalance;
      },
      function(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.dailyBalance.save(this.next());
        this.dailyBalance = null;
      },
      function(err, dailyBalance)
      {
        if (err)
        {
          registryModule.debug(
            "Recounting the balance for partner [%s] and date [%s] failed: %s",
            partnerId,
            dateString,
            err.message
          );
        }
        else
        {
          registryModule.debug(
            "Recounted the balance for partner [%s] and date [%s]: %s", partnerId, dateString, dailyBalance._id
          );

          app.broker.publish('balance.daily.' + dateString + '.' + partnerId, {
            partner: partnerId,
            date: date
          });

          if (dateString === moment().format('YYYY-MM-DD'))
          {
            app.broker.publish('balance.current.' + partnerId, {
              partner: partnerId,
              date: date
            });
          }
        }

        return done && done(err);
      }
    );
  }

  function handleGoodsNoteStream(partnerProperty, changeMethod, dailyBalance, stream, done)
  {
    stream.on('error', done);

    stream.on('close', done);

    stream.on('data', function(goodsNote)
    {
      dailyBalance[changeMethod](goodsNote[partnerProperty], goodsNote.goods);
    });
  }

  function recountDailyBalanceFromDate(partnerId, fromDate, done)
  {
    Ob
      .findOne({partner: partnerId, date: {$gt: fromDate}})
      .select({date: 1})
      .sort({partner: 1, date: 1})
      .lean()
      .exec(function(err, ob)
      {
        if (err)
        {
          return done && done(err);
        }

        var toDate = ob
          ? moment(ob.date).subtract('days', 1).toDate()
          : moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();

        recountDailyBalanceBetweenDates(partnerId, fromDate, toDate, done);
      });
  }

  function recountDailyBalanceBetweenDates(partnerId, fromDate, toDate, done)
  {
    var steps = [];
    var toTime = toDate.getTime();
    var fromMoment = moment(fromDate);

    do
    {
      steps.push(createRecountDailyBalanceStep(partnerId, fromMoment.valueOf()));

      fromMoment.add('days', 1);
    }
    while (fromMoment.valueOf() <= toTime);

    steps.push(done);

    step(steps);
  }

  function createRecountDailyBalanceStep(partnerId, fromTime)
  {
    return function recountDailyBalanceStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      return recountDailyBalance(partnerId, new Date(fromTime), this.next());
    };
  }

  function recountPartnersDailyBalance(userPartnerId, userMinDate, done)
  {
    step(
      function()
      {
        if (!userMinDate)
        {
          var pipeline = [{$group: {_id: null, date: {$min: '$date'}}}];

          mongoose.model('Grn').aggregate(pipeline, this.parallel());
          mongoose.model('Gdn').aggregate(pipeline, this.parallel());
          mongoose.model('Ob').aggregate(pipeline, this.parallel());
        }
      },
      function(err, grn, gdn, ob)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var maxDate = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
        var minDate = maxDate;

        if (userMinDate)
        {
          minDate = userMinDate;
        }
        else
        {
          if (grn && grn.length && grn[0].date < minDate)
          {
            minDate = grn[0].date;
          }

          if (gdn && gdn.length && gdn[0].date < minDate)
          {
            minDate = gdn[0].date;
          }

          if (ob && ob.length && ob[0].date < minDate)
          {
            minDate = ob[0].date;
          }
        }

        this.next()(minDate, maxDate);
      },
      function(minDate, maxDate)
      {
        var steps = [];

        if (userPartnerId)
        {
          steps.push(_.partial(recountPartnerStep, userPartnerId));
        }
        else
        {
          for (var i = 0, l = partnersModule.models.length; i < l; ++i)
          {
            steps.push(_.partial(recountPartnerStep, partnersModule.models[i]._id.toString()));
          }
        }

        steps.push(this.next());

        step(steps);

        function recountPartnerStep(partnerId)
        {
          /*jshint validthis:true*/

          registryModule.recountDailyBalanceBetweenDates(partnerId, minDate, maxDate, this.next());
        }
      },
      done
    );
  }

  function getOldestDateFromChanges(model)
  {
    var changes = model.changes;
    var latestChange = changes[changes.length - 1];

    if (latestChange.oldValues.date === undefined)
    {
      return model.date;
    }

    return new Date(Math.min(latestChange.oldValues.date, latestChange.newValues.date));
  }

  function onGrnAdded(message)
  {
    var grn = message.model;

    recountDailyBalanceFromDate(grn.receiver, grn.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after adding the GRN [%s]: %s",
          moment(grn.date).format('YYYY-MM-DD'),
          grn.receiver,
          grn._id,
          err.message
        );
      }
    });
  }

  function onGrnEdited(message)
  {
    var grn = message.model;

    recountDailyBalanceFromDate(grn.receiver, getOldestDateFromChanges(grn), function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after editing the GRN [%s]: %s",
          moment(grn.date).format('YYYY-MM-DD'),
          grn.receiver,
          grn._id,
          err.message
        );
      }
    });
  }

  function onGrnDeleted(message)
  {
    var grn = message.model;

    recountDailyBalanceFromDate(grn.receiver, grn.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after deleting the GRN [%s]: %s",
          moment(grn.date).format('YYYY-MM-DD'),
          grn.receiver,
          grn._id,
          err.message
        );
      }
    });
  }

  function onGdnAdded(message)
  {
    var gdn = message.model;

    recountDailyBalanceFromDate(gdn.supplier, gdn.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after adding the GDN [%s]: %s",
          moment(gdn.date).format('YYYY-MM-DD'),
          gdn.supplier,
          gdn._id,
          err.message
        );
      }
    });
  }

  function onGdnEdited(message)
  {
    var gdn = message.model;

    recountDailyBalanceFromDate(gdn.supplier, getOldestDateFromChanges(gdn), function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after editing the GDN [%s]: %s",
          moment(gdn.date).format('YYYY-MM-DD'),
          gdn.supplier,
          gdn._id,
          err.message
        );
      }
    });
  }

  function onGdnDeleted(message)
  {
    var gdn = message.model;

    recountDailyBalanceFromDate(gdn.supplier, gdn.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after deleting the GDN [%s]: %s",
          moment(gdn.date).format('YYYY-MM-DD'),
          gdn.supplier,
          gdn._id,
          err.message
        );
      }
    });
  }

  function onObAdded(message)
  {
    var ob = message.model;

    recountDailyBalanceFromDate(ob.partner, ob.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after adding the OB [%s]: %s",
          moment(ob.date).format('YYYY-MM-DD'),
          ob.partner,
          ob._id,
          err.message
        );
      }
    });
  }

  function onObEdited(message)
  {
    var ob = message.model;

    recountDailyBalanceFromDate(ob.partner, ob.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after editing the OB [%s]: %s",
          moment(ob.date).format('YYYY-MM-DD'),
          ob.partner,
          ob._id,
          err.message
        );
      }
    });
  }

  function onObDeleted(message)
  {
    var ob = message.model;

    recountDailyBalanceFromDate(ob.partner, ob.date, function(err)
    {
      if (err)
      {
        registryModule.error(
          "Failed to recount the balance from [%s] for partner [%s] "
            + "after deleting the OB [%s]: %s",
          moment(ob.date).format('YYYY-MM-DD'),
          ob.partner,
          ob._id,
          err.message
        );
      }
    });
  }
};
