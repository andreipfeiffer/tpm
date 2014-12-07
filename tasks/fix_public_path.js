module.exports = function(grunt) {
    grunt.registerTask('fix_public_path', function() {

        var resourcesFromDomMunger = grunt.config.get('dom_munger'),
            resources = {};

        resources.css = resourcesFromDomMunger.data.cssRefs.map(function(path) {
            if ( !path.match(/^bower/) ) {
                return 'public/' + path;
            }
            return path;
        });
        resources.js = resourcesFromDomMunger.data.jsRefs.map(function(path) {
            if ( !path.match(/^bower/) ) {
                return 'public/' + path;
            }
            return path;
        });

        grunt.config.set('resources', resources);

    });
};