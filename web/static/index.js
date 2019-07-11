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
    var commentSocket = io('/comments', { transports: ['websocket'] })
    var videoSocket = io('/stream', { transports: ['websocket'] })
    //new WebSocket('ws://' + window.location.hostname + ':' + window.location.port + '/stream', 'echo-protocol');
    //ws.binaryType = "arraybuffer";

    commentSocket.on('connect', () => {
      console.info('Comments connected.')
    })

    commentSocket.on('error', err => {
      console.error('Comments error.', err)
    })

    videoSocket.on('connect', () => {
      console.info('Video connected.')
    })

    videoSocket.on('error', err => {
      console.error('Video error.', err)
    })

    videoSocket.on('stream_end', () => {
      mediaSource.endOfStream()
    })

    commentSocket.on('chunk', chunk => {
      //console.info('Got comment chunk.', chunk);
      var commentContainer = document.getElementById('comment-container')
      var para = document.createElement('p')
      var text = document.createTextNode(
        'User: ' + chunk.user_id + ' | Message: ' + chunk.content
      )
      para.appendChild(text)
      commentContainer.appendChild(para)
    })

    videoSocket.on('chunk', resp => {
      console.info('Got video chunk.', resp)
      if (buffer.updating || queue.length > 0) {
        queue.push(resp.chunk)
      } else {
        buffer.appendBuffer(resp.chunk)
      }
    })
  }

  function playVideo() {
    buffer = mediaSource.addSourceBuffer(
      'video/mp4; codecs="avc1.4d001e,mp4a.40.5"'
    )
    buffer.mode = 'sequence'

    if (queue.length > 0) {
      buffer.appendBuffer(queue.shift())
      buffer.onupdateend = e => {
        buffer.appendBuffer(queue.shift())
      }
    }

    //mediaSource.endOfStream();
    video.play()
  }

  window.playVideo = playVideo
})()
