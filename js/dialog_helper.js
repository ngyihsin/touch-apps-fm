/* exported FMRadio */
'use strict';
(function (exports) {

  // Dialog Constructor
  const Dialog = {
    show: false,
    airplane: {
      title: window.api.l10n.get('airplaneModeHeader'),
      message: window.api.l10n.get('airplaneModeMsg'),
      primarybtntext: window.api.l10n.get('settings'),
      secondarybtntext: window.api.l10n.get('cancel')
    },
    firstInit: {
      title: window.api.l10n.get('scan-stations-header'),
      message: window.api.l10n.get('scan-stations-msg'),
      primarybtntext: window.api.l10n.get('scan'),
      secondarybtntext: window.api.l10n.get('cancel')
    },
    renameStation: {
      title: window.api.l10n.get('station-renamed'),
      message: null,
      primarybtntext: window.api.l10n.get('save'),
      secondarybtntext: window.api.l10n.get('cancel')
    },
    init: true,
    NAME_INPUT_MAX_LENGTH: 20,

    eventListener() {
      this.init = false;
      this.dialog.addEventListener('click', this.dialogBtnClick.bind(this));
    },

    dialogBtnClick(event) {
      const type = event.detail.type;
      if ('secondary' === type) {
        this.secondaryBtnCallback();
      } else if ('primary' === type) {
        this.primaryBtnCallback();
      }
    },

    showDialog(contents, userView, primaryBtnCallback, secondaryBtnCallback) {
      this.secondaryBtnCallback =
        secondaryBtnCallback ? secondaryBtnCallback : null;
      this.primaryBtnCallback =
        primaryBtnCallback ? primaryBtnCallback : null;
      this.userView = userView ? userView : null;
      this.contents = contents;
      if (!this.dialog) {
        let script = [
          'https://shared.local/elements/kai-pillbutton.js',
          'https://shared.local/elements/kai-dialog.js',
        ];
        LazyLoader.load(script,
          () => {
            FrequencyDialer.pillButtonLoad = true;
            this.createDialog(); 
          });
      } else {
        this.initDialog(); 
      }     
    },

    createDialog() {
      this.dialog = document.createElement('kai-dialog');
      document.body.appendChild(this.dialog);
      this.dialog.open = false;
      this.initDialog();
    },

    initDialog() {
      this.dialog.className = '';
      this.dialog.dialogtitle = this.contents.title;
      this.dialog.message = this.contents.message;
      this.dialog.primarybtntext = this.contents.primarybtntext;
      this.dialog.secondarybtntext = this.contents.secondarybtntext;
      this.dialog.primarybtndisabled = false;
      this.dialog.secondarybtndisabled = false;
      if (this.userView) {
        this.editInput = document.createElement('kai-textfield');
        this.editInput.maxlength = 20;
        this.editInput.slot = "custom-view";
        this.editInput.value = FrequencyRename.editValue;
        this.editValue = FrequencyRename.editValue;
        this.editInput.subtitle = FrequencyRename.editValue.length + '/' + 
          this.NAME_INPUT_MAX_LENGTH;
        this.editInput.setAttribute('class', '');
        this.dialog.appendChild(this.editInput);
        this.editInput.addEventListener('input',
          (e) => {
            this.editValue = e.detail.value;
            this.editInput.subtitle = this.editValue.length + '/' +
            this.NAME_INPUT_MAX_LENGTH;
          });
        this.editInput.addEventListener('clear',
          () => {
            this.editValue = null;            
            this.editInput.subtitle = 0 + '/' + this.NAME_INPUT_MAX_LENGTH;
          });
        setTimeout(() => {
          this.editInput.focus();
          this.editInput.select();
        });
      }
      if (this.init) {
        this.eventListener();
      }
      this.dialog.open = true;
    },

    hideDialog() {
      if (this.dialog) {
        if (this.userView) {
          this.dialog.removeChild(this.editInput);
        }
        this.dialog.removeEventListener('click', this.dialogBtnClick.bind(this));
        this.secondaryBtnCallback = null;
        this.userView = null;
        this.dialog ? this.dialog.open = false : ''; 
      }
    }
  };

  exports.Dialog = Dialog;
})(window);
