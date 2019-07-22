<template>
    <input
        @input="$emit('input', $event.target.value)"
        :value="text"
        :class="cn"
        placeholder="Send a message"
    />
</template>

<script>
import { css } from 'emotion'
import {
    rightSidebarWidth,
} from '../util'

const cn = css`
    height: 3.5rem;
    width: 100%;
    line-height: 3.5rem;
    border: .1rem solid #d8d8d8;
    border-radius: .3rem;
`

export default {
    data () {
        return {
            cn,
        };
    },
    props: ['text'],

}
</script>
