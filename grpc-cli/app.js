#!/usr/bin/env node
const ArgumentParser = require('argparse').ArgumentParser
const client = require('./clients/fileServerClient')
const cliProgress = require('cli-progress')
const fs = require('fs')
const { Transform } = require('stream')
const path = require('path')

process.on('unhandledRejection', error => {
    console.log('Unhandled Promise Rejection =>', error)
    process.exit(0)
})

process.on('uncaughtException', error => {
    console.log('Unhandled Error =>', error)
    process.exit(0)
})


const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Code on the beach gRPC Streaming CLI tool!',
    epilog: 'Because streams are fun!',
})

const subparsers = parser.addSubparsers()
const fileServer = subparsers.addParser('fileserver', { addHelp: true })

const round = (value, decimals = 2) =>
    Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)

const bytesToMb = (bytes) => bytes / 1024.0 / 1024.0


fileServer.addArgument(
    ['-i', '--info'],
    {
        help: 'Gets all file information from the server for the provided file id.',
    }
)

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
        help: 'Download a file with the provided id from the file server',
    }
)

fileServer.addArgument(
    ['-r', '--remove'],
    {
        help: 'Remove a file by the provided id from the file server',
    }
)

fileServer.addArgument(
    ['-c', '--cat'],
    {
        help: 'Concatenates a file with the provided id from the file server to stdout',
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
const bar = new cliProgress.Bar({
    format: '[{bar}] {percentage}% | ETA: {eta}s | {valueMb}/{totalMb} MB | Speed: {speed} mbps',
}, cliProgress.Presets.shades_grey)

Promise.resolve()
    .then(async () => {
        if (args.info) {
            const file = await client.getFileInfo(args.info)
            console.dir(file)
        } else if (args.format) {
            await client.formatFileSystem()
            console.log('Formatted file system!')
        } else if (args.remove) {
            await client.removeFile(args.remove)
            console.log('Removed file!')
        } else if (args.download) {
            const file = await client.getFileInfo(args.download)
            const totalMb = bytesToMb(file.length)
            bar.start(file.length, 0, { speed: 'N/A', totalMb: round(totalMb, 2), valueMb: 0 })

            const id = path.basename(args.download)
            const writeStream = fs.createWriteStream(file.filename)
            const voyeur = createVoyeurStream()

            let startTime = new Date()
            let valueMb = 0
            voyeur.on('data', (bytes) => {
                valueMb += bytesToMb(bytes.length)
                const elapsedSec = (new Date() - startTime) / 1000.0
                const speed = round((valueMb * 8) / elapsedSec)
                bar.increment(bytes.length, { speed, valueMb: round(valueMb, 2) })
            })

            voyeur.pipe(writeStream)
            await client.downloadToFileStream(id, voyeur)
            bar.update(file.length)
            bar.stop()

            console.log('Downloaded file from server!')
            console.dir(file)
        } else if (args.cat) {
            await client.printFileContent(args.cat)
        } else if (args.upload) {
            const stats = fs.statSync(args.upload)
            const totalMb = bytesToMb(stats.size)
            bar.start(stats.size, 0, { speed: 'N/A', totalMb: round(totalMb, 2), valueMb: 0 })

            const readStream = fs.createReadStream(args.upload)

            let startTime = new Date()
            let valueMb = 0
            readStream.on('data', (bytes) => {
                valueMb += bytesToMb(bytes.length)
                const elapsedSec = (new Date() - startTime) / 1000.0
                const speed = round((valueMb * 8) / elapsedSec)
                bar.increment(bytes.length, { speed, valueMb: round(valueMb, 2) })
            })

            const filename = path.basename(args.upload)
            const file = await client.uploadFromFileStream(filename, readStream)
            bar.stop()

            console.log('Uploaded file to server!')
            console.dir(file)
        } else if (args.listFiles) {
            await client.printFiles(args.listFiles)
        }
    })
    .then(() => {
        process.exit(0)
    })
    .catch((err) => {
        console.log('Error while executing command')
        console.dir(err)
        process.exit(0)
    })

const createVoyeurStream = () => new Transform({
    objectMode: false,
    transform: (bytes, _, done) => {
        done(null, bytes)
    },
})