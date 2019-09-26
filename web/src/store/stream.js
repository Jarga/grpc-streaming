import debug from 'debug'
import io from 'socket.io-client'
//import MediaStreamToWebm from 'mediastream-to-webm'
import DecodedStream from './decodedStream'

const log = debug('grpc-streaming:web:stream')
const mimecodec = !window.localStorage.audio 
? 'video/webm; codecs="opus,vp8"' 
: window.localStorage.audio === "true"
    ? 'video/webm; codecs="opus,vp8"'
    : 'video/webm; codecs="vp8"'//'video/mp4; codecs="avc1.4d001e,mp4a.40.5"'

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
  init(id, isStream) {
    this.videoId = id
    if (isStream) {
      this.initStream()
    } else {
      this.initVideo()
    }
  },
  initVideo() {
    log('attempting to start video')
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
  initStream() {
    const videoElement = document.getElementById('video')

    log('attempting to start stream')
    const socket = io('/streams', {
      transports: ['websocket'],
      query: `video_id=${this.videoId}&user_id=smcadams`,
    })
    var mimeType = !window.localStorage.audio 
                  ? 'video/webm; codecs="opus,vp8"' 
                  : window.localStorage.audio === "true"
                      ? 'video/webm; codecs="opus,vp8"'
                      : 'video/webm; codecs="vp8"'
    //var elementWrapper = MediaElementWrapper(videoElement)
    //var decodedStream = elementWrapper.createWriteStream(mimeType)
    var decodedStream = DecodedStream({
        videoElement,
        mimeType
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
      log('end of stream')
    })

    socket.on('video_chunk', resp => {
      log('video_chunk received')
      decodedStream.write(new Uint8Array(resp.chunk))
    })

    video.autoplay = true
    video.oncanplay = () => {
      video.play()
    }

    this.socket = socket
  },
  manageBuffer(ms) {
    return () => {
      log('sourceopen event fired')
      const buffer = ms.addSourceBuffer(mimecodec)
      buffer.mode = 'segments'

      buffer.addEventListener('update', () => {
        log('source buffer update')
        this.processQueue(buffer, ms)
      })

      buffer.addEventListener('updateend', () => {
        log('source buffer update end')
        this.processQueue(buffer, ms)
      })

      this.manageSocket(ms, buffer)
    }
  },
  manageSocket(ms, buffer) {
    const socket = io('/streams', {
      transports: ['websocket'],
      query: `video_id=${this.videoId}&user_id=smcadams`,
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
      this.isDone = true
      if (!this.bufferQueue.length && !buffer.updating) {
        log('calling end of stream in socket call', ms)
        ms.endOfStream()
      }
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
  processQueue(buffer, ms) {
    if (this.bufferQueue.length && !buffer.updating) {
      log('appending to source buffer')
      buffer.appendBuffer(this.bufferQueue.shift())
    } else if (this.isDone && !buffer.updating) {
      log('end of stream')
      ms.readyState !== 'ended' && ms.endOfStream()
    }
  },
})

export default new StreamStore()