const express = require('express')
const config = require('config')
const expressWinston = require('express-winston')
const winston = require('winston')
const socket_io = require('socket.io')
const http = require('http')
const path = require('path')

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const loggerConfig = {
    transports: [
      new winston.transports.Console({
        prettyPrint: true,
        json: true,
        colorize: true,
        timestamp: true,
        humanReadableUnhandledException: true,
      })
    ],
  };
const logger = winston.createLogger(loggerConfig);

// Global Handlers
process.on('unhandledRejection', error => {
    logger.error('Unhandled Promise Rejection', error)
});

process.on('uncaughtException', error => {
    logger.error('Unhandled Error', error)
});

var chatProto = protoLoader.loadSync(
    './protos/chat.proto',
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

var streamProto = protoLoader.loadSync(
    './protos/video.proto',
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

var chat_proto = grpc.loadPackageDefinition(chatProto).Chat;
var video_proto = grpc.loadPackageDefinition(streamProto).VideoStream;

const app = express()
const server = http.createServer(app);
const io = socket_io.listen(server)

app.use(expressWinston.logger(loggerConfig));

const root = path.resolve(__dirname, './static/')

app.use(express.static(root));
app.get('/', function(req, res){
    res.sendFile('index.html', { root });
});

let streams = {};

io.of('/comments')
    .on('connection', function (socket) {
        if(!streams['comments']) {
            try {
                let client = new chat_proto.Chat('localhost:5000', grpc.credentials.createInsecure());
                streams['comments'] = client.join({ video_id: "TEST", user_id: "SERVER1" })
                streams['comments'].on('data', (chunk) => {
                    socket.broadcast.emit('chunk', chunk);
                    logger.info('Sent comment chunk', chunk);
                })
            } catch(e) {
                logger.error('Error', e);
            }
        }
        
        socket.on('disconnect', function () {
            logger.info('Disconnect');
        });
    });

io.of('/stream')
    .on('connection', function (socket) {
        if(!streams['stream']) {
            try {
                let client = new video_proto.VideoStream('localhost:5010', grpc.credentials.createInsecure());
                streams['stream'] = client.stream({ video_id: "TEST", user_id: "SERVER1" })
                streams['stream'].on('data', (chunk) => {
                    socket.emit('chunk', chunk);
                    logger.info('Sent video chunk', chunk.chunk.length);
                })
                streams['stream'].on('end', () => {
                    delete streams['stream'];
                    socket.emit('stream_end');
                    logger.info('video end');
                })
            } catch(e) {
                logger.error('Error', e);
            }
        }
        
        socket.on('disconnect', function () {
            logger.info('Disconnect');
        });
    });

server.listen(process.env.PORT, function () {
    logger.info(`listening on port ${process.env.PORT}!`);
});