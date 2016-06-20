// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/DetailsPage',
  '../views/UserDetailsView'
], function(
  t,
  user,
  DetailsPage,
  UserDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: UserDetailsView,

    breadcrumbs: function()
    {
      if (user.isAllowedTo('USERS:VIEW'))
      {
        return DetailsPage.prototype.breadcrumbs.call(this);
      }

      return [
        t.bound('users', 'BREADCRUMBS:account')
      ];
    }

  });
});
