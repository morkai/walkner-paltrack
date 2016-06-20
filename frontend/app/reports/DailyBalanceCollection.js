// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Collection',
  '../data/partners',
  './DailyBalance'
], function(
  user,
  Collection,
  partners,
  DailyBalance
) {
  'use strict';

  return Collection.extend({

    model: DailyBalance,

    parse: function(res)
    {
      var result = [];

      Object.keys(res).forEach(function(partnerId)
      {
        result.push({
          _id: partnerId,
          goods: res[partnerId]
        });
      });

      return result;
    }

  });
});
