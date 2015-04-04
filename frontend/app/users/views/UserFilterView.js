// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/core/views/FilterView',
  'app/data/partners',
  'app/users/templates/filter',
  'select2'
], function(
  FilterView,
  partners,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      lastName: '',
      partner: ''
    },

    termToForm: {
      'lastName': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      },
      'partner': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var lastName = this.$id('lastName').val().trim();
      var partner = this.$id('partner').val();

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }

      if (partner.length)
      {
        selector.push({name: 'eq', args: ['partner', partner]});
      }
    },
    
    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);
      
      this.$id('partner').select2({
        width: 'resolve',
        allowClear: true,
        data: partners.map(function(partner)
        {
          return {
            id: partner.id,
            text: partner.getLabel()
          };
        })
      });
    }

  });
});
