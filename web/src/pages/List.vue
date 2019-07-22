<template>
    <div>
        <Header />
        <span>This is the {{ text }} page</span>
    </div>
</template>

<script>
import Header from '../components/Header.vue'

export default {
    components: {
        Header,
    },
    data () {
        return {
            text: 'List'
        };
    },
}
</script>
