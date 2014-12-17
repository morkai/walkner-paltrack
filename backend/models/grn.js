// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack `oject <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var deepEqual = require('deep-equal');
var validateGoods = require('./util/validateGoods');
var createChangeSchema = require('./util/createChangeSchema');
var userInfoSchema = require('./userInfoSchema');

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
    creator: userInfoSchema,
    updatedAt: Date,
    updater: {},
    changes: [grnChangeSchema]
  }, {
    id: false
  });

  grnSchema.statics.TOPIC_PREFIX = 'registry.grn';
  grnSchema.statics.BROWSE_LIMIT = 1000;

  grnSchema.index({date: -1});
  grnSchema.index({receiver: 1, date: -1});
  grnSchema.index({supplier: 1, date: -1});
  grnSchema.index({receiver: 1, docNo: 1});

  grnSchema.path('goods').validate(validateGoods, 'goods:required');

  grnSchema.methods.findRelatedGn = function(done)
  {
    var conditions = {
      receiver: this.receiver,
      supplier: this.supplier,
      docNo: this.docNo
    };

    mongoose.model('Gdn').findOne(conditions, done);
  };

  grnSchema.methods.checkGdn = function(done)
  {
    var grn = this;

    this.findRelatedGn(function(err, gdn)
    {
      if (err)
      {
        return done(err);
      }

      grn.checkedAt = grn.createdAt;
      grn.checker = grn.creator;
      grn.checked = gdn ? deepEqual(grn.goods, gdn.goods) : false;

      return done();
    });
  };

  mongoose.model('Grn', grnSchema);
};
