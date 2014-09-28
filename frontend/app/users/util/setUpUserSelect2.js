// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/i18n',
  'app/user'
], function(
  _,
  t,
  user
) {
  'use strict';

  function userToData(user)
  {
    if (user.id && user.text)
    {
      return user;
    }

    var name = user.lastName && user.firstName
      ? (user.lastName + ' ' + user.firstName)
      : (user.name || '-');

    return {
      id: user._id,
      text: name,
      user: user
    };
  }

  function getSystemData()
  {
    return {
      id: '$SYSTEM',
      text: t('users', 'select2:users:system'),
      user: null
    };
  }

  function getRootData()
  {
    var root = user.getRootUserData();

    return {
      id: root._id,
      text: root.name || root.login,
      user: root
    };
  }

  return function setUpUserSelect2($input, options)
  {
    $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('users', 'select2:placeholder'),
      ajax: {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          return '/users?sort(lastName)&limit(20)&regex(lastName,' + encodeURIComponent('^' + term.trim()) + ',i)';
        },
        results: function(data, page, query)
        {
          var results = [getSystemData(), getRootData()].filter(function(user)
          {
            return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1;
          });

          var users = results.concat(data.collection || []);

          if (options && options.userFilter)
          {
            users = users.filter(options.userFilter);
          }

          return {
            results: users.map(userToData).sort(function(a, b) { return a.text.localeCompare(b.text); })
          };
        }
      }
    }, options));

    var userId = $input.val();
    var rootData = getRootData();

    if (userId === rootData.id)
    {
      $input.select2('data', rootData);
    }
    else if (userId === '$SYSTEM')
    {
      $input.select2('data', getSystemData());
    }
    else if (userId && options.view)
    {
      var req = options.view.ajax({
        type: 'GET',
        url: '/users?_id=' + userId
      });

      req.done(function(res)
      {
        if (res.collection && res.collection.length)
        {
          $input.select2('data', userToData(res.collection[0]));

          if (options.onDataLoaded)
          {
            options.onDataLoaded();
          }
        }
      });
    }

    return $input;
  };
});
