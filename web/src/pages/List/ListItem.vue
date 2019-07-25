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
    file: {
      type: Object,
      required: true,
    },
  },
}
</script>

<template>
  <li :class="[cn, className || '']">
    <div>
      <a :href="`stream/${file.video_id}`" :class="titleCN">{{ file.file_name }}</a>
    </div>
    <div :class="metaCN">TODO: add date here!</div>
  </li>
</template>
