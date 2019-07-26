<script>
import { css } from 'emotion'
import Button from '@components/Button.vue'
import Header from '@components/Header.vue'
import uploadStore from '@store/upload'
import { secondaryColor } from '../../util'

const buttonCN = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background-color: #e8e8e8;
  color: ${secondaryColor};
  font-size: 2.4rem;
  opacity: 0.6;
  outline: none;
  &:hover {
    opacity: 1;
    cursor: pointer;
  }
`

const mainCN = css`
  height: calc(100vh - 25rem);
  width: calc(100vw - 40rem);
  margin: 10rem 20rem;
`

const previewCN = css`
  height: 100%;
  width: 100%;
  background-color: #333;
`

const rootCN = css`
  height: 100%;
  width: 100%;
`

export default {
  components: {
    Button,
    Header,
  },
  data() {
    return {
      buttonCN,
      mainCN,
      previewCN,
      rootCN,
      uploadState: uploadStore.state,
    }
  },
  methods: {
    handleClick() {
      uploadStore.init()
    },
  },
}
</script>

<template>
  <div :class="rootCN">
    <Header />
    <main :class="mainCN">
      <video
        autoplay
        controls
        v-if="uploadState.srcObj"
        :src-object.prop.camel="uploadState.srcObj"
        :class="previewCN"
      ></video>
      <button v-else @click="handleClick" :class="buttonCN">Start Streaming</button>
    </main>
  </div>
</template>
