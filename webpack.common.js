// webpack.common.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = [
    {
        name: "client",
        entry: "./src/client/index.js",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "client.js",
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-env",
                                "@babel/preset-react",
                            ],
                        },
                    },
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./public/index.html",
                filename: "./public/index.html",
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.join(__dirname, "public"),
                        to: "public",
                        globOptions: {
                            ignore: ["**/index.html"], // Ignore files
                        },
                    },
                ],
            }),
        ],
    },
    {
        name: "server",
        entry: "./src/server/server.js",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "server.js",
        },
        target: "node",
        node: {
            __dirname: false,
            __filename: false,
        },
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-env",
                                "@babel/preset-react",
                            ],
                        },
                    },
                },
            ],
        },
    },
];
