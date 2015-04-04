// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/prepareDateRange',
  'app/data/partners',
  'app/registry/templates/grnFilter'
], function(
  _,
  js2form,
  t,
  user,
  time,
  FilterView,
  idAndLabel,
  prepareDateRange,
  partners,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({}, FilterView.prototype.events, {
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'), false);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
      }
    }),

    firstPartnerProperty: 'receiver',
    secondPartnerProperty: 'supplier',

    defaultFormData: {
      receiver: '',
      supplier: '',
      from: '',
      to: '',
      docNo: ''
    },

    termToForm: {
      'receiver': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'supplier': 'receiver',
      'docNo': 'receiver',
      'date': function(propertyName, term, formData)
      {
        var value = time.format(term.args[1], 'YYYY-MM-DD');

        if (term.name === 'lt')
        {
          formData.to = value;
        }
        else if (term.name === 'ge')
        {
          formData.from = value;
        }
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.on('filterChanged', this.onFilterChanged);
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
      FilterView.prototype.afterRender.call(this);

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

    serializeFormToQuery: function(selector)
    {
      var receiver = this.$id('receiver').val();
      var supplier = this.$id('supplier').val();
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
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
    },

    onFilterChanged: function(rqlQuery)
    {
      localStorage.GRN_LIMIT = rqlQuery.limit;
    }

  });
});
