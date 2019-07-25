<script>
import { css } from 'emotion'
import { primaryColor, rightSidebarWidth } from '../util'

const cn = css`
  height: 3.5rem;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.4rem 0.8rem;
  line-height: 3.5rem;
  border: 0.1rem solid #d8d8d8;
  border-radius: 0.3rem;
  outline: none;

  &:focus {
    box-shadow: 0 0 0.5rem ${primaryColor};
  }
`

export default {
  data() {
    return {
      cn,
    }
  },
  props: {
    placeholder: String,
    value: {
      type: String,
      required: true,
    },
  },
}
</script>

<template>
  <input
    @input="$emit('input', $event.target.value)"
    :value="value"
    :class="cn"
    :placeholder="placeholder"
  />
</template>
