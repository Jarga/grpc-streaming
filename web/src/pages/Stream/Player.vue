<script>
import { css } from 'emotion'
import streamStore from '@store/stream'
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

const overlayCN = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #333;
  font-size: 1.8rem;
`

const playerCN = css`
  height: 100%;
  width: 100%;
`

const streamCN = css`
  height: calc(100% - ${playerPadding});
  font-size: 1.4rem;
  background-color: #333;
  color: #fff;
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
      overlayCN,
      playerCN,
      streamCN,
      wrapperCN,
      streamState: streamStore.state,
    }
  },
}
</script>

<template>
  <section :class="wrapperCN">
    <a href="/" :class="breadcrumbCN">
      <i class="fas fa-angle-left fa-lg"></i>
      &nbsp;
      <span>Back to List</span>
    </a>
    <div :class="streamCN">
      <div
        v-if="streamState.error"
        :class="overlayCN"
      >
        An error occurred
      </div>
      <video
        autoplay
        controls
        :src="streamState.src"
        :class="playerCN"
      ></video>
    </div>
  </section>
</template>
