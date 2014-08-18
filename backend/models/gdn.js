// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var validateGoods = require('./util/validateGoods');
var createChangeSchema = require('./util/createChangeSchema');

module.exports = function setupGdnModel(app, mongoose)
{
  var gdnChangeSchema = createChangeSchema(mongoose);

  var gdnSchema = mongoose.Schema({
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    receiver: {
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
    printedAt: {
      type: Date,
      default: null
    },
    createdAt: Date,
    creator: {},
    updatedAt: Date,
    updater: {},
    changes: [gdnChangeSchema]
  }, {
    id: false
  });

  gdnSchema.statics.TOPIC_PREFIX = 'registry.gdn';

  gdnSchema.index({date: -1});
  gdnSchema.index({supplier: 1, date: -1});
  gdnSchema.index({receiver: 1, date: -1});
  gdnSchema.index({supplier: 1, docNo: 1}, {unique: true});
  gdnSchema.index({docNo: 1});

  gdnSchema.path('goods').validate(validateGoods, 'goods:required');

  mongoose.model('Gdn', gdnSchema);
};
