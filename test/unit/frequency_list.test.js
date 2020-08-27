require('../mocks/DomInitHTML');
require('../mocks/localStorage');
require('../mocks/mediaDB');
require('../mocks/fmRadio');
require('../mocks/navigator/getDeviceStorage');
require('../mocks/navigator/hasFeature');
require('../mocks/navigator/mozAudioChannelManager');
require('../mocks/navigator/mozSettings');
require('../mocks/performance/mark');
require('../mocks/speaker');
require('../mocks/speakerManager');
require('../mocks/document');
require('../mocks/navigator/mozL10n');
import AudioChannelClient from '../mocks/audiochannnelClient';
global.AudioChannelClient = AudioChannelClient;

require('../../js/fm_radio');
require('../../js/fm_action');
require('../../js/frequency_dialer');
require('../../js/frequency_list');
require('../../js/focus_manager');
require('../../js/frequency_manager');
require('../../js/headphone_state');
require('../../js/stations_list');
require('../../js/satus_manager');
require('../../js/language_manage');

document.dir = DomInitHTML.dir;
document.body.innerHTML = DomInitHTML.innerHTML;
HeadphoneState.deviceWithValidAntenna = true;
FMRadio.airplaneModeEnabled = false;
Start.initialize();
FMAction.init();
FrequencyDialer.initDialerUI();
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
const frequencyList = [
  {
    favorite: false,
    frequency: 87.8,
    name: '87.8MHZ',
    station: true,
    stationTime: 1
  }, {
    favorite: false,
    frequency: 91.6,
    name: '交通广播',
    station: true,
    stationTime: 2
  }, {
    favorite: false,
    frequency: 93.1,
    name: '<span>shishi</span>',
    station: true,
    stationTime: 3
  }, {
    favorite: false,
    frequency: 98.8,
    name: 'MHZ',
    station: true,
    stationTime: 4
  }, {
    favorite: false,
    frequency: 101.8,
    name: '0',
    station: true,
    stationTime: 5
  }
];

test('Update current frequency list UI, favorite list UI, rename UI or stations list UI', () => {
  StatusManager.status = StatusManager.STATUS_STATIONS_SHOWING;
  FrequencyList.updateFrequencyListUI(frequencyList);
  expect(FMElementFrequencyListContainer.children.length).toBe(frequencyList.length);
  expect(FMElementFrequencyListContainer.children[0].id).toBe('frequency-87.8');
  expect(FMElementFrequencyListContainer.children[1].textContent.trim()).toBe('交通广播');
  expect(FMElementFrequencyListContainer.children[2].textContent.trim()).toBe('<span>shishi</span>');
});

test('Update favorite list UI', () => {
  FrequencyList.updateFavoriteListUI();
  expect(FMElementFrequencyListContainer.children.length).toBe(1);
});

test('Get the frequency of current frequency list item', () => {
  FrequencyList.updateFavoriteListUI();
  let element = FMElementFrequencyListContainer.children[0];
  let frequency = FrequencyList.getFrequencyByElement(element);
  expect(frequency).toBe(91.6);
});
