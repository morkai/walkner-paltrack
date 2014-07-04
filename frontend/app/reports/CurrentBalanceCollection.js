// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../user',
  '../core/Collection',
  '../data/partners',
  './CurrentBalance'
], function(
  user,
  Collection,
  partners,
  CurrentBalance
) {
  'use strict';

  return Collection.extend({

    model: CurrentBalance,

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

      /*
      if (!user.data.partner)
      {
        partners.forEach(function(partner)
        {
          if (!res[partner.id])
          {
            result.push({
              _id: partner.id,
              goods: {}
            });
          }
        });
      }
      */

      return result;
    }

  });
});
