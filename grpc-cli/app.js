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
    ['-l', '--listFiles'],
    {
        help: 'List files from the server using a provided JSON filter',
    }
)

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
    ['-c', '--cat'],
    {
        help: 'Concatenates a file from the file server to stdout',
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
        } else if (args.download) {
            await client.download(args.download)
            console.log(`Downloaded file [${args.download}] from server!`)
        } else if (args.cat) {
            await client.cat(args.cat)
        }

    })
    .then(async () => {
        if (args.listFiles) {
            const files = await client.listFiles(args.listFiles)
            const output = files.map(f => f.filename)
            console.log(output.join('\n'))
        }
    })
    .then(() => {
        process.exit(0)
    })