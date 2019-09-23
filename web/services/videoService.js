const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const path = require('path');
const config = require('config');

const videoServerUrl = config.get("videoServerUrl")

const videoProto = protoLoader.loadSync(path.join(__dirname, '..', 'protos/video.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const video_proto = grpc.loadPackageDefinition(videoProto).VideoStream

const create = () => new video_proto.VideoStream(videoServerUrl, grpc.credentials.createInsecure())

module.exports = {
    create
}