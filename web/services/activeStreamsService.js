const activeStreamsRepository = require('../repositories/activeStreamsRepository')

const {
    addStream,
    endStream,
    getStream,
} = activeStreamsRepository


module.exports = {
    addStream,
    endStream,
    getStream,
}