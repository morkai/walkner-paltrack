// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/core/views/FormView',
  'app/palletKinds/templates/form'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'palletKindForm',

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = null;
      }

      if (!formData.no)
      {
        formData.no = null;
      }

      if (!formData.position)
      {
        formData.position = 1;
      }

      return formData;
    }

  });
});
