// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
