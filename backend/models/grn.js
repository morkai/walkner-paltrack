// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var validateGoods = require('./util/validateGoods');
var createChangeSchema = require('./util/createChangeSchema');

module.exports = function setupGrnModel(app, mongoose)
{
  var grnChangeSchema = createChangeSchema(mongoose);

  var grnSchema = mongoose.Schema({
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    docNo: {
      type: String,
      required: true,
      trim: true
    },
    goods: {},
    checked: {
      type: Boolean,
      default: false
    },
    checkedAt: {
      type: Date,
      default: null
    },
    checker: {},
    createdAt: Date,
    creator: {},
    updatedAt: Date,
    updater: {},
    changes: [grnChangeSchema]
  }, {
    id: false
  });

  grnSchema.statics.TOPIC_PREFIX = 'registry.grn';

  grnSchema.index({date: -1});
  grnSchema.index({receiver: 1, date: -1});
  grnSchema.index({supplier: 1, date: -1});
  grnSchema.index({receiver: 1, docNo: 1});

  grnSchema.path('goods').validate(validateGoods, 'goods:required');

  mongoose.model('Grn', grnSchema);
};
