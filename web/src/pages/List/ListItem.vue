<template>
  <li :class="[className, cn]">
    <div>
      <a :href="`stream/${file.id}`" :class="titleCN">{{ file.filename }}</a>
    </div>
    <div :class="metaCN">{{ file.date }}</div>
  </li>
</template>

<script>
import { css } from 'emotion'
import { secondaryColor } from '../../util'

const cn = css`
  width: 100%;
  padding: 0.8rem 1.5rem;
  &:hover {
    background-color: #f1f1f1;
  }
`

const titleCN = css`
  width: 100%;
  font-size: 2rem;
  color: ${secondaryColor};
  text-decoration: none;
  &:hover {
    font-weight: 600;
  }
`

const metaCN = css`
  font-size: 1.6rem;
`

export default {
  data() {
    return {
      cn,
      titleCN,
      metaCN,
    }
  },
  props: {
    className: String,
    file: Object,
  },
}
</script>
