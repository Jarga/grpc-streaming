#!/usr/bin/env node

process.on('unhandledRejection', error => {
    console.log('Unhandled Promise Rejection =>', error)
})

process.on('uncaughtException', error => {
    console.log('Unhandled Error =>', error)
})

const ArgumentParser = require('argparse').ArgumentParser
const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Code on the beach gRPC Streaming CLI tool!',
    epilog: 'Because streams are fun!',
})

const subparsers = parser.addSubparsers()
const fileServer = subparsers.addParser('fileserver', { addHelp: true })
const client = require('./clients/fileServerClient')

fileServer.addArgument(
    ['-u', '--upload'],
    {
        help: 'Upload a file to the file server',
    }
)

fileServer.addArgument(
    ['-d', '--download'],
    {
        help: 'Download a file from the file server',
    }
)

fileServer.addArgument(
    ['-f', '--format'],
    {
        help: 'Formats the file server (Deletes all files)',
        action: 'storeTrue',
    }
)

const args = parser.parseArgs()
Promise.resolve()
    .then(async () => {
        if (args.format) {
            await client.formatFileSystem()
            console.log('Formatted file system!')
        }
    })
    .then(async () => {
        if (args.upload) {
            await client.upload(args.upload)
            console.log(`Uploaded file [${args.upload}] to server!`)
        }
    })
    .then(async () => {
        if (args.download) {
            await client.download(args.download)
            console.log(`Downloaded file [${args.download}] from server!`)
        }
    })
    .then(() => {
        process.exit(0)
    })