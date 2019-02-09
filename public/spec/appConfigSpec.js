import config from "public/js/appConfig";

describe("appConfig", () => {
  it("should get the default apiUrl", () => {
    expect(config.getApiUrl()).toEqual("http://localhost:3000/");
  });

  it('should set the apiUrl, when passing "localhost"', () => {
    config.setApiUrl("localhost", 3333);
    expect(config.getApiUrl()).toEqual("http://localhost:3333/");
  });

  it('should set the apiUrl, when passing local network like "192.168.*.*"', () => {
    config.setApiUrl("192.168.1.2", 3333);
    expect(config.getApiUrl()).toEqual("http://192.168.1.2:3333/");
  });

  it('should set the apiUrl, when PhantomJS passes "server"', () => {
    config.setApiUrl("server", 80);
    expect(config.getApiUrl()).toEqual("http://server:80/");
  });

  it("should set the production apiUrl, when passing an unknown host", () => {
    config.setApiUrl("other-server", 80);
    expect(config.getApiUrl()).toEqual("http://tpm.upsidedown.ro/");
  });
});
