// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
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
  dateTimeRange,
  partners,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    firstPartnerProperty: 'receiver',
    secondPartnerProperty: 'supplier',

    defaultFormData: {
      receiver: '',
      supplier: '',
      docNo: ''
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'receiver': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'supplier': 'receiver',
      'docNo': 'receiver'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.on('filterChanged', this.onFilterChanged);
    },

    getTemplateData: function()
    {
      return {
        firstPartnerProperty: this.firstPartnerProperty,
        secondPartnerProperty: this.secondPartnerProperty
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('receiver').select2({
        width: '250px',
        placeholder: ' ',
        allowClear: true,
        data: this.getReceivers()
      });

      this.$id('supplier').select2({
        width: '250px',
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
      const $from = this.$id('from-date');
      const $to = this.$id('to-date');

      if (!$from.val())
      {
        $from.focus();
      }
      else if (!$to.val())
      {
        $to.focus();
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
      var docNo = this.$id('docNo').val();

      dateTimeRange.formToRql(this, selector);

      if (receiver)
      {
        selector.push({name: 'eq', args: ['receiver', receiver]});
      }

      if (supplier)
      {
        selector.push({name: 'eq', args: ['supplier', supplier]});
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
