// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
