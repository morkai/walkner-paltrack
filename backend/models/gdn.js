// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var deepEqual = require('deep-equal');
var validateGoods = require('./util/validateGoods');
var createChangeSchema = require('./util/createChangeSchema');
var userInfoSchema = require('./userInfoSchema');

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
    createdAt: Date,
    creator: userInfoSchema,
    updatedAt: Date,
    updater: {},
    changes: [gdnChangeSchema],
    autoNote: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  }, {
    id: false,
    minimize: false
  });

  gdnSchema.statics.TOPIC_PREFIX = 'registry.gdn';
  gdnSchema.statics.BROWSE_LIMIT = 1000;

  gdnSchema.index({date: -1});
  gdnSchema.index({supplier: 1, date: -1});
  gdnSchema.index({receiver: 1, date: -1});
  gdnSchema.index({supplier: 1, docNo: 1});
  gdnSchema.index({docNo: 1});

  gdnSchema.path('goods').validate(validateGoods, 'goods:required');

  gdnSchema.methods.findRelatedGn = function(done)
  {
    var conditions = {
      receiver: this.receiver,
      supplier: this.supplier,
      docNo: this.docNo
    };

    mongoose.model('Grn').findOne(conditions, done);
  };

  gdnSchema.methods.checkGrn = function(done)
  {
    var gdn = this;

    this.findRelatedGn(function(err, grn)
    {
      if (err)
      {
        return done(err);
      }

      gdn.checkedAt = gdn.createdAt;
      gdn.checker = gdn.creator;
      gdn.checked = grn ? deepEqual(gdn.goods, grn.goods) : false;

      return done();
    });
  };

  mongoose.model('Gdn', gdnSchema);
};
