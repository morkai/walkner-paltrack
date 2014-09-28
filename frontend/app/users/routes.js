// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './User',
  './UserCollection',
  'i18n!app/nls/users'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  User,
  UserCollection
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/users', canView, function(req)
  {
    viewport.loadPage(['app/users/pages/UserListPage'], function(UserListPage)
    {
      return new UserListPage({
        collection: new UserCollection(null, {
          rqlQuery: req.rql
        })
      });
    });
  });

  router.map(
    '/users/:id',
    function(req, referer, next)
    {
      if (req.params.id === user.data._id)
      {
        next();
      }
      else
      {
        canView(req, referer, next);
      }
    },
    function(req)
    {
      viewport.loadPage(['app/users/pages/UserDetailsPage'], function(UserDetailsPage)
      {
        return new UserDetailsPage({
          model: new User({_id: req.params.id})
        });
      });
    }
  );

  router.map('/users;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/users/views/UserFormView'],
      function(AddFormPage, UserFormView)
      {
        return new AddFormPage({
          FormView: UserFormView,
          model: new User()
        });
      }
    );
  });

  router.map('/users/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/users/views/UserFormView'],
      function(EditFormPage, UserFormView)
      {
        return new EditFormPage({
          FormView: UserFormView,
          model: new User({_id: req.params.id})
        });
      }
    );
  });

  router.map('/users/:id;delete', canManage, showDeleteFormPage.bind(null, User));
});
