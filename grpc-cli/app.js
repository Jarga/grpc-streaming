#!/usr/bin/env node
const ArgumentParser = require('argparse').ArgumentParser
const client = require('./clients/fileServerClient')
const cliProgress = require('cli-progress')
const fs = require('fs')
const { Transform } = require('stream')
const path = require('path')

process.on('unhandledRejection', error => {
    console.log('Unhandled Promise Rejection =>', error)
})

process.on('uncaughtException', error => {
    console.log('Unhandled Error =>', error)
})


const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Code on the beach gRPC Streaming CLI tool!',
    epilog: 'Because streams are fun!',
})

const subparsers = parser.addSubparsers()
const fileServer = subparsers.addParser('fileserver', { addHelp: true })


fileServer.addArgument(
    ['-l', '--listFiles'],
    {
        help: 'List files from the server using a JSON filter. ' +
            'Use {} for all files.',
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
    ['-r', '--remove'],
    {
        help: 'Remove a file from the file server',
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
const bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic)

Promise.resolve()
    .then(async () => {
        if (args.format) {
            await client.formatFileSystem()
            console.log('Formatted file system!')
        } else if (args.remove) {
            await client.removeFile(args.remove)
            console.log('Removed file!')
        } else if (args.download) {
            const file = await client.getFileInfo(args.download)
            bar.start(file.length, 0)

            const filename = path.basename(args.download)
            const writeStream = fs.createWriteStream(args.download)
            const voyeur = createVoyeurStream()
            voyeur.on('data', (bytes) => {
                bar.update(bar.value + bytes.length)
            })

            voyeur.pipe(writeStream)
            await client.downloadToFileStream(filename, voyeur)
            bar.update(file.length)
            bar.stop()

            console.log('Downloaded file from server!')
            console.dir(file)
        } else if (args.cat) {
            await client.printFileContent(args.cat)
        }
    })
    .then(async () => {
        if (args.upload) {
            const stats = fs.statSync(args.upload)
            bar.start(stats.size, 0)

            const readStream = fs.createReadStream(args.upload)
            readStream.on('data', (bytes) => {
                bar.update(bar.value + bytes.length)
            })

            const filename = path.basename(args.upload)
            const file = await client.uploadFromFileStream(filename, readStream)
            bar.update(stats.size)
            bar.stop()

            console.log('Uploaded file to server!')
            console.dir(file)
        }
    })
    .then(async () => {
        if (args.listFiles) {
            await client.printFiles(args.listFiles)
        }
    })
    .then(() => {
        process.exit(0)
    })

const createVoyeurStream = () => new Transform({
    objectMode: false,
    transform: (bytes, _, done) => {
        done(null, bytes)
    },
})