<template>
  <div :class="['page', pageClass]">
    <bulma-components
      v-if="
        realPageData &&
          realPageData.componentLocations &&
          realPageData.componentLocations.length
      "
      :page-data="realPageData"
      :dynamic-data="dynamicData"
      :depth="depth"
      :nested="nested"
    />
    <nuxt-child v-else-if="childKey" :key="childKey" />
    <h1 v-else>No components or children configured for this page</h1>
  </div>
</template>

<script>
import BulmaComponents from '../components/Components'
import pageMixin from '../../components/pageMixin'

export default {
  components: {
    BulmaComponents
  },
  mixins: [pageMixin]
}
</script>
