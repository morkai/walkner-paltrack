// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/FormView',
  './createPageBreadcrumbs'
], function(
  t,
  bindLoadingMessage,
  View,
  FormView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editForm',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      var model = this.getDefaultModel();

      return createPageBreadcrumbs(this, [
        {
          label: model.getLabel() || t.bound(model.getNlsDomain(), 'BREADCRUMB:details'),
          href: model.genClientUrl()
        },
        ':editForm'
      ]);
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    load: function(when)
    {
      var model = this.getDefaultModel();

      if (model.isSynced && model.isSynced())
      {
        return when();
      }

      return when(model.fetch(this.options.fetchOptions));
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.getDefaultModel(), this);
    },

    defineViews: function()
    {
      var FormViewClass = this.getFormViewClass();

      this.view = new FormViewClass(this.getFormViewOptions());
    },

    defineBindings: function()
    {

    },

    getFormViewClass: function()
    {
      return this.options.FormView || this.FormView || FormView;
    },

    getFormViewOptions: function()
    {
      var model = this.getDefaultModel();
      var nlsDomain = model.getNlsDomain();
      var options = {
        editMode: true,
        model: model,
        formMethod: 'PUT',
        formAction: model.url(),
        formActionText: t(t.has(nlsDomain, 'FORM:ACTION:edit') ? nlsDomain : 'core', 'FORM:ACTION:edit'),
        failureText: t(t.has(nlsDomain, 'FORM:ACTION:editFailure') ? nlsDomain : 'core', 'FORM:ERROR:editFailure'),
        panelTitleText: t(t.has(nlsDomain, 'PANEL:TITLE:editForm') ? nlsDomain : 'core', 'PANEL:TITLE:editForm')
      };

      if (typeof this.options.formTemplate === 'function')
      {
        options.template = this.options.formTemplate;
      }

      return options;
    },

    getDefaultModel: function()
    {
      return this.model;
    }

  });
});
