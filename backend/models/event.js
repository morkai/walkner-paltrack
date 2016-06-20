// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var userInfoSchema = require('./userInfoSchema');

module.exports = function setupEventModel(app, mongoose)
{
  var eventSchema = mongoose.Schema({
    type: {
      type: String,
      trim: true,
      required: true
    },
    severity: {
      type: String,
      enum: ['debug', 'info', 'success', 'warning', 'error'],
      default: 'info'
    },
    time: {
      type: Number,
      default: Date.now
    },
    user: userInfoSchema,
    data: {
      type: Object
    }
  }, {
    id: false
  });

  eventSchema.statics.TOPIC_PREFIX = 'events';

  eventSchema.index({time: -1});
  eventSchema.index({severity: 1, time: -1});
  eventSchema.index({type: 1, time: -1});

  mongoose.model('Event', eventSchema);
};
