import Vue from 'vue'
import { name as entitiesModuleName } from '../entities'
import { join } from 'path'

export const name = [ '_content' ]

export const store = (rootNamespace) => {
  return {
    state: () => ({
      currentRoute: null,
      routes: {},
      currentLayout: null,
      layouts: {}
    }),
    getters: {
      getCurrentRoute: state => {
        return state.currentRoute
      },
      getContentAtDepth: (state, getters, rootState, rootGetters) => (depth, loadedRoute) => {
        const loadedRouteObject = state.routes[ loadedRoute ]
        if (!loadedRouteObject) {
          return null
        }
        let content = loadedRouteObject.structure[ depth ] || null
        if (content && content[ '@id' ]) {
          const module = join(rootNamespace, ...entitiesModuleName)
          const entityContent = rootGetters[ `${module}/getEntity` ](content[ '@id' ])
          if (entityContent) {
            content = entityContent
          }
        }
        return content
      },
      getLayout: state => (id) => {
        return (id ? state.layouts[ id ] : state.layouts[ state.currentLayout ]) || { timestamp: null, structure: null }
      }
    },
    mutations: {
      setRoute (state, { route, data, redirectedFrom, id }) {
        Vue.set(state.routes, route, { timestamp: new Date(), structure: data, redirectedFrom, id })
      },
      setLayout (state, { id, data }) {
        Vue.set(state.layouts, id, { timestamp: new Date(), structure: data })
      },
      setCurrentRoute (state, route) {
        state.currentRoute = route
      },
      setCurrentLayout (state, layout) {
        state.currentLayout = layout
      }
    }
  }
}

export default {
  name,
  store
}
