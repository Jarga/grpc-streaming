<template>
  <section :class="wrapperCN">
    <div v-if="!streaming" :class="offlineCN">OFFLINE</div>
    <div v-else :class="streamCN">
      <span>put something here</span>
    </div>
  </section>
</template>

<script>
import { css } from 'emotion'
import { playerPadding, rightSidebarWidth } from '../util'

const streamCN = css`
  color: #fff;
`

const offlineCN = css`
  height: 100%;
  padding: 1rem;
  font-size: 1.4rem;
  background-color: #333;
  color: #fff;
  text-align: right;
`

const wrapperCN = css`
    height: 100%;
    width: calc(100% - ${rightSidebarWidth});
    padding: ${playerPadding}
`

export default {
  data() {
    return {
      streamCN,
      offlineCN,
      wrapperCN,
    }
  },
  props: ['streaming'],
}
</script>
