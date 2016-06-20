// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/broker',
  'app/pubsub',
  'app/user',
  'app/reports/DailyBalanceCollection'
], function(
  broker,
  pubsub,
  user,
  DailyBalanceCollection
) {
  'use strict';

  var sub = null;
  var currentBalances = new DailyBalanceCollection();

  broker.subscribe('user.reloaded', function()
  {
    reloadCurrentBalance();

    if (sub !== null)
    {
      sub.cancel();
      sub = null;
    }

    if (user.data.partner)
    {
      sub = pubsub.subscribe('balance.current.' + user.data.partner, reloadCurrentBalance);
    }
  });

  function reloadCurrentBalance()
  {
    if (user.data.partner && user.isAllowedTo('REPORTS:VIEW'))
    {
      currentBalances.fetch({reset: true});
    }
    else
    {
      currentBalances.reset([]);
    }
  }

  return currentBalances;
});
