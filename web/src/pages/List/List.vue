<script>
import { css } from 'emotion'
import Header from '@components/Header.vue'
import FileList from './FileList.vue'
import FilterPanel from './FilterPanel.vue'
import { navHeight } from '../../util'

const initialState = {
  data: [],
  error: null,
  loading: false,
}

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
      files: initialState,
    }
  },
  methods: {
    fetchFiles() {
      const f = fetch('api/videos/list', {
        method: 'POST',
        body: JSON.stringify({ offset: 0 }),
        headers: { 'Content-Type': 'application/json' },
      })

      f.then(response => {
        if (!response.ok) {
          throw new Error('Error retrieving file list')
        }
        return response.text()
      }).then(
        results => {
          const data = results
            .split(/\r?\n/)
            .filter(r => !!r)
            .map(r => JSON.parse(r))

          this.files = {
            ...initialState,
            data,
          }
        },
        error => {
          this.files = {
            ...initialState,
            error,
          }
        }
      )
    },
  },
  mounted() {
    this.files = {
      ...initialState,
      loading: true,
    }

    // simulate some latency bc this shit is too fast right meow and looks like legit fake data
    setTimeout(this.fetchFiles, 500)
  },
}
</script>

<template>
  <div :class="rootCN">
    <Header />
    <main :class="mainCN">
      <FilterPanel />
      <FileList :files="files" />
    </main>
  </div>
</template>
