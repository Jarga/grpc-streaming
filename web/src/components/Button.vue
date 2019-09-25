<script>
import { css } from 'emotion'
import { primaryColor, secondaryColor, hoverPrimaryColor } from '../util'

const baseCN = css`
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 0.3rem;
  background-color: ${primaryColor};
  color: #fff;
  outline: none;
  &:disabled {
    opacity: 0.4;
  }
  &:hover {
    background-color: ${hoverPrimaryColor};
    cursor: pointer;
    &:disabled {
      background-color: ${primaryColor};
      cursor: default;
    }
  }
  &:active {
    background-color: ${secondaryColor};
  }
`

export default {
  data() {
    return {
      cn: css`
        ${baseCN},
        ${this.styleOverride}
      `,
    }
  },
  props: {
    disabled: Boolean,
    styleOverride: String,
  },
}
</script>

<template>
  <button @click="$emit('click')" :disabled="disabled" :class="cn">
    <slot></slot>
  </button>
</template>
