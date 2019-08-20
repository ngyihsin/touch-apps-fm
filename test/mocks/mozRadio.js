(function (exports) {
  let mozFMRadio = function () {
    this.antennaAvailable = false;
    this.enabled = false;
    this.frequency = 97.8;
    this.frequencyLowerBound = 87.5;
    this.frequencyUpperBound = 108;
  };

  mozFMRadio.prototype.enable = function (frequency) {
    this.enabled = true;
    return jest.fn();
  };

  mozFMRadio.prototype.setFrequency = function (frequency) {
    this.frequency = frequency;
    return jest.fn();
  };

  mozFMRadio.prototype.seekUp = function () {
    return jest.fn();
  };

  mozFMRadio = new mozFMRadio();
  exports.mozFMRadio = mozFMRadio;
})(window);
