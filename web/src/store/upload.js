import debug from 'debug'
import MediaStreamToWebm from 'mediastream-to-webm'
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

Object.assign(UploadStore.prototype, {
  init() {
    if (!navigator.mediaDevices.getUserMedia) {
      this.state.error = 'user media not available in this browser'
      return
    }

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then(
        stream => {
          const socket = io('/uploads', { transports: ['websocket'], query: 'user_id=smcadams' })

          socket.on('connect', () => {
            var encodedStream = MediaStreamToWebm.EncodedStream(stream, {
              interval: 1000,
              audioBitsPerSecond: 1000,
              videoBitsPerSecond: 100000,
              mimeType: 'video/webm; codecs="opus,vp8"',
            })

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
