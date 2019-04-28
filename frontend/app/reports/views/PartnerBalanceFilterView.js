// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/data/partners',
  'app/reports/templates/partnerBalanceFilter'
], function(
  _,
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

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'change #-rows': function()
      {
        this.trigger('rowsChanged', this.getButtonGroupValue('rows'));
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        from: time.getMoment().startOf('month').format('YYYY-MM-DD'),
        to: time.getMoment().startOf('month').add(1, 'months').format('YYYY-MM-DD'),
        partner: null,
        rows: ['partner', 'total', 'balance', 'summary']
      };
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'partner': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'rows': 'partner'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('partner').select2({
        width: '250px',
        placeholder: ' ',
        allowClear: true,
        data: partners.map(idAndLabel)
      });

      this.toggleButtonGroup('rows');
    },

    serializeFormToQuery: function(selector)
    {
      var partner = this.$id('partner').val();

      dateTimeRange.formToRql(this, selector);

      selector.push({name: 'eq', args: ['partner', partner]});
      selector.push({name: 'in', args: ['rows', this.getButtonGroupValue('rows')]});
    }

  });
});
