module.exports = (grunt) => {
    grunt.registerTask('fix_public_path', () => {

        var distUrl = grunt.config.get('distUrl'),
            resourcesFromDomMunger = grunt.config.get('dom_munger'),
            resources = {};

        if ( !resourcesFromDomMunger || !resourcesFromDomMunger.data ) {
            return;
        }

        if ( resourcesFromDomMunger.data.cssRefs ) {
            resources.css = resourcesFromDomMunger.data.cssRefs.map((path) => {
                if ( !path.match(/^bower/) ) {
                    // css files are NOT pre-processed, so they are in public
                    // return 'public/' + path;
                }
                return path;
            });
        }

        if ( resourcesFromDomMunger.data.jsRefs ) {
            resources.js = resourcesFromDomMunger.data.jsRefs.map((path) => {
                if ( !path.match(/^bower/) ) {
                    // js files are pre-processed, so they are not in public
                    return distUrl.dev + '/' + path;
                }
                return path;
            });
        }

        grunt.config.set('resources', resources);

    });
};