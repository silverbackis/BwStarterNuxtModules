export default {
  middleware: ['routeLoader'],
  data: () => ({
    pageData: null
  }),
  head () {
    if (!this.pageData) {
      return {}
    }
    return {
      title: this.title,
      meta: [
        { name: 'description', content: this.metaDescription }
      ]
    }
  },
  props: {
    componentGroup: {
      type: Object,
      required: false
    },
    nested: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    title () {
      return this.pageData.title
    },
    metaDescription () {
      return this.pageData.metaDescription
    },
    depth () {
      return this.$vnode.data.nuxtChildDepth
    },
    childKey () {
      console.log('childKey', this.$route.params['page' + (this.depth+1)])
      return this.$route.params['page' + (this.depth+1)]
    }
  },
  transition () {
    return {
      name: 'page',
      mode: 'out-in'
    }
  },
  created() {
    this.pageData = this.$bwstarter.$storage.get('getContent', [this.depth])
  }
}
