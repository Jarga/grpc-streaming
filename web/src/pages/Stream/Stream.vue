<template>
  <div :class="rootCN">
    <Header />
    <main :class="mainCN">
      <Player />
      <ChatPanel />
    </main>
  </div>
</template>

<script>
import { css } from 'emotion'
import Header from '@components/Header.vue'
import ChatPanel from './ChatPanel.vue'
import Player from './Player.vue'
import { navHeight } from '../../util'

const mainCN = css`
  display: flex;
  height: calc(100% - ${navHeight});
`

const rootCN = css`
  height: 100%;
  width: 100%;
`

export default {
  components: {
    ChatPanel,
    Header,
    Player,
  },
  data() {
    return {
      mainCN,
      rootCN,
    }
  },
  props: {
    id: String,
  },
}
</script>
