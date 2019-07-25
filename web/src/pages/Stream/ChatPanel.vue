<script>
import { css } from 'emotion'
import Button from '@components/Button.vue'
import Input from '@components/Input.vue'
import streamStore from '@store/stream'
import ChatMessage from './ChatMessage.vue'
import { primaryColor, redColor, rightSidebarWidth } from '../../util'

const actionsCN = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  color: ${primaryColor};
`

const formCN = css`
  padding: 1rem 1rem 2rem;
  border-top: 0.1rem solid #d8d8d8;
  font-size: 1.2rem;
  color: ${redColor};
`

const listCN = css`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

const messagesCN = css`
  flex: 1;
  padding: 1rem 1rem 0;
  overflow-y: scroll;
`

const cn = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${rightSidebarWidth};
  border-left: 0.1rem solid #d8d8d8;
`

export default {
  components: {
    Button,
    ChatMessage,
    Input,
  },
  data() {
    return {
      actionsCN,
      cn,
      errorText: '',
      formCN,
      listCN,
      messagesCN,
      streamState: streamStore.state,
      scrolledUp: false,
      text: '',
    }
  },
  directives: {
    'position-scroll': {
      inserted: function(el, binding) {
        el.addEventListener('scroll', binding.arg)
        el.scrollTop = el.scrollHeight
      },
      unbind: function(el, binding) {
        el.removeEventListener('scroll', binding.arg)
      },
    },
  },
  methods: {
    handleScroll: function(e) {
      const target = e.target || {}
      this.scrolledUp = !(target.scrollTop + target.clientHeight === target.scrollHeight)
    },
    handleSubmit: function() {
      const t = this.text
      const el = this.$refs.scrollElement

      this.text = ''
      this.streamState.comments.push({ content: t, user: 'sjoyal' })

      if (el && !this.scrolledUp) {
        this.$nextTick(function() {
          el.scrollTop = el.scrollHeight
        })
      }
    },
    toggleSetup: function() {
      alert('setup toggled')
    },
  },
}
</script>

<template>
  <aside :class="cn">
    <div v-position-scroll:[handleScroll] ref="scrollElement" :class="messagesCN">
      <p v-if="!streamState.comments.length"><em>Get the comments started...</em></p>
      <h3 v-else><strong>Comments</strong></h3>
      <ul :class="listCN">
        <ChatMessage
          v-for="(message, i) in streamState.comments"
          :key="`${message.user}_${i}`"
          :message="message"
        />
      </ul>
    </div>
    <div :class="formCN">
      <div>{{ errorText || '&nbsp;' }}</div>
      <Input v-model="text" placeholder="Add comment" />
      <div :class="actionsCN">
        <i @click="toggleSetup" class="fas fa-cogs fa-2x"></i>
        <Button @click="handleSubmit" :disabled="!text">Post</Button>
      </div>
    </div>
  </aside>
</template>
