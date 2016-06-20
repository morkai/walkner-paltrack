// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var mongoose = require('mongoose');

module.exports = {
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ip: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true,
    trim: true
  }
};
