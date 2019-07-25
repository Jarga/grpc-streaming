<script>
import Header from '@components/Header.vue'

export default {
  components: {
    Header,
  },
  data() {
    return {
      text: 'Upload',
    }
  },
}
</script>

<template>
  <div>
    <Header />
    <span>This is the {{ text }} page</span>
  </div>
</template>
