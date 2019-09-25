const { activeStreams } = require('./stateManagementRepository').getState()

const getStream = (key) => activeStreams[key]
const endStream = (key) => {
    activeStreams[key].end()

    delete activeStreams[key]
}
const addStream = (key, stream) => {
    activeStreams[key] = stream
}

module.exports = {
    getStream,
    endStream,
    addStream,
}