// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/data/partners',
  'app/partners/Partner',
  'app/partners/views/PartnerFormView'
], function(
  t,
  viewport,
  partners,
  Partner,
  PartnerFormView
) {
  'use strict';

  return function showAddPartnerForm(e)
  {
    var property = e.target.dataset.property;
    var view = this;
    var partner = new Partner();

    var partnerFormView = new PartnerFormView({
      editMode: false,
      model: partner,
      formMethod: 'POST',
      formAction: partner.url(),
      formActionText: t(partner.getNlsDomain(), 'FORM:ACTION:add'),
      failureText: t(partner.getNlsDomain(), 'FORM:ERROR:addFailure'),
      panelTitleText: t(partner.getNlsDomain(), 'PANEL:TITLE:addForm'),
      dialogClassName: 'has-panel',
      done: function()
      {
        viewport.closeDialog();
        view.model.set(property, partner.id, {silent: true});
        partners.add(partner);
      }
    });

    viewport.showDialog(partnerFormView);
  };
});
