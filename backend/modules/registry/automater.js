// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var step = require('h5.step');

module.exports = function setUpAutomater(app, registryModule)
{
  if (!registryModule.config.automate)
  {
    return registryModule.info("Automater is disabled.");
  }

  var mongoose = app[registryModule.config.mongooseId];
  var partners = app[registryModule.config.partnersId];
  var Grn = mongoose.model('Grn');
  var Gdn = mongoose.model('Gdn');

  app.broker.subscribe('registry.grn.added', function(message)
  {
    addAutoGdn(message.model, message.user);
  });

  app.broker.subscribe('registry.gdn.added', function(message)
  {
    addAutoGrn1(message.model, message.user);
    addAutoGrn2(message.model, message.user);
  });

  function addAutoGdn(grn, user)
  {
    var receiver = partners.modelsById[grn.receiver];
    var supplier = partners.modelsById[grn.supplier];

    if (!supplier || !receiver || !supplier.autoGdn || !hasPartnerId(supplier.autoGdnPartners, receiver._id))
    {
      return;
    }

    step(
      function createGdnStep()
      {
        var creator = grn.creator.toJSON();

        this.gdn = new Gdn({
          supplier: grn.supplier,
          receiver: grn.receiver,
          date: grn.date,
          docNo: grn.docNo,
          goods: grn.goods,
          checked: true,
          checkedAt: new Date(),
          checker: creator,
          createdAt: new Date(),
          creator: creator,
          autoNote: grn._id
        });

        this.gdn.save(this.next());
      },
      function checkGrnStep(err)
      {
        if (err)
        {
          registryModule.error("Failed to create auto GDN for GRN [%s]: %s", grn._id, err.stack);

          return this.done();
        }

        this.checked = grn.checked === false;

        if (!this.checked)
        {
          return;
        }

        grn.checkedAt = new Date();
        grn.checked = true;
        grn.checker = this.gdn.checker;
        grn.changes.push({
          createdAt: grn.checkedAt,
          creator: grn.checker,
          oldValues: {checked: !grn.checked},
          newValues: {checked: grn.checked}
        });

        grn.save(this.next());
      },
      function handleGrnCheckResultStep(err)
      {
        if (err)
        {
          registryModule.error(
            "Failed to auto check GRN [%s] after creating GDN [%s]: %s", grn._id, this.gdn._id, err.message
          );

          return this.done();
        }

        setImmediate(this.next());
      },
      function publishMessagesStep()
      {
        if (this.checked)
        {
          app.broker.publish(Grn.TOPIC_PREFIX + '.checked.' + grn._id, {
            id: grn._id,
            checked: grn.checked,
            checker: grn.checker,
            auto: true
          });
        }

        registryModule.debug("Created auto GDN [%s] after GRN [%s] was added.", this.gdn._id, grn._id);

        app.broker.publish(Gdn.TOPIC_PREFIX + '.added', {
          model: this.gdn,
          user: user
        });
      }
    );
  }

  function addAutoGrn1(gdn, user)
  {
    var receiver = partners.modelsById[gdn.receiver];
    var supplier = partners.modelsById[gdn.supplier];

    if (!supplier || !receiver || !receiver.autoGrn1 || !hasPartnerId(receiver.autoGrn1Partners, supplier._id))
    {
      return;
    }

    step(
      function createGrnStep()
      {
        var creator = gdn.creator.toJSON();

        this.grn = new Grn({
          supplier: gdn.supplier,
          receiver: gdn.receiver,
          date: gdn.date,
          docNo: gdn.docNo,
          goods: gdn.goods,
          checked: true,
          checkedAt: new Date(),
          checker: creator,
          createdAt: new Date(),
          creator: creator,
          autoNote: gdn._id
        });

        this.grn.save(this.next());
      },
      function checkGdnStep(err)
      {
        if (err)
        {
          registryModule.error("Failed to create direct auto GRN for GDN [%s]: %s", gdn._id, err.stack);

          return this.done();
        }

        this.checked = gdn.checked === false;

        if (!this.checked)
        {
          return;
        }

        gdn.checkedAt = new Date();
        gdn.checked = true;
        gdn.checker = this.grn.checker;
        gdn.changes.push({
          createdAt: gdn.checkedAt,
          creator: gdn.checker,
          oldValues: {checked: !gdn.checked},
          newValues: {checked: gdn.checked}
        });

        gdn.save(this.next());
      },
      function handleGdnCheckResultStep(err)
      {
        if (err)
        {
          registryModule.error(
            "Failed to auto check GDN [%s] after creating direct GRN [%s]: %s", gdn._id, this.grn._id, err.message
          );

          return this.done();
        }

        setImmediate(this.next());
      },
      function publishMessagesStep()
      {
        if (this.checked)
        {
          app.broker.publish(Gdn.TOPIC_PREFIX + '.checked.' + gdn._id, {
            id: gdn._id,
            checked: gdn.checked,
            checker: gdn.checker,
            auto: true
          });
        }

        registryModule.debug("Created direct auto GRN [%s] after GDN [%s] was added.", this.grn._id, gdn._id);

        app.broker.publish(Grn.TOPIC_PREFIX + '.added', {
          model: this.grn,
          user: user
        });
      }
    );
  }

  function addAutoGrn2(gdn, user)
  {
    var supplier = partners.modelsById[gdn.supplier];
    var receiver = partners.modelsById[gdn.receiver];

    if (!supplier || !receiver || !supplier.autoGrn2 || !hasPartnerId(supplier.autoGrn2Partners, receiver._id))
    {
      return;
    }

    step(
      function createGrnStep()
      {
        var creator = gdn.creator.toJSON();

        this.grn = new Grn({
          supplier: supplier.autoGrn2Partner,
          receiver: gdn.supplier,
          date: gdn.date,
          docNo: gdn.docNo,
          goods: gdn.goods,
          checked: true,
          checkedAt: new Date(),
          checker: creator,
          createdAt: new Date(),
          creator: creator,
          autoNote: gdn._id
        });

        this.grn.save(this.next());
      },
      function checkGdnStep(err)
      {
        if (err)
        {
          registryModule.error("Failed to create indirect auto GRN for GDN [%s]: %s", gdn._id, err.stack);

          return this.done();
        }

        this.checked = gdn.checked === false;

        if (!this.checked)
        {
          return;
        }

        gdn.checkedAt = new Date();
        gdn.checked = true;
        gdn.checker = this.grn.checker;
        gdn.changes.push({
          createdAt: gdn.checkedAt,
          creator: gdn.checker,
          oldValues: {checked: !this.grn.checked},
          newValues: {checked: this.grn.checked}
        });

        gdn.save(this.next());
      },
      function handleGdnCheckResultStep(err)
      {
        if (err)
        {
          registryModule.error(
            "Failed to auto check GRN [%s] after creating indirect GDN [%s]: %s", this.grn._id, gdn._id, err.message
          );

          return this.done();
        }

        setImmediate(this.next());
      },
      function publishMessagesStep()
      {
        if (this.checked)
        {
          app.broker.publish(Gdn.TOPIC_PREFIX + '.checked.' + gdn._id, {
            id: gdn._id,
            checked: gdn.checked,
            checker: gdn.checker,
            auto: true
          });
        }

        registryModule.debug("Created indirect auto GRN [%s] after GDN [%s] was added.", this.grn._id, gdn._id);

        app.broker.publish(Grn.TOPIC_PREFIX + '.added', {
          model: this.grn,
          user: user
        });
      }
    );
  }

  function hasPartnerId(haystack, needle)
  {
    if (!Array.isArray(haystack) || haystack.length === 0)
    {
      return true;
    }

    for (var i = 0, l = haystack.length; i < l; ++i)
    {
      if (haystack[i].equals(needle))
      {
        return true;
      }
    }

    return false;
  }
};
