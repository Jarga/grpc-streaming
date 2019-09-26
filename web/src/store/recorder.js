var stream = require('readable-stream')

module.exports = createRecordStream

EventTarget.prototype.addEventListenerBase = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener)
{
    if(this._listeners === undefined) {
        this._listeners = []
    }
    this._listeners.push({target: this, type: type, listener: listener});
    this.addEventListenerBase(type, listener);
};
EventTarget.prototype.removeEventListeners = function(targetType)
{
    for(var index = 0; index != this._listeners.length; index++)
    {
        var item = this._listeners[index];

        var target = item.target;
        var type = item.type;
        var listener = item.listener;

        if(target == this && type == targetType)
        {
            this.removeEventListener(type, listener);
        }
    }
}

function createRecordStream (media, opts) {
  if (!opts) opts = {}

  var rs = stream.Readable()
  var top = 0
  var btm = 0
  var buffer = []

  rs.recorder = null
  rs.media = null

  rs._read = noop
  rs.destroyed = false
  rs.destroy = function (err) {
    if (rs.destroyed) return
    rs.destroyed = true
    stop()
    if (err) rs.emit('error', err)
    rs.emit('close')
    rs.recorder = null
    rs.media = null
  }

  rs.stop = function () {
    rs.once('data', function () {
      rs.push(null)
    })
    stop()
  }

  rs.media = media
  rs.recorder = new window.MediaRecorder(media.clone(), opts)

  rs.recorder.addEventListener('dataavailable', function (ev) {
    push(ev.data)
  })
  rs.recorder.start(opts.interval || 1000)

  rs.forceFlush = function () {
    rs.recorder.stop()
    rs.recorder.onstop = (ev) => {
        stopAndRemoveAllTracks(ev.target)
        ev.target.removeEventListeners('dataavailable')
    }
    rs.recorder = new window.MediaRecorder(media.clone(), opts)
    rs.recorder.addEventListener('dataavailable', function (ev) {
        push(ev.data)
    })
    rs.recorder.start(opts.interval || 1000)
  }

  return rs

  function stopAndRemoveAllTracks (mediaRecorder) {
    var video = mediaRecorder.stream.getVideoTracks()
    var audio =  mediaRecorder.stream.getAudioTracks()

    video.forEach((v) => {
        v.stop()
        mediaRecorder.stream.removeTrack(v)
    })
    audio.forEach((a) => {
        v.stop()
        mediaRecorder.stream.removeTrack(a)
    })
  }

  function stop () {
    rs.recorder.stop()

    var video = rs.media.getVideoTracks()
    var audio = rs.media.getAudioTracks()

    video.forEach(trackStop)
    audio.forEach(trackStop)
  }

  function trackStop (track) {
    track.stop()
  }

  function push (blob) {
    var r = new window.FileReader()
    var index = top++

    r.addEventListener('loadend', function () {
      var buf = Buffer(new Uint8Array(r.result))
      var i = index - btm

      while (buffer.length < i) buffer.push(null)
      buffer[i] = buf
      while (buffer.length && buffer[0]) {
        var next = buffer.shift()
        btm++
        rs.push(next)
      }
    })

    r.readAsArrayBuffer(blob)
  }
}

function noop () {}