const config = require('config')
const Redis = require("ioredis");
const logger = require('../logging').create('messageBus')
const { connectionUrl } = config.get('redis')

module.exports.create = () => {
    const client = new Redis(connectionUrl);

    client.on('connect', () => logger.debug('Message Bus connected to Redis'))
    client.on('error', params => logger.error('Message Bus error from Redis', params.message))
    client.on('close', params => logger.warn('Message Bus warning from Redis', params.message))
    client.on('end', () => logger.warn('Message Bus disconnected from Redis'))

    return client
}