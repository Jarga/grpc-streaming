import Vue from 'vue'
import { NotFound, List, Stream, Upload } from './pages'

const splitPath = pathStr => pathStr.split('/').filter(s => !!s)
const nestedViews = {
  list: {
    comp: List,
    props: () => ({}),
  },
  stream: {
    comp: Stream,
    props: pathArr => (pathArr[1] ? { id: pathArr[1] } : {}),
  },
  upload: {
    comp: Upload,
    props: () => ({}),
  },
}

const app = new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname,
  },
  computed: {
    ViewObject() {
      if (this.currentRoute === '/') return nestedViews.list;

      const split = splitPath(this.currentRoute)
      console.log(split);
      const key = Object.keys(nestedViews).find(v => v === split[0])

      return key && nestedViews[key]
    },
  },
  render(h) {
    console.log(this.ViewObject)
    const vo = this.ViewObject
    const pathArr = splitPath(this.currentRoute)

    if (vo) {
      return h(vo.comp, vo.props(pathArr))
    }

    return h(NotFound)
  },
})

window.addEventListener('popstate', () => {
  app.currentRoute = window.location.pathname
})
