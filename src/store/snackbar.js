export const state = () => ({
  isErr: false,
  successSnackbar: false,
  successMessage: '',
  errorSnackbar: false,
  errorMessage: '',
})

export const mutations = {
  setIsErr(state, isErr) {
    state.isErr = isErr
  },
  setSuccessMessage(state, successMessage) {
    state.successMessage = successMessage
  },
  setErrorMessage(state, errorMessage) {
    state.errorMessage = errorMessage
  },
  setSuccessSnackbar(state, successSnackbar) {
    state.successSnackbar = successSnackbar
  },
  setErrorSnackbar(state, errorSnackbar) {
    state.errorSnackbar = errorSnackbar
  },
}

export const actions = {
  // エラースナックバー表示
  displayErrorSnackbar({ commit }, message) {
    commit('setIsErr', true)
    commit('setErrorSnackbar', true)
    commit('setErrorMessage', message)
  },
  // 成功スナックバー表示
  displaySuccessSnackbar({ commit }, message) {
    commit('setIsErr', false)
    commit('setSuccessSnackbar', true)
    commit('setSuccessMessage', message)
  },
}
