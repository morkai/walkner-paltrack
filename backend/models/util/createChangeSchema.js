// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function createChangeSchema(mongoose)
{
  return mongoose.Schema({
    createdAt: Date,
    creator: {},
    oldValues: {},
    newValues: {}
  }, {
    _id: false
  });
};
