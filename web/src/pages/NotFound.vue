<script>
import { css } from 'emotion'
import Button from '@components/Button.vue'
import { primaryColor, tertiaryColor } from '../util'

const cn = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding-bottom: 15vh;
  color: ${primaryColor};
`

const textCN = css`
  text-align: center;
  color: ${tertiaryColor};
`

export default {
  components: {
    Button,
  },
  data() {
    return {
      cn,
      textCN,
    }
  },
  methods: {
    handleClick() {
      window.location.href = '/'
    },
  },
}
</script>

<template>
  <div :class="cn">
    <i class="fas fa-map-marked fa-10x"></i>
    <div :class="textCN">
      <h2>Looks Like You're Lost...</h2>
      <Button @click="handleClick">Start Over</Button>
    </div>
  </div>
</template>
