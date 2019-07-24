<template>
  <aside :class="cn">
    <h2>File Manifest</h2>
    <div :class="filtersCN">
      <Checkbox checked>Videos</Checkbox>
      <Checkbox disabled :checked="false">
        Documents
      </Checkbox>
    </div>
  </aside>
</template>

<script>
import { css } from 'emotion'
import Checkbox from '@components/Checkbox.vue'
import { leftSidebarWidth, tertiaryColor } from '../../util'

const cn = css`
  height: 100%;
  width: ${leftSidebarWidth};
  padding: 0 1rem;
  background-color: ${tertiaryColor};
  color: #fff;
`

const filtersCN = css`
  padding: 0 1.5rem;
`

export default {
  components: {
    Checkbox,
  },
  data() {
    return {
      cn,
      filtersCN,
    }
  },
}
</script>
