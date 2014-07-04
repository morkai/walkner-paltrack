// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var lodash = require('lodash');

module.exports = function limitToPartner(property, req, res, next)
{
  var selector = req.rql.selector;
  var partnerId = req.session.user.partner;

  if (!partnerId)
  {
    return next();
  }

  var receiverTerm = lodash.find(selector.args, function(term)
  {
    return term.name === 'eq' && term.args[0] === property;
  });

  if (receiverTerm)
  {
    receiverTerm.args[1] = partnerId;
  }
  else
  {
    selector.args.push({
      name: 'eq',
      args: [property, partnerId]
    });
  }

  next();
};
