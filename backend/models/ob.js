// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var validateGoods = require('./util/validateGoods');
var createChangeSchema = require('./util/createChangeSchema');
var userInfoSchema = require('./userInfoSchema');

module.exports = function setupObModel(app, mongoose)
{
  var obChangeSchema = createChangeSchema(mongoose);

  var obSchema = mongoose.Schema({
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    goods: {},
    createdAt: Date,
    creator: userInfoSchema,
    updatedAt: Date,
    updater: {},
    changes: [obChangeSchema]
  }, {
    id: false
  });

  obSchema.statics.TOPIC_PREFIX = 'registry.ob';

  obSchema.index({date: -1});
  obSchema.index({partner: 1, date: -1});

  obSchema.path('goods').validate(validateGoods, 'goods:required');

  mongoose.model('Ob', obSchema);
};
