module.exports = function(grunt) {
    grunt.registerTask('fix_public_path', function() {

        var distUrl = grunt.config.get('distUrl'),
            resourcesFromDomMunger = grunt.config.get('dom_munger'),
            resources = {};

        resources.css = resourcesFromDomMunger.data.cssRefs.map(function(path) {
            if ( !path.match(/^bower/) ) {
                // css files are NOT pre-processed, so they are in public
                return 'public/' + path;
            }
            return path;
        });
        resources.js = resourcesFromDomMunger.data.jsRefs.map(function(path) {
            if ( !path.match(/^bower/) ) {
                // js files are pre-processed, so they are not in public
                return distUrl.dev + '/' + path;
            }
            return path;
        });

        grunt.config.set('resources', resources);

    });
};