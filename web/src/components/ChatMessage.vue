<template>
  <li :class="cn">
    <span :class="userCN"
      ><strong>{{ message.user }}:</strong></span
    >
    &nbsp;
    <span>{{ message.content }}</span>
  </li>
</template>

<script>
import { css } from 'emotion'

const cn = css`
  margin: 0.5rem 0;
  padding: 0;
  font-size: 1.2rem;
  overflow-wrap: break-word;
`

const userCN = css`
  color: #dc0000;
`

export default {
  data() {
    return {
      cn,
      userCN,
    }
  },
  props: {
    message: Object,
  },
}
</script>
