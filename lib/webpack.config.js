const Path = require("path")

module.exports = {
    entry: "./src/index.ts",
    mode: "production",
    experiments: {
        outputModule: true,
    },
    output: {
        path: Path.resolve(__dirname, "./dist"),
        filename: "index.js",
        library: {
            type: "module",
        },
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: false,
                            compiler: "ts-patch/compiler",
                        },
                    },
                ],
            },
            {
                test: /\.(vert|frag)$/i,
                // More information here https://webpack.js.org/guides/asset-modules/
                type: "asset/source",
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
        enforceExtension: false,
        alias: {
            "@": Path.resolve(__dirname, "src/"),
            "@tgd": Path.resolve(__dirname, "src/tgd/"),
        },
    },
}
