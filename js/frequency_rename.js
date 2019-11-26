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

  // Switch current frequency list UI to rename mode UI
  FrequencyRename.prototype.switchToRenameModeUI = function () {

    /*
     * Remember status as previous status to update status again
     * after renamed
     */
    FMAction.optionMenu.open = false;
    // Update current status to update softkeys
    StatusManager.update(StatusManager.STATUS_FAVORITE_RENAMING);

    Dialog.showDialog(Dialog.renameStation,
      true, this.saveRename.bind(this), this.undoRename.bind(this));
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
