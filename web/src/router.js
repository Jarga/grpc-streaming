const slash = '/'
const escapeRegex = /\/|:[\w-]+/g
const paramRegex = /^:[\w-]+$/
const normalizePath = path => {
  const lead = path.slice(0, 1) === slash
  const trail = path.slice(-1) === slash

  if (lead && !trail) return `${path}${slash}`
  if (!lead && trail) return `${slash}${path}`

  return !lead && !trail ? `${slash}${path}${slash}` : path
}

function Router(params = {}) {
  this.routes = params.routes || []
}

Object.assign(Router.prototype, {
  registerRoutes(routes) {
    // loop over routes and replace the value on this instance
    const replace = (match, offset) => {
      if (match === '/') return `\\${match}`
      return '[\\w-]+'
    }
    const mapped = routes.map(r => ({
      ...r,
      match: r.path.replace(escapeRegex, replace),
    }))

    this.routes = mapped
  },
  findParams(routeConfig, pathname) {
    const pathArr = normalizePath(pathname).split(slash)
    const matchArr = normalizePath(routeConfig.path).split(slash)
    let props = {}

    for (let i = 1; i < matchArr.length - 1; i++) {
      const fragment = matchArr[i]
      const match = fragment.match(paramRegex)

      if (match) {
        props = {
          ...props,
          [match[0].slice(1)]: pathArr[i],
        }
      }
    }

    return props
  },
  matchRoute(pathname) {
    const routes = this.routes
    const found = routes.find(r => {
      const regex = new RegExp(r.match, 'i')
      const [match] = regex.exec(pathname) || []

      return r.exact ? match === pathname : match
    })

    if (found) {
      const props = this.findParams(found, pathname)

      return {
        comp: found.comp,
        props,
      }
    }

    return null
  },
})

export default Router
