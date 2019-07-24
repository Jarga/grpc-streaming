<template>
  <div :class="rootCN">
    <Header />
    <main :class="mainCN">
      <FilterPanel />
      <FileList />
    </main>
  </div>
</template>

<script>
import { css } from 'emotion'
import Header from '@components/Header.vue'
import FileList from './FileList.vue'
import FilterPanel from './FilterPanel.vue'
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
    FileList,
    FilterPanel,
    Header,
  },
  data() {
    return {
      mainCN,
      rootCN,
    }
  },
}
</script>
