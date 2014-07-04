// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'jquery',
  'underscore',
  'form2js',
  'js2form',
  'app/viewport',
  '../View'
], function(
  $,
  _,
  form2js,
  js2form,
  viewport,
  View
) {
  'use strict';

  return View.extend({

    events: {
      'submit': 'submitForm'
    },

    idPrefix: 'formView',

    $errorMessage: null,

    initialize: function()
    {
      this.idPrefix = _.uniqueId(this.idPrefix);
      this.$errorMessage = null;

      this.listenTo(this.model, 'change', function()
      {
        if (this.isRendered())
        {
          js2form(this.el, this.serializeToForm());
        }
      });
    },

    destroy: function()
    {
      this.hideErrorMessage();
    },

    serialize: function()
    {
      return {
        editMode: !!this.options.editMode,
        idPrefix: this.idPrefix,
        formMethod: this.options.formMethod,
        formAction: this.options.formAction,
        formActionText: this.options.formActionText,
        panelTitleText: this.options.panelTitleText,
        model: this.model.toJSON()
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeToForm());
    },

    serializeToForm: function()
    {
      return this.model.toJSON();
    },

    serializeForm: function(formData)
    {
      return formData;
    },

    submitForm: function()
    {
      this.hideErrorMessage();

      if (!this.el.checkValidity())
      {
        return false;
      }

      var formData = this.serializeForm(form2js(this.el));

      if (!this.checkValidity(formData))
      {
        return false;
      }

      var $submitEl = this.$('[type="submit"]').attr('disabled', true);

      var req = this.promised(this.model.save(formData, {
        wait: true
      }));

      req.done(this.handleSuccess.bind(this));

      req.fail(this.handleFailure.bind(this));

      req.always(function()
      {
        $submitEl.attr('disabled', false);
      });

      return false;
    },

    showErrorMessage: function(text)
    {
      this.hideErrorMessage();

      this.$errorMessage = viewport.msg.show({
        type: 'error',
        time: 5000,
        text: text
      });
    },

    hideErrorMessage: function()
    {
      if (this.$errorMessage !== null)
      {
        viewport.msg.hide(this.$errorMessage);

        this.$errorMessage = null;
      }
    },

    checkValidity: function(formData)
    {
      return !!formData;
    },

    handleSuccess: function()
    {
      if (typeof this.options.done === 'function')
      {
        this.options.done(true);
      }
      else
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          trigger: true
        });
      }
    },

    handleFailure: function()
    {
      this.showErrorMessage(this.options.failureText);
    }

  });
});
