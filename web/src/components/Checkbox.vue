<script>
import { css } from 'emotion'
import { primaryColor, secondaryColor } from '../util'

const cn = css`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  line-height: 1.6rem;
`

const inputCN = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  margin: 0;
  overflow: hidden;
  opacity: 0;
`

const boxCN = css`
  position: relative;
  display: block;
  height: 1.6rem;
  width: 1.6rem;
  margin-right: 0.8rem;
  background-color: #fff;
  border-radius: 0.2rem;
`

const checkedCN = css`
    background-color: ${primaryColor};
    &::after {
        position: absolute;
        top: .1rem;
        left: .5rem;
        width: .6rem;
        height: 1.1rem;
        content: "";
        border-color: ${secondaryColor};
        border-style: solid;
        border-top: 0;
        border-right-width: 2px;
        border-bottom-width: 2px;
        border-left: 0;
        transform: rotate(45deg);
    }
}
`

const disabledCN = css`
  opacity: 0.6;
`

export default {
  data() {
    return {
      boxCN,
      checkedCN,
      cn,
      disabledCN,
      inputCN,
    }
  },
  methods: {
    handleClick(e) {
      this.$emit('change', !this.checked)
    },
  },
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
    disabled: Boolean,
  },
}
</script>

<template>
  <div :class="cn">
    <input type="checkbox" :checked="checked" :disabled="disabled" :class="inputCN" />
    <div
      @click="handleClick"
      :class="[boxCN, checked ? checkedCN : '', disabled ? disabledCN : '']"
    />
    <span><slot></slot></span>
  </div>
</template>
