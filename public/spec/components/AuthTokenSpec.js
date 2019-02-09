import "angular";
import "angular-mocks";
import "public/js/app";

var getAuthHeader = $http => $http.defaults.headers.common["Authorization"];

describe("AuthToken", () => {
  beforeEach(angular.mock.module("tpm"));

  var AuthToken;

  beforeEach(inject(_AuthToken_ => {
    AuthToken = _AuthToken_;
  }));

  afterEach(() => {
    AuthToken.remove();
  });

  it("should get() default null AuthToken", () => {
    expect(AuthToken.get()).toBeNull();
  });

  it("should set() AuthToken", inject($http => {
    const TOKEN = "myAuthTokenValue";
    AuthToken.set(TOKEN);

    expect(getAuthHeader($http)).toEqual(TOKEN);
    expect(AuthToken.get()).toEqual(TOKEN);
  }));

  it("should remove() AuthToken", inject($http => {
    AuthToken.set("toBeRemoved");
    AuthToken.remove();

    expect(getAuthHeader($http)).toEqual("");
    expect(AuthToken.get()).toBeNull();
  }));
});
