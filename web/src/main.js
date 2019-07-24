import Vue from 'vue'
import { NotFound, List, Stream, Upload } from './pages'
import SimpleRouter from './router'

const router = new SimpleRouter()
router.registerRoutes([
  {
    comp: List,
    exact: true,
    path: '/',
  },
  {
    comp: Stream,
    path: '/stream/:id',
  },
  {
    comp: Upload,
    path: '/upload',
  },
])

const app = new Vue({
  el: '#app',
  data: {
    currentPath: window.location.pathname,
  },
  computed: {
    routeConfig() {
      return router.matchRoute(this.currentPath)
    },
  },
  render(h) {
    const rc = this.routeConfig

    if (rc) {
      return h(rc.comp, { props: rc.props })
    }

    return h(NotFound)
  },
})

window.addEventListener('popstate', () => {
  app.currentRoute = window.location.pathname
})
