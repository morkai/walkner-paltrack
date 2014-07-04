// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;
var deepEqual = require('deep-equal');

module.exports = function recordChanges(model, newValues, updater)
{
  var changes = {
    createdAt: new Date(),
    creator: updater,
    oldValues: {},
    newValues: {}
  };

  model.updatedAt = changes.createdAt;
  model.updater = changes.creator;

  Object.keys(newValues).forEach(function(propertyName)
  {
    var newValue = newValues[propertyName];

    if (propertyName === 'goods')
    {
      recordGoodsChange(model, newValue, changes);
    }
    else
    {
      recordGenericChange(model, propertyName, newValue, changes);
    }
  });

  var changeCount = Object.keys(changes.newValues).length;

  if (changeCount)
  {
    model.changes.push(changes);
  }

  return changeCount;
};

function recordGenericChange(model, propertyName, newValue, changes)
{
  var oldValue = model[propertyName];

  if (oldValue instanceof Date || propertyName.substr(-2) === 'At')
  {
    newValue = moment(newValue).toDate();
  }
  else if (oldValue instanceof ObjectId)
  {
    oldValue = oldValue.toString();
  }

  if (!deepEqual(oldValue, newValue, {strict: true}))
  {
    changes.oldValues[propertyName] = oldValue;
    changes.newValues[propertyName] = newValue;

    model[propertyName] = newValue;
  }
}

function recordGoodsChange(model, newValue, changes)
{
  if (newValue === null)
  {
    model.goods = null;

    return;
  }

  var oldGoods = model.goods;
  var newGoods = {};

  Object.keys(newValue).forEach(function(palletKindId)
  {
    var oldCount = oldGoods[palletKindId] || 0;
    var newCount = +newValue[palletKindId];

    if (newCount !== oldCount)
    {
      var key = 'goods:' + palletKindId;

      changes.oldValues[key] = oldCount;
      changes.newValues[key] = newCount;
    }

    newGoods[palletKindId] = newCount;

    delete oldGoods[palletKindId];
  });

  Object.keys(oldGoods).forEach(function(palletKindId)
  {
    var key = 'goods:' + palletKindId;

    changes.oldValues[key] = oldGoods[palletKindId];
    changes.newValues[key] = 0;
  });

  model.goods = newGoods;
}
