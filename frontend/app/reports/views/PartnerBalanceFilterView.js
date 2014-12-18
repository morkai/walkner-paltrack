// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/prepareDateRange',
  'app/data/partners',
  'app/reports/templates/partnerBalanceFilter'
], function(
  _,
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

      'change #-rows': function()
      {
        this.trigger('rowsChanged', this.getButtonGroupValue('rows'));
      },
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'), false);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
      }

    }),

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
      'from': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'to': 'from',
      'partner': 'from',
      'rows': function(propertyName, term, formData)
      {
        formData.rows = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('partner').select2({
        width: '150px',
        placeholder: ' ',
        allowClear: true,
        data: partners.map(idAndLabel)
      });

      this.toggleButtonGroup('rows');
    },

    serializeFormToQuery: function(selector)
    {
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());
      var partner = this.$id('partner').val();

      if (!fromMoment.isValid() || !toMoment.isValid())
      {
        fromMoment = time.getMoment().startOf('month');
        toMoment = fromMoment.clone().add(1, 'months');
      }

      var from = fromMoment.format('YYYY-MM-DD');
      var to = toMoment.format('YYYY-MM-DD');

      selector.push({name: 'eq', args: ['partner', partner]});
      selector.push({name: 'eq', args: ['from', from]});
      selector.push({name: 'eq', args: ['to', to]});
      selector.push({name: 'in', args: ['rows', this.getButtonGroupValue('rows')]});

      this.$id('from').val(from);
      this.$id('to').val(to);
    }

  });
});
