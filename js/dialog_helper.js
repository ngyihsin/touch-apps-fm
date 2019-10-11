/* exported FMRadio */
'use strict';
(function (exports) {

  // Dialog Constructor
  const Dialog = {
    show: false,
    airplane: {
      title: navigator.mozL10n.get('airplaneModeHeader'),
      message: navigator.mozL10n.get('airplaneModeMsg'),
      primarybtntext: navigator.mozL10n.get('settings'),
      secondarybtntext: navigator.mozL10n.get('cancel')
    },
    firstInit: {
      title: navigator.mozL10n.get('scan-stations-header'),
      message: navigator.mozL10n.get('scan-stations-msg'),
      primarybtntext: navigator.mozL10n.get('scan'),
      secondarybtntext: navigator.mozL10n.get('cancel')
    },
    renameStation: {
      title: navigator.mozL10n.get('station-renamed'),
      message: null,
      primarybtntext: navigator.mozL10n.get('save'),
      secondarybtntext: navigator.mozL10n.get('cancel')
    },
    dialog: document.querySelector('kai-dialog'),
    editInput: document.getElementById('textfield'),
    init: true,

    eventListener() {
      this.init = false;
      document.addEventListener('dialogSecondaryBtnClick',
        () => {
          this.secondaryBtnCallback();
        });
      document.addEventListener('dialogPrimaryBtnClick',
        () => {
          this.primaryBtnCallback();
        });
    },

    showDialog(contents, userView, primaryBtnCallback, secondaryBtnCallback) {
      this.secondaryBtnCallback =
        secondaryBtnCallback ? secondaryBtnCallback : null;
      this.primaryBtnCallback =
        primaryBtnCallback ? primaryBtnCallback : null;
      this.userView = userView ? userView : null;
      this.contents = contents;
      this.initDialog();
      if (this.init) {
        this.eventListener();
      }
    },

    initDialog() {
      this.dialog.className = '';
      this.dialog.title = this.contents.title;
      this.dialog.message = this.contents.message;
      this.dialog.primarybtntext = this.contents.primarybtntext;
      this.dialog.secondarybtntext = this.contents.secondarybtntext;
      this.dialog.primarybtndisabled = false;
      this.dialog.secondarybtndisabled = false;
      if (this.userView) {
        this.editInput.value = FrequencyRename.editValue;
        this.editInput.subtitle = FrequencyRename.editValue.length + '/20';
        this.editInput.setAttribute('class', '');
        document.addEventListener('input', (e) => {
          this.editValue = e.target.value;
          this.editInput.subtitle = this.editValue.length + '/20';
        });
      }
      this.dialog.open = true;
    },

    hideDialog() {
      if (this.userView) {
        this.editInput.setAttribute('class', 'hidden');
      }
      document.removeEventListener('dialogSecondaryBtnClick',
        () => {
          this.secondaryBtnCallback();
        });
      document.removeEventListener('dialogPrimaryBtnClick',
        () => {
          this.primaryBtnCallback();
        });
      this.secondaryBtnCallback = null;
      this.userView = null;
      this.dialog.open = false;
    }
  };

  exports.Dialog = Dialog;
})(window);
