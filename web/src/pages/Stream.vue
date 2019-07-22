<template>
    <div :class="rootCN">
        <Header />
        <main :class="mainCN">
            <Player />
            <Chat />
        </main>
    </div>
</template>

<script>
import { css } from 'emotion'
import Chat from '../components/Chat.vue'
import Header from '../components/Header.vue'
import Player from '../components/Player.vue'
import { navHeight } from '../util'

export default {
    components: {
        Chat,
        Header,
        Player,
    },
    data () {
        return {
            mainCN: css`
                display: flex;
                height: calc(100% - ${navHeight});
            `,
            rootCN: css`
                height: 100%;
                width: 100%;
            `,
        };
    },
}
</script>
