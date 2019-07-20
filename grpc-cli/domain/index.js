/**
 * https://www.grpc.io/docs/tutorials/basic/node/
 */
const path = require('path')
const PROTO_PATH = path.resolve(__dirname + '/../../protos/files.proto')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

module.exports = grpc.loadPackageDefinition(packageDefinition)