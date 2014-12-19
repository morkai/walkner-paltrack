// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  'app/data/partners'
], function(
  t,
  partners
) {
  'use strict';

  function getPartnerLabel(partnerId)
  {
    var partner = partners.get(partnerId);

    return partner ? partner.getLabel() : partnerId;
  }

  function formatPartnerLabel(partnerIds, allPartnersKey)
  {
    if (!Array.isArray(partnerIds) || partnerIds.length === 0)
    {
      return t('partners', 'form:autoGn:' + allPartnersKey);
    }

    return partnerIds.map(getPartnerLabel).join('; ');
  }

  return function decoratePartner(partner)
  {
    var obj = partner.toJSON();

    obj.autoGdnText = !obj.autoGdn ? t('core', 'BOOL:false') : formatPartnerLabel(obj.autoGdnPartners, 'allReceivers');

    obj.autoGrn1Text = !obj.autoGrn1
      ? t('core', 'BOOL:false')
      : formatPartnerLabel(obj.autoGrn1Partners, 'allSuppliers');

    if (!obj.autoGrn2)
    {
      obj.autoGrn2Text = t('core', 'BOOL:false');
    }
    else
    {
      obj.autoGrn2Text = formatPartnerLabel([obj.autoGrn2Partner], null)
        + ' <- '
        + formatPartnerLabel(obj.autoGrn2Partners, 'allReceivers');
    }

    return obj;
  };
});
