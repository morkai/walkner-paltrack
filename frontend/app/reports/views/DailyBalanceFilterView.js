// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
