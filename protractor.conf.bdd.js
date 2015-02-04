// http://stackoverflow.com/questions/23785700/how-to-configure-protractor-to-use-cucumber
exports.config = {
    specs: [
        'features/*.feature'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:3000/',

    framework: 'cucumber',
    cucumberOpts: {
        format: 'pretty'
    }
};