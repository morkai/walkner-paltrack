// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/ZeroClipboard',
  'app/i18n',
  'app/user',
  'app/core/Model',
  'app/core/views/FormView',
  'app/data/privileges',
  'app/data/partners',
  'app/users/templates/form'
], function(
  _,
  ZeroClipboard,
  t,
  user,
  Model,
  FormView,
  privileges,
  partners,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'userForm',

    events: {
      'submit': 'submitForm',
      'input input[type="password"]': function(e)
      {
        if (this.timers.validatePasswords !== null)
        {
          clearTimeout(this.timers.validatePasswords);
        }

        this.timers.validatePasswords = setTimeout(this.validatePasswords.bind(this, e), 100);
      }
    },

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.accountMode = this.options.editMode
        && user.data._id === this.model.id
        && !user.isAllowedTo('USERS:MANAGE');
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');

      if (this.privilegesCopyClient)
      {
        this.privilegesCopyClient.destroy();
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.options.editMode)
      {
        this.$('input[type="password"]').attr('required', true);
      }

      if (!this.accountMode)
      {
        this.$id('partner').select2({
          width: '100%',
          allowClear: true
        });

        this.setUpPrivilegesControls();
      }
    },

    setUpPrivilegesControls: function()
    {
      var privilegeMap = {};
      var privilegeList = [];

      privileges.forEach(function(privilege)
      {
        var tag = t('users', 'PRIVILEGE:' + privilege);

        privilegeMap[tag] = privilege;
        privilegeList.push({
          id: privilege,
          text: tag
        });
      });

      var $privileges = this.$id('privileges').select2({
        width: '100%',
        allowClear: false,
        tags: privilegeList,
        tokenSeparators: [';'],
        createSearchChoice: function(term)
        {
          var tag = term.trim();
          var privilege = privilegeMap[tag];

          return !privilege ? null : {
            id: privilege,
            text: tag
          };
        }
      });

      this.privilegesCopyClient = new ZeroClipboard(this.$id('copyPrivileges'));

      this.privilegesCopyClient.on('load', function(client)
      {
        client.on('datarequested', function(client)
        {
          var selectedOptions = $privileges.select2('data');

          if (selectedOptions.length === 0)
          {
            client.setText('');
          }
          else
          {
            client.setText(
              selectedOptions.map(function(data) { return data.text; }).join(';') + ';'
            );
          }
        });
      } );

      this.privilegesCopyClient.on('wrongflash noflash', function()
      {
        ZeroClipboard.destroy();
      });
    },

    validatePasswords: function()
    {
      var $password1 = this.$id('password');
      var $password2 = this.$id('password2');

      if ($password1.val() === $password2.val())
      {
        $password2[0].setCustomValidity('');
      }
      else
      {
        $password2[0].setCustomValidity(t('users', 'FORM:ERROR:passwordMismatch'));
      }

      this.timers.validatePassword = null;
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        partners: partners.toJSON(),
        privileges: privileges,
        accountMode: this.accountMode
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.privileges = formData.privileges.join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData = _.defaults(formData, {
        privileges: []
      });

      if (typeof formData.privileges === 'string')
      {
        formData.privileges = formData.privileges.split(',');
      }

      if (!formData.partner || !formData.partner.length)
      {
        formData.partner = null;
      }

      return formData;
    },

    handleFailure: function(jqXhr)
    {
      var json = jqXhr.responseJSON;
      var error = json && json.error && json.error.message;

      if (t.has('users', 'FORM:ERROR:' + error))
      {
        return this.showErrorMessage(t('users', 'FORM:ERROR:' + error));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
