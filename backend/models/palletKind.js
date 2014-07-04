// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function setupPalletKindModel(app, mongoose)
{
  var palletKindSchema = mongoose.Schema({
    name: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    no: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    position: {
      type: Number,
      default: 1,
      min: 1
    }
  }, {
    id: false
  });

  palletKindSchema.statics.TOPIC_PREFIX = 'palletKinds';
  palletKindSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('PalletKind', palletKindSchema);
};
