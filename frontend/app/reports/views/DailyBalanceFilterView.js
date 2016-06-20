// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/reports/templates/dailyBalanceFilter'
], function(
  time,
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        date: time.format(Date.now(), 'YYYY-MM-DD')
      };
    },

    termToForm: {
      'date': function(propertyName, term, formData)
      {
        formData.date = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var moment = time.getMoment(this.$id('date').val().trim());

      if (!moment.isValid())
      {
        moment = time.getMoment();
      }

      var date = moment.format('YYYY-MM-DD');

      selector.push({name: 'eq', args: ['date', date]});

      this.$id('date').val(date);
    }

  });
});
