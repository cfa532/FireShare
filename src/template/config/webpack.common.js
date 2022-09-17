const path = require('path')
const HtmlWebpackPlugin =  require('html-webpack-plugin')
console.log(path.join(__dirname, '../dist'))

module.exports = {
    entry: {
        main: path.resolve(__dirname, "../src/temp.js"),
    },
    output: {
        path: path.join(__dirname, '../dist'),
        filename: "temp.js"
    },
    module: {
        rules: [
            {
                test: /.js?$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename:'temp.min.html',
            inject: 'head',               //true:角本插入在底部
            template: 'main.html',
        }),        
    ],
};