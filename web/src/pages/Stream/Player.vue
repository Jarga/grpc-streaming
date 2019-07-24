<template>
  <section :class="wrapperCN">
    <a href="/" :class="breadcrumbCN">
      <i class="fas fa-angle-left fa-lg"></i>
      &nbsp;
      <span>Back to List</span>
    </a>
    <div v-if="!streaming" :class="offlineCN">OFFLINE</div>
    <div v-else :class="streamCN">
      <span>put something here</span>
    </div>
  </section>
</template>

<script>
import { css } from 'emotion'
import { playerPadding, rightSidebarWidth, secondaryColor } from '../../util'

const breadcrumbCN = css`
  display: inline-flex;
  align-items: center;
  height: ${playerPadding};
  line-height: ${playerPadding};
  font-weight: 600;
  text-decoration: none;
  color: ${secondaryColor};
`

const streamCN = css`
  color: #fff;
`

const offlineCN = css`
  height: calc(100% - ${playerPadding});
  padding: 1rem;
  font-size: 1.4rem;
  background-color: #333;
  color: #fff;
  text-align: right;
`

const wrapperCN = css`
  height: 100%;
  width: calc(100% - ${rightSidebarWidth});
  padding: ${playerPadding};
`

export default {
  data() {
    return {
      breadcrumbCN,
      streamCN,
      offlineCN,
      wrapperCN,
    }
  },
  props: {
    streaming: Boolean,
  },
}
</script>
