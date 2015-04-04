// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var lodash = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

module.exports = function checkGnRoute(app, registryModule, Gn, req, res, next)
{
  var conditions = mongoSerializer.fromQuery(req.rql).selector;
  var receiver = conditions.receiver;
  var supplier = conditions.supplier;

  if (!receiver && !supplier)
  {
    return res.status(400).json(new Error('INVALID_PARTNER'));
  }

  if (!conditions.date || !conditions.date.$gte || !conditions.date.$lt)
  {
    return res.status(400).json(new Error('INVALID_DATE'));
  }

  var mongoose = app[registryModule.config.mongooseId];
  var Partner = mongoose.model('Partner');
  var PalletKind = mongoose.model('PalletKind');
  var gnType = mongoose.model('Grn') === Gn ? 'grn' : 'gdn';

  step(
    function findGnsStep()
    {
      this.partnersNotes = {};

      var fields = {
        receiver: 1,
        supplier: 1,
        date: 1,
        docNo: 1,
        goods: 1
      };

      var stream = Gn.find(conditions, fields).lean().stream();
      var next = this.next();

      stream.on('end', next);
      stream.on('error', next);
      stream.on('data', handleGnForPrint.bind(null, this.partnersNotes, !!receiver));
    },
    function findPartnersAndPalletKindsStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      var partnerIds = Object.keys(this.partnersNotes);

      if (receiver && partnerIds.indexOf(receiver) === -1)
      {
        partnerIds.push(receiver);
      }

      if (supplier && partnerIds.indexOf(supplier) === -1)
      {
        partnerIds.push(supplier);
      }

      Partner.find({_id: {$in: partnerIds}}, {name: 1, clientNo: 1}).lean().exec(this.parallel());
      PalletKind.find({}, {name: 1}).sort({position: 1}).lean().exec(this.parallel());
    },
    function preparePartnersAndPalletKindsStep(err, partners, palletKinds)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.partners = {};

      lodash.forEach(partners, function(partner)
      {
        this.partners[partner._id] = partner;

        partner._id = undefined;
      }, this);

      this.palletKinds = {};

      lodash.forEach(palletKinds, function(palletKind)
      {
        this.palletKinds[palletKind._id] = palletKind.name;
      }, this);
    },
    function sendResultsStep(err)
    {
      if (err)
      {
        return next(err);
      }

      var partners = this.partners;
      var partnersNotes = [];

      lodash.forEach(this.partnersNotes, function(partnerNotes, partner)
      {
        partnersNotes.push({
          partner: formatPartner(partners[partner]),
          totals: partnerNotes.totals,
          notes: partnerNotes.notes.reverse()
        });
      });

      res.render('../modules/registry/templates/' + gnType + 'List.ejs', {
        from: moment(conditions.date.$gte).format('DD.MM.YYYY'),
        to: moment(conditions.date.$lt).subtract(1, 'days').format('DD.MM.YYYY'),
        receiver: formatPartner(partners[receiver]),
        supplier: formatPartner(partners[supplier]),
        palletKinds: lodash.map(this.palletKinds, function(v, k) { return {_id: k, name: v}; }),
        partnersNotes: partnersNotes
      });
    }
  );
};

function formatPartner(partner)
{
  return partner ? (partner.name + (partner.clientNo ? (' (' + partner.clientNo + ')') : '')) : null;
}

function handleGnForPrint(partnersNotes, hasReceiver, grn)
{
  var partnerId = grn[hasReceiver ? 'supplier' : 'receiver'].toString();

  if (partnersNotes[partnerId] === undefined)
  {
    partnersNotes[partnerId] = {
      totals: {},
      notes: []
    };
  }

  var partnerNotes = partnersNotes[partnerId];

  lodash.forEach(grn.goods, function(count, palletKind)
  {
    if (partnerNotes.totals[palletKind] === undefined)
    {
      partnerNotes.totals[palletKind] = count;
    }
    else
    {
      partnerNotes.totals[palletKind] += count;
    }
  });

  partnerNotes.notes.push({
    date: moment(grn.date).format('DD.MM.YYYY'),
    docNo: grn.docNo,
    goods: grn.goods
  });
}
