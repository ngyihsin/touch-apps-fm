/* exported Start */
'use strict';

(function (exports) {

  // Start Constructor
  let Start = function () {};
  Start.prototype.initialize = function () {
    window.FMElementFMContainer = document.getElementById('fm-container');
    window.FMElementFrequencyDialer = document.getElementById('frequency-header');
    window.FMElementFrequencyListUI = document.getElementById('frequency-list');
    window.FMElementAntennaUnplugWarning = document.getElementById('antenna-warning');
    window.FMElementFavoriteListWarning = document.getElementById('favoritelist-warning');
    window.FMElementFrequencyListContainer = document.getElementById('frequency-list-container');
    window.FMElementFrequencyListTemplate = document.getElementById('frequency-list-template');
    window.FMElementFMFooter = document.getElementById('fm-footer');
  };

  exports.Start = new Start();
})(window);

