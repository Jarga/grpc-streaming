<template>
  <a :href="href" :class="[cn, isActive ? activeCN : '']">
    <slot></slot>
  </a>
</template>

<script>
import { css } from 'emotion'
import { hoverPrimaryColor, primaryColor, secondaryColor } from '../util'

const cn = css`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 1.5rem;
  border-bottom: 0.4rem solid ${primaryColor};
  color: #fff;
  text-decoration: none;
  &:hover {
    border-color: ${secondaryColor};
    background-color: ${hoverPrimaryColor};
    cursor: pointer;
  }
`

const activeCN = css`
  border-color: ${secondaryColor};
`

export default {
  data() {
    return {
      activeCN,
      cn,
    }
  },
  computed: {
    isActive: function() {
      const evaluator = this.evaluateActive
      const regex = this.regex

      return evaluator(regex)
    },
  },
  props: {
    evaluateActive: Function,
    href: String,
    regex: RegExp,
  },
}
</script>
