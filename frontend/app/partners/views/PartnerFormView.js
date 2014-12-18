// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/i18n',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/data/partners',
  'app/partners/templates/form',
  'bootstrap-colorpicker'
], function(
  _,
  t,
  idAndLabel,
  FormView,
  partners,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'partnerForm',

    events: _.extend({}, FormView.prototype.events, {
      'change .colorpicker-component > .form-control': function(e)
      {
        this.$(e.target.parentNode).colorpicker('setValue', e.target.value);
      }
    }),

    $supplierColorPicker: null,
    $receiverColorPicker: null,

    destroy: function()
    {
      if (this.$supplierColorPicker !== null)
      {
        this.$supplierColorPicker.colorpicker('destroy');
        this.$supplierColorPicker = null;
      }

      if (this.$receiverColorPicker !== null)
      {
        this.$receiverColorPicker.colorpicker('destroy');
        this.$receiverColorPicker = null;
      }

      FormView.prototype.destroy.call(this);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$supplierColorPicker = this.$id('supplierColorPicker').colorpicker();
      this.$receiverColorPicker = this.$id('receiverColorPicker').colorpicker();

      this.$id('autoGdnPartners').select2({
        allowClear: true,
        multiple: true,
        placeholder: t('partners', 'form:autoGdn:placeholder'),
        data: partners.map(idAndLabel)
      });
    },

    serializeToForm: function()
    {
      var formData = FormView.prototype.serializeToForm.apply(this, arguments);

      formData.autoGdnPartners = formData.autoGdnPartners.join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      ['clientNo', 'address', 'supplierColor', 'receiverColor'].forEach(function(property)
      {
        if (!formData[property])
        {
          formData[property] = null;
        }
      });

      formData.autoGdn = !!formData.autoGdn;
      formData.autoGdnPartners = formData.autoGdn && formData.autoGdnPartners
        ? formData.autoGdnPartners.split(',')
        : [];

      return formData;
    }

  });
});
