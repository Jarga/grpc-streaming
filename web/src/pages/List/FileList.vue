<script>
import { css } from 'emotion'
import ListItem from './ListItem.vue'
import { leftSidebarWidth, primaryColor } from '../../util'

const cn = css`
  height: 100%;
  width: calc(100% - ${leftSidebarWidth});
  overflow-y: scroll;
`

const errorCN = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  font-size: 1.8rem;
`

const listCN = css`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style-type: none;
`

const loadingCN = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding-bottom: 5%;
  &::after {
    content: ' ';
    display: block;
    border-radius: 50%;
    width: 0;
    height: 0;
    box-sizing: border-box;
    border: 7.5rem solid #fff;
    border-color: ${primaryColor} transparent ${primaryColor} transparent;
    animation: lds-hourglass 1.2s infinite;
  }
  @keyframes lds-hourglass {
    0% {
      transform: rotate(0);
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    50% {
      transform: rotate(900deg);
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    100% {
      transform: rotate(1800deg);
    }
  }
`

const propCN = css`
  border-bottom: 0.1rem solid #e5e5e5;
  &:last-child {
    border-bottom: none;
  }
`

export default {
  components: {
    ListItem,
  },
  data() {
    return {
      cn,
      errorCN,
      listCN,
      loadingCN,
      propCN,
    }
  },
  props: {
    files: {
      type: Object,
      required: true,
    },
  },
}
</script>

<template>
  <section :class="cn">
    <div v-if="files.error" :class="errorCN">
      {{ files.error }}
    </div>
    <div v-else-if="files.loading" :class="loadingCN" />
    <ul v-else :class="listCN">
      <ListItem v-for="file in files.data" :key="file.file_id" :file="file" :className="propCN" />
    </ul>
  </section>
</template>
