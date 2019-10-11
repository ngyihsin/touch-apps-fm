require('../mocks/DomInitHTML');
require('../mocks/localStorage');
require('../mocks/mediaDB');
require('../mocks/mozRadio');
require('../mocks/navigator/getDeviceStorage');
require('../mocks/navigator/hasFeature');
require('../mocks/navigator/mozAudioChannelManager');
require('../mocks/navigator/mozSettings');
require('../mocks/performance/mark');
require('../mocks/speaker');
require('../mocks/speakerManager');
require('../mocks/document');
require('../mocks/navigator/mozL10n');

require('../../js/fm_radio');
require('../../js/fm_action');
require('../../js/frequency_dialer');
require('../../js/frequency_list');
require('../../js/focus_manager');
require('../../js/frequency_manager');
require('../../js/headphone_state');
require('../../js/stations_list');
require('../../js/warning_ui');
require('../../js/satus_manager');
require('../../js/history_frequency');
require('../../js/language_manage');
require('../../js/dialog_helper');

document.dir = DomInitHTML.dir;
document.body.innerHTML = DomInitHTML.innerHTML;
HeadphoneState.deviceWithValidAntenna = true;
FMRadio.airplaneModeEnabled = false;
Start.initialize();
FMAction.init();
FrequencyDialer.initDialerUI();
const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
FrequencyManager.frequencyList = {
  "87.8": {
    favorite: false,
    frequency: 87.8,
    name: '87.8MHZ',
    station: true,
    stationTime: 1
  },
  "91.6": {
    favorite: true,
    frequency: 91.6,
    name: '交通广播',
    station: true,
    stationTime: 2
  },
  "93.1": {
    favorite: false,
    frequency: 93.1,
    name: '<span>shishi</span>',
    station: true,
    stationTime: 3
  }
};

test('Switch from station list UI to favorite list UI', () => {
  StatusManager.status = StatusManager.STATUS_STATIONS_SHOWING;
  StationsList.switchToFavoriteListUI();
  expect(FMElementFrequencyListUI.className).toBe('favorites-list');
  expect(StatusManager.status).toBe(StatusManager.STATUS_FAVORITE_SHOWING);
  expect(FMAction.action.classList.contains('hidden')).toBe(true);
  expect(FMAction.freDialer.classList.contains('hidden')).toBe(false);
  expect(document.getElementsByTagName('kai-categorybar')[0].selected).toBe('favorites');
  expect(FMElementFrequencyListContainer.children.length).toBe(1);
});


test('Switch from favorite list UI to station list UI', () => {
  StatusManager.status = StatusManager.STATUS_FAVORITE_SHOWING;
  StationsList.switchToStationListUI();
  expect(FMElementFrequencyListUI.className).toBe('stations-list');
  expect(StatusManager.status).toBe(StatusManager.STATUS_STATIONS_SHOWING);
  expect(FMAction.action.classList.contains('hidden')).toBe(false);
  expect(FMAction.freDialer.classList.contains('hidden')).toBe(true);
  expect(FMAction.stationAction.level).toBe('secondary');
  expect(FMAction.stationAction.getAttribute('data-l10n-id')).toBe('scan-stations');
  expect(document.getElementsByTagName('kai-categorybar')[0].selected).toBe('allstations');
  expect(FMElementFrequencyListContainer.children.length).toBe(3);
});

test('Start scan stations', () => {
  StatusManager.status = StatusManager.STATUS_STATIONS_SHOWING;
  StationsList.startScanStations();
  expect(FMElementFrequencyListUI.classList.contains('scanning')).toBe(true);
  expect(StatusManager.status).toBe(StatusManager.STATUS_STATIONS_SCANING);
  expect(FMAction.stationAction.getAttribute('data-l10n-id')).toBe('abort');
});

test('Add frequency scanned to stations list UI', () => {
  FrequencyManager.frequencyList = {};
  mozFMRadio.setFrequency(101);
  let object = {
    favorite: false,
    frequency: 101,
    name: '101.0',
    station: true,
    stationTime: 1
  };
  StationsList.addStationScanned(101);
  expect(FrequencyManager.frequencyList["101.0"].frequency).toBe(101);
  expect(FrequencyManager.frequencyList["101.0"].name).toBe(object.frequency.toFixed(1));
  expect(HistoryFrequency.historyFrequency).toBe(101);
  expect(FrequencyDialer.currentFreqency).toBe(101);
  expect(FMElementFrequencyDialer.textContent.trim()).toBe('101.0');
});
