#!/usr/bin/env node

const ArgumentParser = require('argparse').ArgumentParser
const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Code on the beach gRPC Streaming CLI tool!',
    epilog: 'Because streams are fun!',
})

const subparsers = parser.addSubparsers()
const fileServer = subparsers.addParser('fileServer', { addHelp: true })
const client = require('./clients/fileServerClient')

fileServer.addArgument(
    ['-r', '--read'],
    {
        help: 'Read a file from the file server',
    }
)

fileServer.addArgument(
    ['-w', '--write'],
    {
        help: 'Write a file to the file server',
    }
)


const args = parser.parseArgs()

if (args.write) {
    client.write(args.write)
} else if (args.read) {
    client.read(args.read)
}

process.exit(0)