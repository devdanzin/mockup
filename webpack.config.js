process.traceDeprecation = true;
const path = require("path");
const patternslib_config = require("@patternslib/patternslib/webpack/webpack.config");
const svelte_config = require("@patternslib/pat-content-browser/webpack.svelte");

module.exports = async (env, argv, build_dirname = __dirname) => {
    let config = {
        entry: {
            "bundle.min": path.resolve(__dirname, "src/index.js"),
        },
        externals: {
            window: "window",
            $: 'jquery',
            jquery: 'jQuery',
            "window.jquery": 'jQuery',
        },
    };

    config = svelte_config(env, argv, patternslib_config(env, argv, config, ["mockup"]));
    config.output.path = path.resolve(__dirname, "dist/");

    if (process.env.NODE_ENV === "development") {
        // Note: ``publicPath`` is set to "auto" in Patternslib,
        //        so for the devServer the public path set to "/".
        config.devServer.port = "8000";
        config.devServer.static.directory = path.resolve(__dirname, "./docs/_site/");
    }

    if (env && env.DEPLOYMENT === "plone") {
        config.output.path = path.resolve(
            build_dirname,
            "../plone.staticresources/src/plone/staticresources/static/bundle-plone/"
        );
    }

    return config;
};
