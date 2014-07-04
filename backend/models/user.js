// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function setupUserModel(app, mongoose)
{
  var userSchema = mongoose.Schema({
    login: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    email: String,
    privileges: [String],
    partner: {
      type: String,
      ref: 'Partner'
    },
    firstName: String,
    lastName: String
  }, {
    id: false,
    toJSON: {
      transform: function(user, ret)
      {
        delete ret.password;

        return ret;
      }
    }
  });

  userSchema.index({lastName: 1});

  userSchema.statics.TOPIC_PREFIX = 'users';

  userSchema.statics.customizeLeanObject = function(leanModel)
  {
    delete leanModel.password;

    return leanModel;
  };

  mongoose.model('User', userSchema);
};
