<template>
    <aside :class="cn">
        <div>fake comment list</div>
        <div>
            <Input v-model="text" />
            <i class="fas fa-cogs fa-md" style="color: #fff;"></i>
            <button>Chat</button>
        </div>
    </aside>
</template>

<script>
import { css } from 'emotion'
import Input from './Input.vue'
import {
    rightSidebarWidth,
} from '../util'

const cn = css`
    height: 100%;
    width: ${rightSidebarWidth};
    padding: 1rem;
    border-left: .1rem solid #d8d8d8;
`

export default {
    components: {
        Input,
    },
    data () {
        return {
            cn,
        };
    },
}
</script>
