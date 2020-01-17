/* Launch or quit fmradio */
'use strict';

(function () {
  const time = 300;
  window.mozFMRadio = navigator.mozFM || navigator.mozFMRadio;

  function initialize() {
    window.FMElementFMContainer = document.getElementById('fm-container');
    window.FMElementHeader = document.getElementById('header');
    window.FMElementFrequencyDialer = document.getElementById('frequency-display');
    window.FMElementFrequencyListUI = document.getElementById('frequency-list');
    window.FMElementFavoriteListWarning = document.getElementById('favoritelist-warning');
    window.FMElementFrequencyListContainer = document.getElementById('frequency-list-container');
    window.FMElementFrequencyListTemplate = document.getElementById('frequency-list-template');
    window.FMElementFMFooter = document.querySelector('kai-categorybar');
    window.FMPowerKey = document.getElementById('power-switch');
    window.FMspeakSwitch = document.getElementById('speaker-switch');
  }

  if (navigator.mozAudioChannelManager.headphones ||
      mozFMRadio.antennaAvailable) {
    FMCacheRestore.hydrateHtml('fm-container');
  } else {
    document.getElementById('fm-container').classList.add('hidden');
    document.querySelector('kai-categorybar').classList.add('hidden');
    document.getElementById('power-switch').classList.add('hidden');
  }

  navigator.mozL10n.ready(() => {
    LanguageManager.init();
    if (navigator.mozAudioChannelManager.headphones ||
      mozFMRadio.antennaAvailable) {
      LanguageManager.updateLanguage();
    }
  });

  // Change volumeControlChannel to content
  navigator.mozAudioChannelManager.volumeControlChannel = 'content';

  // Toggle the large-text. changed big to small then to big. so change text should executed earlier
  document.body.classList.toggle('large-text', navigator.largeTextEnabled);
  window.addEventListener('largetextenabledchanged',
    () => {
      document.body.classList.toggle('large-text', navigator.largeTextEnabled);
    });

  function lazyload() {
    setTimeout(() => {
      let lazyFiles = [
        'shared/js/airplane_mode_helper.js',
        'js/speaker_state.js',
        'js/headphone_state.js',
        'js/fm_action.js',
        'js/history_frequency.js',
        'js/stations_list.js',
        'js/frequency_manager.js',
        'js/frequency_dialer.js',
        'js/frequency_list.js',
        'js/fm_radio.js',
        'js/focus_manager.js',
        'js/dialog_helper.js',
      ];

      LazyLoader.load(lazyFiles,
        () => {
          initialize();
          HeadphoneState.init(() => {
            if (!HeadphoneState.deviceWithValidAntenna) {

              /*
               * PERFORMANCE EVENT (3): moz-app-visually-complete
               * Designates that the app is visually loaded (e.g.: all of the
               * 'above-the-fold' content exists in the DOM and is marked as
               * ready to be displayed).
               */
              window.performance.mark('visuallyLoaded');
              window.dispatchEvent(new CustomEvent('moz-app-visually-complete'));
          
              /*
               * PERFORMANCE EVENT (4): moz-content-interactive
               * Designates that the app has its events bound for the minimum
               * set of functionality to allow the user to interact with the
               * 'above-the-fold' content.
               */
              window.performance.mark('contentInteractive');
              window.dispatchEvent(new CustomEvent('moz-content-interactive'));
            }
            FMRadio.init();
          });
        });
    }, time);

    /*
     * PERFORMANCE EVENT (2): moz-chrome-interactive
     * Designates that the app's *core* chrome or navigation interface
     * has its events bound and is ready for user interaction.
     */
    window.performance.mark('navigationInteractive');
    window.dispatchEvent(new CustomEvent('moz-chrome-interactive'));
    if (navigator.mozAudioChannelManager.headphones ||
      mozFMRadio.antennaAvailable) {
      
      /*
       * PERFORMANCE EVENT (3): moz-app-visually-complete
       * Designates that the app is visually loaded (e.g.: all of the
       * 'above-the-fold' content exists in the DOM and is marked as
       * ready to be displayed).
       */
      window.performance.mark('visuallyLoaded');
      window.dispatchEvent(new CustomEvent('moz-app-visually-complete'));

      /*
       * PERFORMANCE EVENT (4): moz-content-interactive
       * Designates that the app has its events bound for the minimum
       * set of functionality to allow the user to interact with the
       * 'above-the-fold' content.
       */
      window.performance.mark('contentInteractive');
      window.dispatchEvent(new CustomEvent('moz-content-interactive'));
    }
  }

  function unload() {
    FMRadio.disableFMRadio();
  }

  window.addEventListener('load', lazyload, false);
  window.addEventListener('unload', unload, false);
  window.performance.mark('navigationLoaded');
  window.dispatchEvent(new CustomEvent('moz-chrome-dom-loaded'));
})();
