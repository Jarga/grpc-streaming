/**
 * https://www.grpc.io/docs/tutorials/basic/node/
 */

const PROTO_PATH = __dirname + '../protos/files.proto';
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// Suggested options for similarity to existing grpc.load behavior
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// The protoDescriptor object has the full package hierarchy
const routeguide = protoDescriptor.routeguide;