;(function() {
  'use strict'

  // codecString = 'video/webm; codecs="vp8"';
  // codecString = 'video/webm; codecs="vp9"';

  var video2 = document.getElementById('video2')

  
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        var socket = io('/uploads', { transports: ['websocket'], query: 'user_id=smcadams'})

        socket.on('connect', () => {
          var encodedStream = MediaStreamToWebm.EncodedStream(stream, {
            interval: 1000,
            audioBitsPerSecond : 1000,
            videoBitsPerSecond : 100000,
            mimeType: 'video/webm; codecs="opus,vp8"'
        })

          encodedStream.on('data', function (data) {
            socket.emit('video_chunk', { chunk: data })
          }) 
          //encodedStream.pipe(socket)
          // var recorder = new MediaRecorder(stream, {
          //   mimeType: 'video/webm;codecs=opus,vp8',
          //   videoBitsPerSecond : 3000000
          // });
          
          // recorder.onstart = function(e) {
          //   var blob = e.data;
          // }
          // recorder.ondataavailable = function(e) {
          //   var blob = e.data;
          //   fetch(URL.createObjectURL(blob)).then(res => res.arrayBuffer()).then(buff => socket.emit('video_chunk', { chunk: buff }));
          // }
          // recorder.start(1000)
        })
    
        video2.srcObject = stream;
      })
      .catch(function (error) {
        console.log("Something went wrong!");
      });
  }
})()
