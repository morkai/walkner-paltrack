// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function validateGoods(goods)
{
  if (typeof goods !== 'object' || goods === null)
  {
    return false;
  }

  var keys = Object.keys(goods);

  if (keys.length === 0)
  {
    return false;
  }

  keys.forEach(function(key)
  {
    if (typeof goods[key] !== 'number' || goods[key] <= 0)
    {
      delete goods[key];
    }
  });

  return Object.keys(goods).length > 0;
};
