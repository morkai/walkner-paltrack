// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
