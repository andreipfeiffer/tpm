var app = require("../server.js"),
    expect = require("expect.js");

describe("server testing", function() {
    it("should work", function() {
        expect(typeof {}).to.be("object");
    });
});