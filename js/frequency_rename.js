/* exported FrequencyRename */
'use strict';

(function (exports) {

  /*
   * FrequencyRename Constructor
   * FrequencyRename will be loaded only while station will be renamed
   */
  const FrequencyRename = function () {
    this.previousStatus = null;
    this.editValue = null;
    this.frequencyToRenameElement = null;
  };

  FrequencyRename.prototype.init = function (frequencyToRenameElement, editValue) {
    this.previousStatus = StatusManager.status;
    this.editValue = editValue;
    this.frequencyToRenameElement = frequencyToRenameElement;
    if (!this.optionMenu) {
      let popmenu = document.createElement('kai-popupmenu');
      popmenu.open = true;
      popmenu.options = [{ "label": LanguageManager.rename, "value": "rename" }];
      document.querySelector('section').appendChild(popmenu);
      this.optionMenu = document.querySelector('kai-popupmenu');
      this.optionMenu.addEventListener('select',
        () => {
          this.switchToRenameModeUI();
        });
    } else {
      this.optionMenu.open = true;
    }
  };

  // Switch current frequency list UI to rename mode UI
  FrequencyRename.prototype.switchToRenameModeUI = function () {

    /*
     * Remember status as previous status to update status again
     * after renamed
     */
    this.optionMenu.open = false;
    // Update current status to update softkeys
    StatusManager.update(StatusManager.STATUS_FAVORITE_RENAMING);

    Dialog.showDialog(Dialog.renameStation,
      true,
      this.saveRename.bind(this),
      this.undoRename.bind(this));
  };

  // Cancel current rename operation
  FrequencyRename.prototype.undoRename = function () {
    StatusManager.update(this.previousStatus);
    Dialog.hideDialog();
  };

  // Save the renamed station name
  FrequencyRename.prototype.saveRename = function () {
    // Get renamed frequency name from input UI
    let frequencyName = Dialog.editValue;
    let frequency = FrequencyList.getFrequencyByElement(this.frequencyToRenameElement);
    if (!frequencyName || frequencyName.trim().length < 1) {
      frequencyName = frequency.toFixed(1);
    }

    // Update renamed frequency name to data base
    FrequencyManager.updateFrequencyName(frequency, frequencyName);

    // Update renamed frequency name to UI
    FrequencyDialer.update();
    this.undoRename();
    StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING
      ? FrequencyList.updateFavoriteListUI() : FrequencyList.updateStationsListUI();
  };

  exports.FrequencyRename = new FrequencyRename();
})(window);
