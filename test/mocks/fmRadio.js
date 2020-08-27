(function (exports) {
  let fmRadio = function () {
    this.antennaAvailable = false;
    this.enabled = false;
    this.frequency = 97.8;
    this.frequencyLowerBound = 87.5;
    this.frequencyUpperBound = 108;
  };

  fmRadio.prototype.enable = function (frequency) {
    this.enabled = true;
    return jest.fn();
  };

  fmRadio.prototype.setFrequency = function (frequency) {
    this.frequency = frequency;
    return jest.fn();
  };

  fmRadio.prototype.seekUp = function () {
    return jest.fn();
  };

  fmRadio = new fmRadio();
  exports.fmRadio = fmRadio;
})(window);
