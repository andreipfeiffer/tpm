exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['public/spec-e2e/*Spec.js'],
	baseUrl: 'http://localhost:3000' //default test port with Yeoman
}