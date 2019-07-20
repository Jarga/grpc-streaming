const { format } = require('winston')
const defaultExcept = ['level', 'message', 'splat', 'label', 'timestamp']
const defaultScopeFunc = () => ({})
const clone = require('deepcopy')

const isEmptyObject = module.exports.isEmptyObject = (obj) =>
    obj !== undefined &&
    Object.entries(obj).length === 0 &&
    obj.constructor === Object

const errorsAsObjects = module.exports.errorsAsObjects = format((info) => {
    const converted = convertErrorToObject(info)
    Object.assign(info, converted)
    return info
})

const inspector = format((info, name) => {
    return info
})

const deepCloneSplat = format((info) => {
    const cloned = clone(info)
    return format.splat().transform(cloned)
})

const withScope = module.exports.withScope = format((info, scopeFunc) => {
    if (typeof scopeFunc !== 'function') {
        throw new Error('scopeFunc must be a function!')
    }

    const scope = scopeFunc()
    if (!isEmptyObject(scope)) {
        Object.assign(info, scope)
    }

    return info
})

module.exports.consoleFormatter = (logLabel, scopeFunc) => format.combine(
    inspector('console'),
    format.label({ label: logLabel }),
    format.timestamp(),
    format.colorize(),
    deepCloneSplat(),
    withScope(scopeFunc || defaultScopeFunc),
    errorsAsObjects(),
    format.printf(info => {
        const rest = stringifyExcept(info)
        return `${info.timestamp} - ${info.level}:[${info.label}] ${info.message} ${rest}`
    }),
)

const convertErrorToObject = (err) => {
    if (typeof err !== 'object') return err

    const errorObject = {}
    Object.getOwnPropertyNames(err || errorObject).forEach((key) => {
        const target = err[key]
        if (target instanceof Error) {
            errorObject[key] = convertErrorToObject(target)
        } else if (!key.startsWith('_')) {
            errorObject[key] = target
        }
    })

    return errorObject
}

const stringifyExcept = (info, except = defaultExcept) => {
    const ignoreObj = except.reduce((a, c) => ({ ...a, ...{ [c]: undefined } }), {})
    const data = JSON.stringify({ ...info, ...ignoreObj }, undefined, 2)
    return data === '{}' ? '' : data
}