import Vue from 'vue'
import { CancelToken } from 'axios'
import _debounce from 'lodash/debounce'

export const state = () => ({
  endpoints: {},
  submitting: {},
  waitingToSubmit: {}
})

export const mutations = {
  initAdminInput(state, { componentId, componentField, model, postSaveFn }) {
    if (!state.endpoints[ componentId ]) {
      Vue.set(state.endpoints, componentId, {
        inputs: {}
      })
    }
    Vue.set(state.endpoints[ componentId ].inputs, componentField, {
      savedModel: model,
      model,
      postSaveFn
    })
  },
  setModel(state, { componentId, componentField, model }) {
    let field = state.endpoints[ componentId ].inputs[ componentField ]
    field.model = model
  },
  updateComponent(state, data) {
    const id = data[ '@id' ]
    let endpoint = state.endpoints[ id ]
    if (endpoint) {
      const componentFields = Object.keys(data)
      componentFields.forEach((field) => {
        if (endpoint.inputs[ field ]) {
          Vue.set(endpoint.inputs[ field ], 'savedModel', data[ field ])
        }
      })
    }
  },
  destroyAdminInput(state, { componentId, componentField }) {
    if (state.endpoints[ componentId ]) {
      Vue.delete(state.endpoints[ componentId ].inputs, componentField)
      if (!Object.keys(state.endpoints[ componentId ].inputs).length) {
        Vue.delete(state.endpoints, componentId)
      }
    }
  },
  setSubmitting(state, { endpointKey, value }) {
    Vue.set(state.submitting, endpointKey, value)
  },
  deleteSubmitting(state, endpointKey) {
    Vue.delete(state.submitting, endpointKey)
  },
  setWaitingToSubmit(state, { endpointKey, value = true }) {
    Vue.set(state.waitingToSubmit, endpointKey, value)
  },
  deleteWaitingToSubmit(state, endpointKey) {
    Vue.delete(state.waitingToSubmit, endpointKey)
  }
}

export const getters = {
  isModified: (state) => (endpointKey = null) => {
    const checkEndpoint = (endpointKey) => {
      const inputs = state.endpoints[ endpointKey ].inputs
      return Object.keys(inputs).some((inputKey) => {
        const input = inputs[ inputKey ]
        return input.model !== input.savedModel
      })
    }
    if (!endpointKey) {
      return Object.keys(state.endpoints).some((endpointKey) => {
        return checkEndpoint(endpointKey)
      })
    }
    return checkEndpoint(endpointKey)
  },
  isSubmitting: (state) => (endpointKey = null) => {
    if (!endpointKey) {
      return Object.keys(state.submitting).length > 0 || Object.keys(state.waitingToSubmit).length > 0
    }
    return Boolean(state.submitting[ endpointKey ]) || Boolean(state.waitingToSubmit[ endpointKey ])
  }
}

export const actions = {
  modifiedEndpoints({ state }) {
    let endpoints = {}
    Object.keys(state.endpoints).some((endpointKey) => {
      const stateInputs = state.endpoints[ endpointKey ].inputs
      const modifiedInputKeys = Object.keys(stateInputs).filter((inputKey) => {
        const input = stateInputs[ inputKey ]
        return input.model !== input.savedModel
      })
      if (modifiedInputKeys.length) {
        const endpoint = {}
        modifiedInputKeys.forEach((inputKey) => {
          endpoint[ inputKey ] = stateInputs[ inputKey ].model
        })
        endpoints[ endpointKey ] = endpoint
      }
    })
    return endpoints
  },
  async save({ state, dispatch, commit }, patchEndpoints) {
    if (!patchEndpoints) {
      patchEndpoints = await dispatch('modifiedEndpoints')
    }
    // Cancel patches we are going to send again if they still exist (therefore not completed)
    Object.keys(state.submitting).forEach((submittingKey) => {
      if (patchEndpoints[ submittingKey ]) {
        state.submitting[ submittingKey ].cancel('Original request cancelled, a new request will be made')
      }
    })

    // Setup new patch requests
    Object.keys(patchEndpoints).forEach((endpointKey) => {
      // create a cancel token for the request
      const cancel = CancelToken.source()
      commit('setSubmitting', { endpointKey, value: cancel })

      this.$axios
        .put(endpointKey, patchEndpoints[ endpointKey ], { cancelToken: cancel.token })
        .then(({ data }) => {
          commit('updateComponent', data)
          commit('deleteSubmitting', endpointKey)
        })
    })
  },
  async debouncedSave({ dispatch, commit }) {
    let patchEndpoints = await dispatch('modifiedEndpoints')
    const saveDebounce = _debounce(async () => {
      dispatch('save', patchEndpoints)
      Object.keys(patchEndpoints).forEach((endpointKey) => {
        commit('deleteWaitingToSubmit', endpointKey)
      })
    }, 250)
    Object.keys(patchEndpoints).forEach((endpointKey) => {
      commit('setWaitingToSubmit', { endpointKey, value: saveDebounce })
    })
    saveDebounce();
  }
}
