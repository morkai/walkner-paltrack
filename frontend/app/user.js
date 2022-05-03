// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/broker',
  'app/socket',
  'app/core/util/embedded'
],
function(
  _,
  t,
  broker,
  socket,
  embedded
) {
  'use strict';

  var reloadLocks = [];
  var reloadLockI = 0;
  var user = {};

  socket.on('user.reload', function(userData)
  {
    if (userData.active === false)
    {
      window.location.reload();
    }

    user.reload(userData);
  });

  socket.on('user.deleted', function()
  {
    window.location.reload();
  });

  var guestUser = _.assign(window.GUEST_USER || {}, {
    name: t.bound('core', 'GUEST_USER_NAME')
  });

  delete window.GUEST_USER;

  user.idProperty = 'id';

  user.data = guestUser;

  user.lang = window.APP_LOCALE || window.appLocale || 'pl';

  user.noReload = false;

  user.isReloadLocked = function()
  {
    return reloadLocks.length > 0;
  };

  user.lockReload = function()
  {
    return reloadLocks.push(++reloadLockI);
  };

  user.unlockReload = function(lockI)
  {
    reloadLocks = reloadLocks.filter(function(i) { return i !== lockI; });
  };

  /**
   * @param {Object} userData
   */
  user.reload = function(userData)
  {
    if (!userData)
    {
      userData = {};
    }

    if (userData.loggedIn === false)
    {
      userData.name = t('core', 'GUEST_USER_NAME');
    }

    var a = _.omit(userData, ['privilegesMap', 'privilegesString']);
    var b = _.omit(user.data, ['privilegesMap', 'privilegesString']);

    if (_.isEqual(a, b))
    {
      return;
    }

    var wasLoggedIn = user.isLoggedIn();

    if (Object.keys(userData).length > 0)
    {
      user.data = userData;
    }

    user.data.privilegesMap = null;

    if (user.noReload)
    {
      user.noReload = false;
    }
    else
    {
      broker.publish('user.reloaded');
    }

    if (wasLoggedIn && !user.isLoggedIn())
    {
      broker.publish('user.loggedOut');
    }
    else if (!wasLoggedIn && user.isLoggedIn())
    {
      broker.publish('user.loggedIn');
    }
  };

  /**
   * @returns {boolean}
   */
  user.isLoggedIn = function()
  {
    return user.data.loggedIn === true;
  };

  /**
   * @param {boolean} [firstNameFirst]
   * @returns {string}
   */
  user.getLabel = function(firstNameFirst)
  {
    return user.resolveLabel(user.data, firstNameFirst);
  };

  user.resolveLabel = function(data, firstNameFirst)
  {
    if (data.name)
    {
      return String(data.name);
    }

    if (data.lastName && data.firstName)
    {
      if (data.lastName === data.firstName)
      {
        return data.lastName;
      }

      if (firstNameFirst)
      {
        return data.firstName + ' ' + data.lastName;
      }

      return data.lastName + ' ' + data.firstName;
    }

    return data.login;
  };

  /**
   * @returns {{id: string, label: string, ip: string, cname: string}}
   */
  user.getInfo = function()
  {
    var userInfo = {};

    userInfo[user.idProperty] = user.data._id;
    userInfo.ip = user.data.ip || user.data.ipAddress || '0.0.0.0';
    userInfo.cname = window.COMPUTERNAME;
    userInfo.label = user.getLabel();

    user.getInfo.decorators.forEach(function(decorate)
    {
      decorate(userInfo, user.data);
    });

    return userInfo;
  };

  user.getInfo.decorators = [];

  user.isAllowedTo = function(privilege)
  {
    if (user.data.active === false)
    {
      return false;
    }

    if (user.data.super)
    {
      return true;
    }

    var userPrivileges = user.data.privileges;

    if (!userPrivileges)
    {
      return false;
    }

    var args = Array.prototype.slice.call(arguments);
    var anyPrivileges = (args.length === 1 ? [privilege] : args).map(
      function(p) { return Array.isArray(p) ? p : [p]; }
    );

    var isLoggedIn = user.isLoggedIn();

    if (!anyPrivileges.length)
    {
      return isLoggedIn;
    }

    for (var i = 0, l = anyPrivileges.length; i < l; ++i)
    {
      var allPrivileges = anyPrivileges[i];
      var actualMatches = 0;
      var requiredMatches = allPrivileges.length;

      for (var ii = 0; ii < requiredMatches; ++ii)
      {
        var requiredPrivilege = allPrivileges[ii];
        var type = typeof requiredPrivilege;

        if (type === 'function')
        {
          actualMatches += requiredPrivilege() ? 1 : 0;
        }
        else if (type !== 'string')
        {
          requiredMatches -= 1;
        }
        else if (requiredPrivilege === 'USER')
        {
          actualMatches += isLoggedIn ? 1 : 0;
        }
        else if (requiredPrivilege === 'LOCAL')
        {
          actualMatches += user.data.local ? 1 : 0;
        }
        else if (requiredPrivilege === 'EMBEDDED')
        {
          actualMatches += embedded.isEnabled() ? 1 : 0;
        }
        else if (/^FN:/.test(requiredPrivilege))
        {
          var requiredFn = requiredPrivilege.substring(3);

          if (requiredFn.indexOf('*') !== -1)
          {
            var requiredFnRe = new RegExp('^' + requiredFn.replace(/\*/g, '.*?') + '$');

            actualMatches += requiredFnRe.test(user.data.prodFunction) ? 1 : 0;
          }
          else
          {
            actualMatches += user.data.prodFunction === requiredFn ? 1 : 0;
          }
        }
        else
        {
          actualMatches += user.hasPrivilege(allPrivileges[ii]) ? 1 : 0;
        }
      }

      if (actualMatches === requiredMatches)
      {
        return true;
      }
    }

    return false;
  };

  user.auth = function()
  {
    var anyPrivileges = Array.prototype.slice.call(arguments);

    return function(req, referer, next)
    {
      if (user.isAllowedTo.apply(user, anyPrivileges))
      {
        next();
      }
      else if (!user.isLoggedIn())
      {
        require(['app/viewport', 'app/users/pages/LogInFormPage'], function(viewport, LogInFormPage)
        {
          viewport.showPage(new LogInFormPage());
        });
      }
      else
      {
        require(['app/viewport', 'app/core/pages/ErrorPage'], function(viewport, ErrorPage)
        {
          viewport.showPage(new ErrorPage({
            model: {
              code: 403,
              req: req,
              previousUrl: referer
            }
          }));
        });
      }
    };
  };

  user.hasPrivilege = function(privilege)
  {
    if (!user.data.privilegesMap)
    {
      if (!Array.isArray(user.data.privileges))
      {
        user.data.privileges = [];
      }

      user.data.privilegesString = '|' + user.data.privileges.join('|');
      user.data.privilegesMap = {};

      _.forEach(user.data.privileges, function(privilege) { user.data.privilegesMap[privilege] = true; });
    }

    if (privilege.charAt(privilege.length - 1) === '*')
    {
      return user.data.privilegesString.indexOf('|' + privilege.substr(0, privilege.length - 1)) !== -1;
    }

    return user.data.privilegesMap[privilege] === true;
  };

  user.getGuestUserData = function()
  {
    return window.GUEST_USER || {
      id: null,
      login: 'guest',
      name: t.bound('core', 'GUEST_USER_NAME'),
      loggedIn: false,
      super: false,
      privileges: []
    };
  };

  user.getRootUserData = function()
  {
    return window.ROOT_USER || {
      id: null,
      login: 'root',
      name: 'root',
      loggedIn: true,
      super: true,
      privileges: []
    };
  };

  user.can = {

  };

  window.user = user;

  return user;
});
