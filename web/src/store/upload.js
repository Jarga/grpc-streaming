import debug from 'debug'
import EncodedStream from './encodedStream'
import io from 'socket.io-client'
const log = debug('grpc-streaming:web:upload')
const mimeType = 'video/webm; codecs="opus,vp8"'

function UploadStore() {
  this.state = {
    error: null,
    srcObj: null,
  }

  this.socket = null
  this.stream = null
}

function continueRestartLoop(recordStream) {
  setTimeout(() => {
    recordStream.forceFlush()
    continueRestartLoop(recordStream)
  }, 500)
}

Object.assign(UploadStore.prototype, {
  init() {
    if (!navigator.mediaDevices.getUserMedia) {
      this.state.error = 'user media not available in this browser'
      return
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { frameRate: 30, facingMode: "user" },
        audio: !window.localStorage.audio ? true : window.localStorage.audio === "true",
      })
      .then(
        stream => {
          const socket = io('/uploads', { transports: ['websocket'], query: 'user_id=smcadams' })
          socket.on('connect', () => {
            var encodedStream = EncodedStream(stream, {
              interval: 100,
              audioBitsPerSecond: 64000,
              videoBitsPerSecond: 1250000,
              mimeType
            })

            continueRestartLoop(encodedStream.recordStream)

            encodedStream.on('data', function(data) {
              socket.emit('video_chunk', { chunk: data })
            })
          })

          this.socket = socket
          this.stream = stream
          this.state.srcObj = stream
        },
        err => {
          this.state.error = err
        }
      )
  },
})

export default new UploadStore()
