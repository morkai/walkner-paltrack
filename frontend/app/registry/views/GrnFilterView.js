// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/partners',
  'app/registry/templates/grnFilter'
], function(
  _,
  js2form,
  t,
  user,
  time,
  Model,
  View,
  idAndLabel,
  partners,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    firstPartnerProperty: 'receiver',
    secondPartnerProperty: 'supplier',

    initialize: function()
    {
      this.idPrefix = _.uniqueId();
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        firstPartnerProperty: this.firstPartnerProperty,
        secondPartnerProperty: this.secondPartnerProperty
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$id('receiver').select2({
        width: '150px',
        placeholder: ' ',
        allowClear: true,
        data: this.getReceivers()
      });

      this.$id('supplier').select2({
        width: '150px',
        placeholder: ' ',
        allowClear: true,
        data: this.getSuppliers()
      });
    },

    focusFirstPartner: function()
    {
      this.$id(this.firstPartnerProperty).select2('focus');
    },

    focusEmptyDate: function()
    {
      if (!this.$id('from').val().trim().length)
      {
        this.$id('from').focus();
      }
      else if (!this.$id('to').val().trim().length)
      {
        this.$id('to').focus();
      }
      else
      {
        this.$('[type=submit]').focus();
      }
    },

    getSuppliers: function()
    {
      return partners.withoutUsersPartner().map(idAndLabel);
    },

    getReceivers: function()
    {
      return partners.map(idAndLabel);
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var maxLimit = parseInt(this.$id('limit').attr('max'), 10) || 100;
      var formData = {
        receiver: '',
        supplier: '',
        from: '',
        to: '',
        docNo: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > maxLimit ? maxLimit : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        if (term.name !== 'eq' && term.name !== 'lt' && term.name !== 'ge')
        {
          return;
        }

        var property = term.args[0];

        switch (property)
        {
          case 'receiver':
          case 'supplier':
          case 'docNo':
            formData[property] = term.args[1];
            break;

          case 'date':
            var value = time.format(term.args[1], 'YYYY-MM-DD');

            if (term.name === 'lt')
            {
              formData.to = value;
            }
            else if (term.name === 'ge')
            {
              formData.from = value;
            }
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = [];
      var receiver = this.$id('receiver').val();
      var supplier = this.$id('supplier').val();
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());
      var docNo = this.$id('docNo').val();

      if (receiver)
      {
        selector.push({name: 'eq', args: ['receiver', receiver]});
      }

      if (supplier)
      {
        selector.push({name: 'eq', args: ['supplier', supplier]});
      }

      if (fromMoment.isValid() && toMoment.isValid() && fromMoment.valueOf() === toMoment.valueOf())
      {
        toMoment.add(1, 'days');

        this.$id('to').val(toMoment.format('YYYY-MM-DD'));
      }

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['date', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        selector.push({name: 'lt', args: ['date', toMoment.valueOf()]});
      }

      if (docNo.length)
      {
        selector.push({name: 'eq', args: ['docNo', docNo]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.beforeFilterChanged(rqlQuery);
      this.trigger('filterChanged', rqlQuery);
    },

    beforeFilterChanged: function(rqlQuery)
    {
      localStorage.GRN_LIMIT = rqlQuery.limit;
    }

  });
});
