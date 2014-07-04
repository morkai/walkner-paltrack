// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/viewport'
], function(
  _,
  viewport
) {
  'use strict';

  return function(optionsOrModel, req, referer)
  {
    var options = typeof optionsOrModel === 'function' ? {Model: optionsOrModel} : optionsOrModel;
    var model = new options.Model({_id: req.params.id});

    viewport.loadPage('app/core/pages/ActionFormPage', function(ActionFormPage)
    {
      return new ActionFormPage(_.extend({
        model: model,
        actionKey: 'delete',
        successUrl: model.genClientUrl('base'),
        cancelUrl: referer || model.genClientUrl('base'),
        formMethod: 'DELETE',
        formAction: model.url(),
        formActionSeverity: 'danger'
      }, options));
    });
  };
});
