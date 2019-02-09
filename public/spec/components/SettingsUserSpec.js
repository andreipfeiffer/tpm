import "angular";
import "angular-mocks";
import "public/js/app";
import utils from "public/js/utils";

var defaultSettings = {
  currency: utils.currencyList[0]
};
var newSettings = {
  currency: "AAA",
  another: "BBB"
};

describe("SettingsUser", () => {
  beforeEach(angular.mock.module("tpm"));

  var SettingsUser;

  beforeEach(inject(_SettingsUser_ => {
    SettingsUser = _SettingsUser_;
    SettingsUser.remove();
  }));

  afterEach(() => {
    SettingsUser.remove();
  });

  /*it('should fetch() current Settings', () => {
        // this test is useless, there is nothing to test
    });*/

  it("should get default Settings", () => {
    expect(SettingsUser.get()).toEqual(defaultSettings);
  });

  it("should set new Settings", () => {
    SettingsUser.set(newSettings);
    expect(SettingsUser.get()).toEqual(newSettings);
  });

  it("should remove SettingsUser", () => {
    SettingsUser.set(newSettings);
    SettingsUser.remove();

    expect(SettingsUser.get()).toEqual(defaultSettings);
  });
});
