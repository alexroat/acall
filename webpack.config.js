const path = require('path');
const webpack = require('webpack');




/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled TerserPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/terser-webpack-plugin
 *
 */

const TerserPlugin = require('terser-webpack-plugin');




module.exports = {
    mode: 'development',
    plugins: [new webpack.ProgressPlugin()],
    entry: {
        bundle: ['@babel/polyfill', './frontend/index.js']
    },
    output: {
        path: path.resolve(__dirname, 'public/javascripts'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [path.resolve(__dirname, 'frontend')],
                loader: 'babel-loader'
            },
            {
                test: /.css$/,

                use: [{
                        loader: "style-loader"
                    }, {
                        loader: "css-loader",

                        options: {
                            sourceMap: true
                        }
                    }]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],

    },

    optimization: {
        minimizer: [new TerserPlugin()],

        splitChunks: false
    },
    plugins: [
        // fix "process is not defined" error:
        // (do "npm install process" before running the build)
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ]
}