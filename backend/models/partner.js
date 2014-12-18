// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function setupPartnerModel(app, mongoose)
{
  var partnerSchema = mongoose.Schema({
    name: {
      type: String,
      trim: true,
      required: true
    },
    address: {
      type: String,
      trim: true
    },
    clientNo: {
      type: String,
      trim: true
    },
    supplierColor: {
      type: String,
      trim: true
    },
    receiverColor: {
      type: String,
      trim: true
    },
    autoGdn: {
      type: Boolean,
      default: false
    },
    autoGdnPartners: [mongoose.Schema.Types.ObjectId],
    autoGrn: {
      type: Boolean,
      default: false
    },
    autoGrnPartner: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    autoGrnPartners: [mongoose.Schema.Types.ObjectId]
  }, {
    id: false
  });

  partnerSchema.statics.TOPIC_PREFIX = 'partners';
  partnerSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Partner', partnerSchema);
};
