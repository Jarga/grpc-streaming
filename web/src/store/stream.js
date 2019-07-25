import debug from 'debug'
import io from 'socket.io-client'

const log = debug('grpc-streaming:web:stream')
const mimecodec = 'video/mp4; codecs="avc1.4d001e,mp4a.40.5"'

function StreamStore() {
  this.state = {
    comments: [],
    error: null,
    loading: false,
    src: null,
  }
  this.socket = null
  this.bufferQueue = []
  this.videoId = null
}

Object.assign(StreamStore.prototype, {
  emit(type, value) {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected) reject('socket disconnected')

      log(`emitting ${type} of ${value}`)
      this.socket.emit(type, value, data => {
        resolve(data)
      })
    })
  },
  init(id) {
    this.videoId = id
    this.state.loading = true

    if (!MediaSource.isTypeSupported(mimecodec)) {
      this.state.error = 'mime type not supported'
      this.state.loading = false
      return
    }

    const ms = new MediaSource()

    this.state.src = URL.createObjectURL(ms)

    log('adding source open event listener')
    ms.addEventListener('sourceopen', this.manageBuffer(ms))
  },
  manageBuffer(ms) {
    return () => {
      log('sourceopen event fired')
      const buffer = ms.addSourceBuffer(mimecodec)
      buffer.mode = 'sequence'

      buffer.addEventListener('update', () => {
        log('source buffer update')
        this.processQueue(buffer)
      })

      buffer.addEventListener('updateend', () => {
        log('source buffer update end')
        this.processQueue(buffer)
      })

      this.manageSocket(ms, buffer)
    }
  },
  manageSocket(ms, buffer) {
    const socket = io('/streams', {
      transports: ['websocket'],
      query: `video_id=${this.videoId}&user_id=sjoyal`,
    })

    socket.on('connect', () => {
      log('socket connected')
      this.state.error = null
      this.state.loading = false
    })

    socket.on('error', err => {
      log('socket error', err)
      this.state.error = err
      this.state.loading = false
    })

    socket.on('comment_chunk', chunk => {
      log('comment_chunk received')
      this.state.comments.push({
        user: chunk.user_id,
        content: chunk.content,
      })
    })

    socket.on('video_stream_end', () => {
      ms.endOfStream()
      console.log('END OF STREAM!', ms)
    })

    socket.on('video_chunk', resp => {
      log('video_chunk received')
      if (buffer.updating || this.bufferQueue.length > 0) {
        this.bufferQueue.push(resp.chunk)
      } else {
        buffer.appendBuffer(resp.chunk)
      }
    })

    this.socket = socket
  },
  processQueue(buffer) {
    if (this.bufferQueue.length && !buffer.updating) {
      log('appending to source buffer')
      buffer.appendBuffer(this.bufferQueue.shift())
    }
  },
})

export default new StreamStore()
