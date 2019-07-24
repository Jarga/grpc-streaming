const { Transform } = require('stream')

const list = (req, res) => {
    const offset = req.body.offset
    const fetch = req.body.fetch

    var stream = req.videoService.streamRecords({ offset, fetch })
    stream.on('error', () => res.status(500).send('Something broke!'));

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

module.exports = {
    ['list'] : { handler: list, type: 'post' }
}