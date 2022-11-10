process.traceDeprecation = true;
const path = require("path");
const package_json = require("./package.json");
const patternslib_package_json = require("@patternslib/patternslib/package.json");
const mf_config = require("@patternslib/dev/webpack/webpack.mf");
const webpack_config = require("@patternslib/dev/webpack/webpack.config").config;

module.exports = () => {
    let config = {
        entry: {
            "bundle.min": path.resolve(__dirname, "src/index.js"),
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    tinymce_plugins: {
                        name: "tinymce_plugins",
                        test(module) {
                            // `module.resource` contains the absolute path of the file on disk.
                            const default_plugins = [
                                "fullscreen",
                                "hr",
                                "lists",
                                "media",
                                "nonbreaking",
                                "noneditable",
                                "pagebreak",
                                "paste",
                                "preview",
                                "print",
                                "searchreplace",
                                "tabfocus",
                                "table",
                                "visualchars",
                                "wordcount",
                                "code",
                            ];
                            let result = false;
                            if (!module.resource) {
                                return result;
                            }
                            if (!module.resource.includes("plugins")) {
                                return result;
                            }

                            for (const plugin of default_plugins) {
                                if (module.resource.includes(plugin)) {
                                    result = true;
                                }
                            }
                            return result;
                        },
                        chunks: "all",
                    },
                    tinymce: {
                        name: "tinymce",
                        test(module) {
                            // `module.resource` contains the absolute path of the file on disk.
                            // Note the usage of `path.sep` instead of / or \, for cross-platform compatibility.
                            return (
                                module.resource &&
                                module.resource.includes("node_modules") &&
                                module.resource.includes("tinymce") &&
                                !module.resource.includes("tinymce-i18n") &&
                                !module.resource.includes("plugins")
                            );
                        },
                        chunks: "all",
                    },
                    datatables: {
                        name: "datatables",
                        test: /[\\/]node_modules[\\/]datatables.net.*[\\/]/,
                        chunks: "all",
                    },
                    select2: {
                        name: "select2",
                        test: /[\\/]node_modules[\\/]select2.*[\\/]/,
                        chunks: "all",
                    },
                    jquery_plugins: {
                        name: "jquery_plugins",
                        test: /[\\/]node_modules[\\/]jquery\..*[\\/]/,
                        chunks: "all",
                    },
                },
            },
        },
    };

    config = webpack_config({
        config: config,
        package_json: package_json,
    });

    config.output.path = path.resolve(__dirname, "dist/");

    config.plugins.push(
        mf_config({
            name: "patternslib",
            filename: "remote.min.js",
            remote_entry: config.entry["bundle.min"],
            dependencies: {
                ...patternslib_package_json.dependencies,
                ...package_json.dependencies,
            },
            shared: {
                bootstrap: {
                    singleton: true,
                    requiredVersion: package_json.dependencies["bootstrap"],
                    eager: true,
                },
                jquery: {
                    singleton: true,
                    requiredVersion: package_json.dependencies["jquery"],
                    eager: true,
                },
            },
        })
    );

    if (process.env.NODE_ENV === "development") {
        // Note: ``publicPath`` is set to "auto" in Patternslib,
        //        so for the devServer the public path set to "/".
        config.devServer.port = "8000";
        config.devServer.static.directory = path.resolve(__dirname, "./docs/_site/");
    }

    if (process.env.DEPLOYMENT === "plone") {
        config.output.path = path.resolve(
            __dirname,
            "../plone.staticresources/src/plone/staticresources/static/bundle-plone/"
        );
    }

    //console.log(JSON.stringify(config, null, 4));

    return config;
};
