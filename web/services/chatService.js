const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const path = require('path');
const config = require('config');

const videoServerUrl = config.get("chatServerUrl")

const chatProto = protoLoader.loadSync(path.join(__dirname, '..', 'node_modules/chat-proto/chat.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const chat_proto = grpc.loadPackageDefinition(chatProto).Chat

const create = () => new chat_proto.Chat(videoServerUrl, grpc.credentials.createInsecure())

module.exports = {
    create
}