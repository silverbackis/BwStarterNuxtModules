<template>
  <option :value="option.value" v-bind="option.attr">
    {{ option.label }}
  </option>
</template>

<script>
export default {
  props: {
    option: {
      type: Object,
      required: false,
      default: null
    }
  }
}
</script>
