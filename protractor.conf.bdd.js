// http://stackoverflow.com/questions/23785700/how-to-configure-protractor-to-use-cucumber
exports.config = {
  specs: ["features/*.feature"],

  capabilities: {
    browserName: "chrome"
  },

  baseUrl: "http://localhost:3000/",

  framework: "custom",
  frameworkPath: require.resolve("protractor-cucumber-framework"),
  cucumberOpts: {
    format: "pretty",
    require: ["features/support/*.js", "features/steps/*.js"]
  }
};
