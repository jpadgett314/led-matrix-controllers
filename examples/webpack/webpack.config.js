const path = require('path');

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        filename: 'dist.js',
        path: path.resolve(__dirname, '.'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '.'),
        },
        port: 8080,
    },
};
