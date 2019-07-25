/**
 * https://www.grpc.io/docs/tutorials/basic/node/
 */
const path = require('path')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '..', 'node_modules/files-proto/files.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

module.exports = grpc.loadPackageDefinition(packageDefinition)