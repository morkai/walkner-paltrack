// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function limitToPartner(property, req, res, next)
{
  var selector = req.rql.selector;
  var partnerId = req.session.user.partner;

  if (!partnerId)
  {
    return next();
  }

  var receiverTerm = _.find(selector.args, function(term)
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
