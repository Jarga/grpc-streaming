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
      listCN,
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
    <div
        v-if="files.error || files.loading"
        :class="['base', files.loading ? 'loading' : '']"
    >
        {{ files.error || 'Loading...' }}
    </div>
    <ul v-else :class="listCN">
      <ListItem v-for="file in files.data" :key="file.file_id" :file="file" :className="propCN" />
    </ul>
  </section>
</template>
