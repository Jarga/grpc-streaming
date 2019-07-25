;(function() {
  'use strict'

  // codecString = 'video/webm; codecs="vp8"';
  // codecString = 'video/webm; codecs="vp9"';

  
  var socket = io('/streams', { transports: ['websocket'], query: 'video_id=D7D633AE-CDA3-48A2-9546-3855CB400E1C&user_id=smcadams'})

  var video = document.getElementById('video')
  var decodedStream = MediaStreamToWebm.DecodedStream(
  {
    videoElement: video, // specify an existing video element
    mimeType: 'video/webm; codecs="opus,vp8"'
  })

  socket.on('video_chunk', resp => {
    console.info('Got video chunk.', resp)
    decodedStream.write(new Uint8Array(resp.chunk))
  })
  //socket.pipe(decodedStream)
  video.autoplay = true
  video.oncanplay = function () {
      video.play()
  }
  // document.body.appendChild(video) 
  //var video = document.getElementById('video')
  //var mediaSource = new MediaSource()
  //video.src = window.URL.createObjectURL(mediaSource)
  var buffer = null
  var queue = []

  //mediaSource.addEventListener('sourceopen', sourceBufferHandle)

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
      'video/webm; codecs="opus,vp8"'
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
