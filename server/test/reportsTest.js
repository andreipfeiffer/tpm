(() => {
  "use strict";

  process.env.NODE_ENV = "test";

  var server = require("../../server.js"),
    request = require("supertest").agent(server.app),
    db = require("../modules/db"),
    utils = require("./_utils"),
    expect = require("expect.js");

  describe("Reports", () => {
    beforeEach(done => {
      db.createDb()
        .then(() => utils.authenticateUser(request))
        .then(res => {
          utils.setAuthData(res.body);
          done();
        });
    });

    afterEach(done => {
      db.dropDb().then(() => done());
    });

    // ok, this tests only 1 complex query
    // based on fixtures on projects & projects_status_log tables
    it("should return the report", done => {
      request
        .get("/reports")
        .set("authorization", utils.getAuthData().authToken)
        .end((err, res) => {
          expect(res.body).to.be.an("object");
          expect(res.body.byMonth).to.be.an("array");
          expect(res.body.totalByClient).to.be.an("array");
          expect(res.body.countsByClient).to.be.an("array");

          expect(res.body.byMonth[0]).to.have.property("month");
          expect(res.body.byMonth[0]).to.have.property("displayMonth");
          expect(res.body.byMonth[0]).to.have.property("count");
          expect(res.body.byMonth[0]).to.have.property("total");

          done();
        });
    });
  });
})();
