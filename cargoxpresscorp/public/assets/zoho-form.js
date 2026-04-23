// zoho-form.js
// This file contains the JS that was originally embedded in the Zoho-generated form.
// Important: Zoho's remote register script expects certain callbacks/functions to exist on window.

(function () {
  'use strict';

  // --- Tooltip helper (kept for completeness)
  window.tooltipShow6513181000001131001 = function tooltipShow6513181000001131001(el) {
    var tooltip = el && el.nextElementSibling;
    if (!tooltip) return;
    var tooltipDisplay = tooltip.style.display;
    if (tooltipDisplay === 'none' || tooltipDisplay === '') {
      var allTooltip = document.getElementsByClassName('zcwf_tooltip_over');
      for (var i = 0; i < allTooltip.length; i++) {
        allTooltip[i].style.display = 'none';
      }
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  };

  // --- UI helpers used by inline onclick handlers in the HTML
  window.showHidePassword = function showHidePassword() {
    var element = document.getElementById('password');
    if (!element) return;
    var type = element.type;
    if (type === 'password') {
      element.type = 'text';
      var eye = document.getElementById('show-hide-password');
      if (eye) eye.classList.remove('hiddenMode');
    } else {
      element.type = 'password';
      var eye2 = document.getElementById('show-hide-password');
      if (eye2) eye2.classList.add('hiddenMode');
    }
  };

  window.changeBackground = function changeBackground(color) {
    document.body.style.backgroundColor = color;
    var form = document.getElementById('crmWebToEntityForm');
    if (form) form.style.background = color;
  };

  window.nextField = function nextField(current) {
    if (current && current.value !== undefined && current.value.trim() !== '') {
      if (current.nextElementSibling) current.nextElementSibling.focus();
    }
  };

  window.showLoader = function showLoader() {
    var el = document.getElementById('signup-loader');
    if (el) el.style.display = 'flex';
  };

  window.hideLoader = function hideLoader() {
    var el = document.getElementById('signup-loader');
    if (el) el.style.display = 'none';
  };

  // --- OTP helpers
  function handlePaste(e) {
    var clipboardData, pastedData;
    e.stopPropagation();
    e.preventDefault();
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text') || '';

    var otpArr = document.getElementsByClassName('cPT_input');
    for (var i = 0; i < otpArr.length; i++) {
      otpArr[i].value = pastedData.substr(i, 1);
    }
    var focusIdx = pastedData.length >= 7 ? 6 : pastedData.length;
    if (otpArr[focusIdx]) otpArr[focusIdx].focus();
  }

  function handlekeyPress(e) {
    // backspace/delete
    if (e.keyCode === 8 || e.keyCode === 46) {
      e.preventDefault();
      this.value = '';
      if (this.previousElementSibling) this.previousElementSibling.focus();
    }
  }

  function bindOtpEvents() {
    var otpArr = document.getElementsByClassName('cPT_input');
    for (var i = 0; i < otpArr.length; i++) {
      // avoid duplicating listeners
      otpArr[i].removeEventListener('paste', handlePaste);
      otpArr[i].removeEventListener('keydown', handlekeyPress);
      otpArr[i].addEventListener('paste', handlePaste);
      otpArr[i].addEventListener('keydown', handlekeyPress);
    }
  }

  window.removeResendClass = function removeResendClass() {
    var el = document.getElementById('resendotp');
    if (el) el.classList.remove('resend_timer');
  };

  window.getAllFormInputJson = function getAllFormInputJson() {
    var inputs = document.querySelectorAll('input,select,textarea');
    var paramsJson = {};
    for (var i = 0; i < inputs.length; i++) {
      var fieldlabel = '';
      if (inputs[i].name !== '' && !inputs[i].name.includes('password')) {
        fieldlabel = inputs[i].getAttribute('crmlabel') !== null ? inputs[i].getAttribute('crmlabel') : inputs[i].name;
        if (fieldlabel.startsWith('c_')) {
          fieldlabel = fieldlabel.replace(/c_/i, '');
        }

        if (inputs[i].tagName === 'SELECT') {
          var selected = '';
          for (var j = 0; j < inputs[i].options.length; j++) {
            var option = inputs[i].options[j];
            if (option.selected) selected += option.value + ';';
          }
          selected = selected.replace(/;([^;]*)$/, '$1');
          paramsJson[fieldlabel] = selected;
        } else if (inputs[i].type === 'checkbox' && inputs[i].checked === false) {
          paramsJson[fieldlabel] = '';
        } else {
          paramsJson[fieldlabel] = inputs[i].value;
        }
      }
    }
    return { form_data: [paramsJson] };
  };

  window.populateOtpValue = function populateOtpValue() {
    window.showLoader();
    var otpBtn = document.getElementsByName('otpfield')[0];
    if (otpBtn) otpBtn.disabled = true;

    var otpInputList = document.getElementsByClassName('cPT_input');
    var otpValue = '';
    for (var i = 0; i < otpInputList.length; i++) {
      otpValue += otpInputList[i].value;
    }

    var otpHidden = document.getElementById('otpfield');
    if (otpHidden) otpHidden.value = otpValue;

    // validateFormData is ours; validateOTP is expected to be provided by Zoho's register script.
    var isValid = window.validateFormData();
    if (isValid === true && typeof window.validateOTP === 'function') {
      window.validateOTP();
    }
  };

  // --- Server-side validation call (kept same endpoints)
  window.validateFormData = function validateFormData() {
    var valid = true;
    var errorMsg = {};
    var formData = window.getAllFormInputJson();
    var formErrorDom = document.getElementById('form_sub_err');
    if (formErrorDom && formErrorDom.style.display === 'block') {
      formErrorDom.style.display = 'none';
    }

    $.ajax({
      type: 'POST',
      url: 'https://crm.cargoxpresscorp.com/crm/v6/settings/portals/CargoXpressWorldCorp/actions/validate_form_data',
      dataType: 'json',
      async: false,
      data: JSON.stringify(formData),
      headers: { 'X-CRM-ORG': '870837918', 'X-ZOHO-SERVICE': 'crm' },
      error: function (resp) {
        valid = false;

        // Defensive parsing
        var code = resp && resp.responseJSON && resp.responseJSON.code;
        if (code === 'FEATURE_NOT_ENABLED' || code === 'CANNOT_PROCESS' || code === 'WAITING_STATE_LIMIT_EXCEEDED') {
          var portalStatus = code === 'CANNOT_PROCESS' ? 'portalFormAvailable' : 'portalFormStatus';
          window.location.replace(
            window.location.origin +
              '/portal/CargoXpressWorldCorp/crm/PortalErrorPage.sas?' +
              portalStatus +
              '=false&rid=493a75de338ce1fd49c64d9a2120872546f703651422b66f1360fc6b9dc1ab88545b8f8769acec505dcc27886832dfebgid26b0f108c23c6a0804035c52400a52236f0cf15835f172567b881e55514dc67f'
          );
        } else if (code === 'MANDATORY_NOT_FOUND') {
          if (formErrorDom) formErrorDom.style.display = 'block';
        } else {
          var errorArr = (resp && resp.responseJSON && resp.responseJSON.details && resp.responseJSON.details.errors) || [];
          for (var i = 0; i < errorArr.length; i++) {
            var fieldlabel = errorArr[i].details && errorArr[i].details.api_name;
            if (!fieldlabel) continue;
            if (!fieldlabel.includes('email')) {
              fieldlabel = 'x_' + fieldlabel;
              errorMsg[fieldlabel] = errorArr[i].message;
            } else if (window.Form && window.Form.Message && typeof window.Form.Message.error === 'function') {
              window.Form.Message.error('email', errorArr[i].message);
            }
          }
        }
      }
    });

    if (!$.isEmptyObject(errorMsg)) {
      // Show field errors via jQuery Validate if present
      var validator = $('#signupform').data('validator') || $('#signupform').validate();
      validator.showErrors(errorMsg);
    }

    return valid;
  };

  // --- This is the callback Zoho's register script calls when it's ready.
  window.onSignupReady = function onSignupReady() {
    // Ensure OTP listeners exist (OTP inputs are in DOM even when hidden)
    bindOtpEvents();

    // Custom required method
    $.validator.addMethod('required', function (g, e) {
      return e && e.value !== '';
    });

    $('#signupform').zaSignUp({
      x_signup: { captcha_required: true },
      validator: {
        rules: {
          c_First_Name: { required: true },
          c_Last_Name: { required: true },
          c_Phone: { required: true },
          c_Mailing_Street: { required: true },
          c_Mailing_City: { required: true },
          c_Mailing_Country: { required: true }
        },
        messages: {
          c_First_Name: { required: 'Escriba el Nombre' },
          c_Last_Name: { required: 'Escriba el Apellidos' },
          c_Phone: { required: 'Escriba el Tel\xE9fono' },
          c_Mailing_Street: { required: 'Escriba el Domicilio\x20para\x20correspondencia' },
          c_Mailing_City: { required: 'Escriba el Ciudad\x20para\x20correspondencia' },
          c_Mailing_Country: { required: 'Escriba el Pa\xEDs\x20para\x20correspondencia' }
        }
      },
      onsubmit: function () {
        return window.validateFormData();
      },
      handleSignuptracking: function (data) {
        var csrf = '';
        var cookieArray = document.cookie.split(';');
        for (var i = 0; i < cookieArray.length; i++) {
          if (cookieArray[i].includes('crmcsr')) {
            csrf = cookieArray[i].split('=')[1];
          }
        }

        var formData = window.getAllFormInputJson();
        formData.form_data[0]['enVpZA=='] = data.zuid;

        $.ajax({
          type: 'POST',
          url: 'https://crm.cargoxpresscorp.com/crm/v6/settings/portals/CargoXpressWorldCorp/actions/submit_form_data',
          data: JSON.stringify(formData),
          headers: {
            'X-ZCSRF-TOKEN': 'crmcsrfparam=' + csrf,
            'X-CRMPORTAL': 'CargoXpressWorldCorp',
            'X-CRM-ORG': '870837918',
            'X-ZOHO-SERVICE': 'crm'
          },
          async: false
        });
      },
      oncomplete: function (state) {
        if (state === $.fn.zaSignUp.SIGNUP_STATE.ACCOUNT_CREATED) {
          window.showLoader();
        }
        if (state === $.fn.zaSignUp.SIGNUP_STATE.OTP_ERROR) {
          window.hideLoader();
        }
        if (state === $.fn.zaSignUp.SIGNUP_STATE.OTP_INITIATED) {
          // Clear OTP boxes and ensure listeners
          var otpElements = document.getElementsByClassName('cPT_input');
          for (var i = 0; i < otpElements.length; i++) {
            otpElements[i].value = '';
          }
          bindOtpEvents();
          window.changeBackground('#edf0f4');
        }
        if (state === $.fn.zaSignUp.SIGNUP_STATE.OTP_ERROR || state === $.fn.zaSignUp.SIGNUP_STATE.ERROR) {
          var btn = document.getElementsByName('otpfield')[0];
          if (btn) btn.disabled = false;
        }
      }
    });
  };

  // Bind OTP events on initial load as well
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindOtpEvents);
  } else {
    bindOtpEvents();
  }
})();
