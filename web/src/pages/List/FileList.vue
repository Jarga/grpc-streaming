<template>
  <section :class="cn">
    <ul :class="listCN">
      <ListItem v-for="file in files" :key="file.id" :file="file" :className="propCN" />
    </ul>
  </section>
</template>

<script>
import { css } from 'emotion'
import ListItem from './ListItem.vue'
import { leftSidebarWidth } from '../../util'

const cn = css`
  height: 100%;
  width: calc(100% - ${leftSidebarWidth});
  overflow-y: scroll;
`

const listCN = css`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style-type: none;
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
      files: [
        { id: 1, date: '7-24-2019', filename: 'test.mp4' },
        { id: 2, date: '7-24-2019', filename: 'test2.mp4' },
        { id: 3, date: '7-24-2019', filename: 'test3.mp4' },
      ],
      listCN,
      propCN,
    }
  },
}
</script>
