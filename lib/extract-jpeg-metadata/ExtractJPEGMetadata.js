var fs = require('fs'),
    Events = require("events"),
    EventEmitter = new Events.EventEmitter()

function ExtractJPEGMetadata (input, callback) {

  this._ee = new Events.EventEmitter()
  this._segments = [ ]

  if (!input)
    throw new Error('Invalid input')
  this._input = input
  
  if (typeof callback !== 'function')
    throw new Error('You have to provide a callback function.')
  this._callback = callback

  this._ee.on('SOI', this._onNewSegment.bind(this))
  this._ee.on('APP1', this._onNewSegment.bind(this))
  this._ee.on('COM', this._onNewSegment.bind(this))
  this._ee.on('done', this._onCompletion.bind(this))

  this._processInput()
}

module.exports = ExtractJPEGMetadata

ExtractJPEGMetadata.prototype._onNewSegment = function (segment) {
  this._segments.push(segment)
}

ExtractJPEGMetadata.prototype._onCompletion = function () {
  var jpegMetadata = Buffer.concat(this._segments)

  this._callback(false, jpegMetadata)
}

ExtractJPEGMetadata.prototype._processInputBuffer = function (error, data) {

  if (error) {
    this._callback(error)
    return
  }

  this._processImage(data)
}

ExtractJPEGMetadata.prototype._processInput = function () {

  switch (this._input.constructor.name) {
  case 'Buffer':
    this._processInputBuffer(false, this._input)
    break
  case 'String':
    fs.readFile(this._input, this._processInputBuffer.bind(this))
    break
  default:
    this._callback(new Error('Unknown input argument type'))
    break
  }
}

ExtractJPEGMetadata.prototype._processImage = function (data) {

  var soiHdr = data.readUInt16BE(0)
  if (soiHdr != 0xFFD8)
    throw new Error("Unknown image format")

  this.processJPEGImage(data, 0)
}

ExtractJPEGMetadata.prototype.processJPEGImage = function (data, offset) {

  while (offset < data.length) {
    var segment, segmentHdr, segmentLength
    var buf = { }
 
    segmentHdr = data.readUInt16BE(offset)

    segment = ExtractJPEGMetadata.JPEGMARKERS[segmentHdr]
    if (typeof segment == "undefined") {
      var maskedHdr = segmentHdr & (~ 0x0f)
      segment = ExtractJPEGMetadata.JPEGMARKERS[maskedHdr]
      if (typeof segment == "undefined")
        throw new Error("Unknown segment header: " + segmentHdr.toHex())

      maskedHdr = segmentHdr & (~ segment.mask)
      if (segment !== ExtractJPEGMetadata.JPEGMARKERS[maskedHdr])
        throw new Error("Unknown segment header: " + segmentHdr.toHex())
    }
 
    segmentLength = segment.len
    if (segmentLength == -1)
      segmentLength = data.readUInt16BE(offset + 2)

    name = segment.name
    if (segment.mask != 0)
    name = name + (segmentHdr & segment.mask)

    buf.start = offset
    buf.end = offset + 2 + segmentLength

    buf.data = data.slice(buf.start, buf.end)

    this._ee.emit("all", buf.data)
    this._ee.emit(segment.name, buf.data)
    if (name != segment.name)
      this._ee.emit(name, buf.data)

    offset += 2 + segmentLength

    if (segment.name == "SOS")
      break
  }

  this._ee.emit("done")
}

ExtractJPEGMetadata.JPEGMARKERS = {
  0xFFD8 : { name: "SOI", mask: 0,   len: 0 },
  0xFFC0 : { name: "SOF0", mask: 0,  len: -1 },
  0xFFC2 : { name: "SOF2", mask: 0,  len: -1 },
  0xFFC4 : { name: "DHT", mask: 0,   len: -1 },
  0xFFDB : { name: "DQT", mask: 0,   len: -1 },
  0xFFDD : { name: "DRI", mask: 0,   len: -1 },
  0xFFDA : { name: "SOS", mask: 0,   len: -1 },
  0xFFD0 : { name: "RST", mask: 0x7, len: 0 },
  0xFFE0 : { name: "APP", mask: 0xF, len: -1 },
  0xFFFE : { name: "COM", mask: 0,   len: -1 },
  0xFFD9 : { name: "EOI", mask: 0,   len: 0 },
}
