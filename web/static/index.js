;(function() {
  'use strict'

  // codecString = 'video/webm; codecs="vp8"';
  // codecString = 'video/webm; codecs="vp9"';

  var video = document.getElementById('video')
  var mediaSource = new MediaSource()
  video.src = window.URL.createObjectURL(mediaSource)
  var buffer = null
  var queue = []

  mediaSource.addEventListener('sourceopen', sourceBufferHandle)

  function updateBuffer() {
    if (queue.length > 0 && !buffer.updating) {
      buffer.appendBuffer(queue.shift())
    }
  }
  /**
   * Mediasource
   */
  function sourceBufferHandle() {
    buffer = mediaSource.addSourceBuffer(
      'video/mp4; codecs="avc1.4d001e,mp4a.40.5"'
    )
    buffer.mode = 'sequence'

    buffer.addEventListener('update', function() {
      // Note: Have tried 'updateend'
      console.log('update')
      updateBuffer()
    })

    buffer.addEventListener('updateend', function() {
      console.log('updateend')
      updateBuffer()
    })

    initWS()
  }

  function initWS() {
    var socket = io('/streams', { transports: ['websocket'], query: 'video_id=00D348BC-0B11-4AA1-82A4-6AE90EAF18F5&user_id=smcadams'})
    //new WebSocket('ws://' + window.location.hostname + ':' + window.location.port + '/stream', 'echo-protocol');
    //ws.binaryType = "arraybuffer";

    socket.on('connect', () => {
      console.info('Socket connected.')
    })

    socket.on('error', err => {
      console.error('Socket error.', err)
    })

    socket.on('comment_chunk', chunk => {
      //console.info('Got comment chunk.', chunk);
      var commentContainer = document.getElementById('comment-container')
      var para = document.createElement('p')
      var text = document.createTextNode(
        'User: ' + chunk.user_id + ' | Message: ' + chunk.content
      )
      para.appendChild(text)
      commentContainer.appendChild(para)
    })

    socket.on('video_stream_end', () => {
      mediaSource.endOfStream()
    })

    socket.on('video_chunk', resp => {
      console.info('Got video chunk.', resp)
      if (buffer.updating || queue.length > 0) {
        queue.push(resp.chunk)
      } else {
        buffer.appendBuffer(resp.chunk)
      }
    })
  }
})()
