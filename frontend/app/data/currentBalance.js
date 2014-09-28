// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/broker',
  'app/pubsub',
  'app/user',
  'app/reports/CurrentBalanceCollection'
], function(
  broker,
  pubsub,
  user,
  CurrentBalanceCollection
) {
  'use strict';

  var sub = null;
  var currentBalances = new CurrentBalanceCollection();

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
