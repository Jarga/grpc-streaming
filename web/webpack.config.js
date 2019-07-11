const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        main: path.resolve(__dirname, 'src/main.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, 'src/shared'),
            '@store': path.resolve(__dirname, 'src/store'),
        },
        modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    'eslint-loader',
                ],
            },
        ]
    }
}
