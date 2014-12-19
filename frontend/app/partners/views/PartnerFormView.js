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

      var autoGnPartners = partners.map(idAndLabel);

      this.$id('autoGdnPartners').select2({
        allowClear: true,
        multiple: true,
        placeholder: t('partners', 'form:autoGn:allReceivers'),
        data: autoGnPartners
      });

      this.$id('autoGrn1Partners').select2({
        allowClear: true,
        multiple: true,
        placeholder: t('partners', 'form:autoGn:allSuppliers'),
        data: autoGnPartners
      });

      this.$id('autoGrn2Partner').select2({
        allowClear: true,
        placeholder: t('partners', 'form:autoGrn2Partner:placeholder'),
        data: autoGnPartners
      });

      this.$id('autoGrn2Partners').select2({
        allowClear: true,
        multiple: true,
        placeholder: t('partners', 'form:autoGn:allReceivers'),
        data: autoGnPartners
      });
    },

    serializeToForm: function()
    {
      var formData = FormView.prototype.serializeToForm.apply(this, arguments);

      formData.autoGdnPartners = formData.autoGdnPartners.join(',');
      formData.autoGrn1Partners = formData.autoGrn1Partners.join(',');
      formData.autoGrn2Partners = formData.autoGrn2Partners.join(',');

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

      formData.autoGrn1 = !!formData.autoGrn1;
      formData.autoGrn1Partners = formData.autoGrn1 && formData.autoGrn1Partners
        ? formData.autoGrn1Partners.split(',')
        : [];

      formData.autoGrn2 = !!formData.autoGrn2;
      formData.autoGrn2Partner = formData.autoGrn2 && formData.autoGrn2Partner ? formData.autoGrn2Partner : null;
      formData.autoGrn2Partners = formData.autoGrn2 && formData.autoGrn2Partners
        ? formData.autoGrn2Partners.split(',')
        : [];

      return formData;
    },

    checkValidity: function(formData)
    {
      if (formData.autoGrn2 && !formData.autoGrn2Partner)
      {
        this.$id('autoGrnPartner').select2('focus');

        return this.showErrorMessage(t('partners', 'form:error:requiredGrnSupplier'));
      }

      return true;
    }

  });
});
