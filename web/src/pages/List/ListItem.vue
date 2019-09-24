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
  computed: {
    date() {
      const doubleQuotedDateString = this.file.created_at // -____-
      const slice = doubleQuotedDateString.slice(1, -1)

      // lol
      const d = new Date(slice)
      const month = d.getMonth() + 1
      const date = d.getDate()
      const year = d.getFullYear()
      const hour = d.getHours() + 1
      const minutes = d.getMinutes()
      const seconds = d.getSeconds()

      return `${month}-${date}-${year} ${hour <= 12 ? hour : hour - 12}:${minutes}:${seconds} ${
        hour > 12 ? 'pm' : 'am'
      }`
    },
    href() {
        const isStream = this.file.is_stream
        let href = `stream/${this.file.video_id}`

        if (isStream) {
            href = `${href}?isStream=true`
        }

        return href
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
      <a :href="href" :class="titleCN">{{ file.file_name }}</a>
    </div>
    <div :class="metaCN">{{ date }}</div>
  </li>
</template>
