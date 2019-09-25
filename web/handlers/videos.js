const { Transform, pipeline, PassThrough  } = require('stream')
const formidable = require('formidable');
const logger = require('../logging').createLogger('videoApiHandler')

const list = (req, res) => {
    const offset = req.body.offset
    const fetch = req.body.fetch

    var stream = req.videoService.streamRecords({ offset, fetch })
    stream.on('error', (error) => {
        logger.error("Something broke!", error)
        res.status(500).send(`Something broke! Error: ${error}`)
    });

    const stringifyTransform = new Transform({
        objectMode: true,
        transform: (chunk, encoding, done) => {
            const result = JSON.stringify(chunk) + '\n'
            done(null, result)
        }
    })

    stream.on('open', () => {
        if(!res._headerSent) {
            res.writeHead(200, {
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            })
            res._headerSent = true
        }
    })
    stream.on('end', () => res.end());
    stream.pipe(stringifyTransform).pipe(res);
}

const upload = (req, res) => {

    const form = new formidable.IncomingForm();
    const pass = new PassThrough()

    const fileMeta = {}
    form.onPart = part => {
        if (!part.filename) {
            form.handlePart(part)
            return
        }

        fileMeta.filename = part.filename

        part.on('data', function (buffer) {
            pass.write(buffer)
        })
        part.on('end', function () {
            pass.end()
        })
    }

    form.parse(req, err => {
        if (err) {
            logger.error(err)
            next()
        } else {
            const call = req.videoService.upload((err, result) => {
                if (err) {
                    res.status(500).send(`Upload failed. Error ${err}`)
                    res.end()
                } else {
                    res.status(200).send(`${fileMeta.filename} Uploaded. ${JSON.stringify(result)}`)
                    res.end()
                }
            })
        
            // Initialize the write with the filename
            call.write({ filename: fileMeta.filename, chunk: null })

            // Stream all file data to the client
            const stream = pipeline(
                pass,
                createBytesToMessageTransformStream(fileMeta.filename),
                call,
                (err) => {
                    if (err) {
                        logger.error(err)
                        next()
                    }
                }
            )
        }
    })    
}

const createBytesToMessageTransformStream = (filename) => new Transform({
    objectMode: true,
    transform: (bytes, _, done) => {
        done(null, { filename, chunk: bytes })
    },
})

module.exports = {
    ['list'] : { handler: list, type: 'post' },
    ['upload'] : { handler: upload, type: 'post' }
}