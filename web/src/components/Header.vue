<script>
import { css } from 'emotion'
import NavLink from './NavLink.vue'
import { primaryColor, navHeight } from '../util'

const cn = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: ${navHeight};
  font-size: 1.6rem;
  background-color: ${primaryColor};
  color: #fff;
`

const leftCN = css`
  display: flex;
  align-items: center;
  height: 100%;
`

export default {
  components: {
    NavLink,
  },
  data() {
    return {
      cn,
      leftCN,
      pathname: window.location.pathname,
    }
  },
}
</script>

<template>
  <header :class="cn">
    <div :class="leftCN">
      <i class="far fa-comment-alt fa-lg"></i>
      &nbsp; &nbsp;
      <NavLink href="/" :evaluateActive="regex => regex.test(pathname)" :regex="/^\/$|^\/stream/">
        Watch
      </NavLink>
      <NavLink href="/upload" :evaluateActive="regex => regex.test(pathname)" :regex="/^\/upload/">
        Upload
      </NavLink>
    </div>
    <div>
      <i class="far fa-user fa-lg"></i>
    </div>
  </header>
</template>
