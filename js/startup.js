/* launch or quit fmradio */
'use strict';

(function() {
  const time = 300;
  window.mozFMRadio = navigator.mozFM || navigator.mozFMRadio;

  function initialize() {
    window.FMElementFMContainer = document.getElementById('fm-container');
    window.FMElementFrequencyBar = document.getElementById('frequency-bar');
    window.FMElementFrequencyDialer = document.getElementById('frequency');
    window.FMElementFrequencyListUI = document.getElementById('frequency-list');
    window.FMElementAirplaneModeWarning = document.getElementById('airplane-mode-warning');
    window.FMElementAntennaUnplugWarning = document.getElementById('antenna-warning');
    window.FMElementFavoriteListWarning = document.getElementById('favoritelist-warning');
    window.FMElementFrequencyListContainer = document.getElementById('frequency-list-container');
  }

  function lazyload() {
    setTimeout(() => {
      let lazyFiles = [
        '/shared/js/airplane_mode_helper.js',
        '/shared/elements/gaia-progress/dist/gaia-progress.js',
        '/shared/js/mediadb.js',
        'js/headphone_state.js',
        'js/fm_action.js',
        'js/history_frequency.js',
        'js/stations_list.js',
        'js/satus_manager.js',
        'js/frequency_manager.js',
        'js/frequency_dialer.js',
        'js/frequency_list.js',
        'js/warning_ui.js',
        'js/fm_radio.js'
      ];

      LazyLoader.load(lazyFiles, () => {
        initialize();
        FMRadio.init();
      });
    }, time);

    // PERFORMANCE EVENT (2): moz-chrome-interactive
    // Designates that the app's *core* chrome or navigation interface
    // has its events bound and is ready for user interaction.
    window.performance.mark('navigationInteractive');
    window.dispatchEvent(new CustomEvent('moz-chrome-interactive'));

    // PERFORMANCE EVENT (3): moz-app-visually-complete
    // Designates that the app is visually loaded (e.g.: all of the
    // 'above-the-fold' content exists in the DOM and is marked as
    // ready to be displayed).
    window.performance.mark('visuallyLoaded');
    window.dispatchEvent(new CustomEvent('moz-app-visually-complete'));

    // PERFORMANCE EVENT (4): moz-content-interactive
    // Designates that the app has its events bound for the minimum
    // set of functionality to allow the user to interact with the
    // 'above-the-fold' content.
    window.performance.mark('contentInteractive');
    window.dispatchEvent(new CustomEvent('moz-content-interactive'));
  }

  function unload() {
    FMRadio.disableFMRadio();
  }

  window.addEventListener('load', lazyload, false);
  window.addEventListener('unload', unload, false);
  window.performance.mark('navigationLoaded');
  window.dispatchEvent(new CustomEvent('moz-chrome-dom-loaded'));
})();