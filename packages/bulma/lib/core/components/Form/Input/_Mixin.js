import Wrapper from './_Wrapper'
import InputCommonMixin from '~/.nuxt/bwstarter/components/Form/Input/_CommonMixin'

export default {
  mixins: [InputCommonMixin],
  components: {
    Wrapper
  },
  computed: {
    wrapperData() {
      return {
        inputId: this.inputId,
        label: this.label,
        validating: this.validating,
        valid: this.valid,
        errors: this.errors,
        displayErrors:
          this.displayErrors && this.firstRepeatInput.displayErrors,
        select:
          this.inputType === 'choice' && !this.input.vars.expanded
            ? this.input.vars.multiple
              ? 'multiple'
              : 'single'
            : false,
        hidden: this.input.hidden || this.inputType === 'hidden'
      }
    }
  }
}
