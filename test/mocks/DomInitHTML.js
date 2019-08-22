(function (exports) {
  let DomInitHTML = {
    dir: 'ltr',
    innerHTML:
      '<section>\
          <kai-header id="header" title="FAVORITES" type="large">\
            <i slot="header-right-slot" id="speaker-switch" class="hidden" data-l10n-id="speaker-switch"\
              data-icon="audio-output"></i>\
            <kai-switch id="power-switch" data-l10n-id="power-switch-on" slot="header-right-slot"></kai-switch>\
          </kai-header>\
          <div id="fm-container" dir="ltr" class="dim">\
            <div id="fm-header">\
              <div id="frequency-bar">\
                <div>\
                  <a aria-label="Seek Down" id="frequency-op-seekdown" href="#seekdown" data-icon="media-back"\
                    data-l10n-id="frequency-op-seekdown" role="button"></a>\
                </div>\
                <div id="frequency-display">\
                  87.5\
                  <span id="favorite-star" class="add-to-favorites" data-l10n-id="add-to-favorites"\
                    data-icon="favorite-off"></span>\
                </div>\
                <div>\
                  <a aria-label="Seek Up" id="frequency-op-seekup" href="#seekup" data-icon="media-forward"\
                    data-l10n-id="frequency-op-seekup" role="button"></a>\
                </div>\
              </div>\
              <div id="dialer-bar">\
                <div id="dialer-container" role="slider" aria-valuemin="87.5" aria-valuemax="108" aria-controls="frequency">\
                  <div id="frequency-indicator"></div>\
                  <div id="frequency-dialer" class="animation-on">\
                    <ul id="dialer-unit"></ul>\
                  </div>\
                </div>\
              </div>\
              <div id="action" class="hidden">\
                <kai-pillbutton id="station-action" data-l10n-id="scan-stations" text="" level="secondary">\
                </kai-pillbutton>\
              </div>\
            </div>\
            <div id="frequency-list" class="favorites-list">\
              <div id="frequency-list-container" class="p-pri" role="listbox" data-l10n-id="frequency-list-container">\
              </div>\
              <kai-loader id="myProgress" class="hidden"></kai-loader>\
              <div id="favoritelist-warning">\
                <div class="warning">\
                  <div id="favoritelist-warning-body" class="p warning-body">\
                  <div id="favoritelist-warning-header" data-l10n-id="noFavoritelistHeader"></div>\
                  <div>\
                    <span data-l10n-id="noFavoritelistMsg1"></span>\
                    <span data-icon="favorite-off"></span>\
                    <span data-l10n-id="noFavoritelistMsg2"></span>\
                  </div>\
                  </div>\
                </div>\
              </div>\
            </div>\
            <template id="frequency-list-template">\
              <div class="frequency-list-frequency" data-l10n-id="tab-frequency">\
              </div>\
              <i class="menu style-scope kai-1line-listitem" data-icon="menu" data-l10n-id="option-menu"></i>\
            </template>\
          </div>\
          <kai-categorybar id="fm-footer" class="dim" selected="favorites">\
          </kai-categorybar>\
          <div id="antenna-warning" class="warning" hidden="">\
            <div></div>\
            <div id="antenna-warning-body" class="warning-body" data-l10n-id="noAntennaMsg">Plugged in\
              headset to receive radio signals.</div>\
          </div>\
        </section>\
        <kai-dialog id="myDialog" class="hidden" title="" message="" primarybtntext="Enabled" secondarybtntext="Cancel">\
        </kai-dialog>\
        <div id="input-dialog" class="hidden">\
          <div id="input-content">\
            <div class="h3 title style-scope kai-dialog" data-l10n-id="save-rename">Rename Station</div>\
            <div id="input-field" class="subtilte-1 content style-scope kai-dialog">\
              <kai-textfield id="textfield" maxlength=20></kai-textfield>\
              <div>\
                <span id="input-num"></span>\
                /20\
              </div>\
            </div>\
            <div id="edit-button"  class="buttons style-scope kai-dialog">\
              <kai-pillbutton class="style-scope kai-dialog" text="CANCEL" level="secondary" data-l10n-id="cancel-rename">\
              </kai-pillbutton>\
              <kai-pillbutton class="style-scope kai-dialog" text="SAVE" data-l10n-id="save-rename"></kai-pillbutton>\
            </div>\
          </div>\
        </div>'
  };
  exports.DomInitHTML = DomInitHTML;
})(window);
