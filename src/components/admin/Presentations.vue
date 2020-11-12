<template lang="pug">
div
  v-data-table.elevation-1(
    :headers='presentationHeaders',
    :items='presentations',
    sort-by='enteringOn',
    sort-desc,
    :search='searchPresentation',
    :footer-props='{ "items-per-page-options": [5, 20, 50, -1], "items-per-page-text": "表示件数:" }',
    :options='options'
  )
    template(v-slot:top)
      v-toolbar(flat, color='grey lighten-3')
        v-spacer
        v-text-field(v-model='searchPresentation', append-icon='mdi-magnify', label='検索', single-line, hide-details)
        v-spacer

        //- 参加者一覧ダイアログ
        v-dialog(v-model='presenterDialog', persistent, max-width='1200px')
          v-card
            v-card-actions
              v-spacer
              v-btn(color='grey darken-1', text, small, @click='closePresenterDialog')
                v-icon mdi-close
            v-card-title
              span.headline {{ currentDisplayPresentation.name }}
            //- 参加者テーブル
            v-card-subtitle 評価入力開始日: {{ $dayjs(currentDisplayPresentation.enteringOn).format("YYYY/M/D") }} 評価公開開始日: {{ $dayjs(currentDisplayPresentation.publishingOn).format("YYYY/M/D") }}
            v-data-table(
              :headers='presenterHeaders',
              :items='presenters',
              sort-by='presentingOn',
              sort-desc,
              :search='searchPresenter',
              :footer-props='{ "items-per-page-options": [5, 20, 50, -1], "items-per-page-text": "表示件数:" }',
              :options='options'
            )
              template(v-slot:top)
                v-toolbar(flat, color='grey lighten-3')
                  v-spacer
                  v-text-field(
                    v-model='searchPresenter',
                    append-icon='mdi-magnify',
                    label='Search',
                    single-line,
                    hide-details
                  )
                  v-spacer
                  //- 参加者編集ダイアログ
                  v-dialog(v-model='presenterEditDialog', persistent, max-width='500px')
                    v-card
                      v-card-actions
                        v-spacer
                        v-btn(color='grey darken-1', text, small, @click='closePresenterEditDialog')
                          v-icon mdi-close
                      v-card-title
                        span.headline {{ formTitle }}
                        v-card-text
                          v-container
                            v-form(ref='form', v-model='isFormValid')
                              v-row
                                v-col(cols='12')
                                  v-menu(
                                    v-model='menuPresentingOn',
                                    :close-on-content-click='false',
                                    :nudge-right='40',
                                    transition='scale-transition',
                                    offset-y,
                                    min-width='290px'
                                  )
                                    template(v-slot:activator='{ on, attrs }')
                                      v-text-field(
                                        append-icon='mdi-calendar',
                                        v-model='editedPresenterItem.presentingOn',
                                        label='*発表日',
                                        readonly,
                                        v-bind='attrs',
                                        v-on='on',
                                        required,
                                        :rules='[rules.required]'
                                      )
                                    v-date-picker(
                                      v-model='editedPresenterItem.presentingOn',
                                      @input='menuPresentingOn = false',
                                      locale='ja-jp',
                                      :day-format='(date) => new Date(date).getDate()'
                                    )
                                      v-spacer
                                      v-btn(text, color='black', @click='menuPresentingOn = false') キャンセル
                                v-col(cols='12')
                                  v-autocomplete(
                                    v-model='editedPresenterItem.presenterId',
                                    label='*発表者',
                                    :items='userSelectOptions',
                                    required,
                                    :rules='[rules.required]'
                                  )
                                v-col(cols='12')
                                  v-autocomplete(
                                    v-model='editedPresenterItem.primaryEvaluatorId',
                                    label='*一次評価者',
                                    :items='userSelectOptions',
                                    required,
                                    :rules='[rules.required, checkDuplicate]'
                                  )
                                v-col(cols='12')
                                  v-autocomplete(
                                    v-model='editedPresenterItem.secondaryEvaluatorId',
                                    label='*二次評価者',
                                    :items='userSelectOptions',
                                    :rules='[checkDuplicate]'
                                  )
                          small * は入力必須
                      v-card-actions
                        v-btn(
                          v-if='editedIndex !== -1',
                          color='blue darken-1',
                          text,
                          @click='deletePresenterConfirm(editedPresenterItem)'
                        ) 削除
                        v-spacer
                        v-btn(color='blue darken-1', text, @click='savePresenter', :disabled='!isFormValid') {{ formBtn }}
                    template(v-slot:activator='{ on, attrs }')
                      v-btn.mb-2(color='primary', dark, v-bind='attrs', v-on='on') 参加者を追加
                    //------ここまで 参加者編集ダイアログ ------
              template(v-slot:item.presentingOn='{ item }')
                span {{ $dayjs(item.presentingOn).format("YYYY/M/D") }}
              template(v-slot:item.presenterEditing='{ item }')
                v-icon.mr-2(v-show='currentDisplayPresentation.isEditable', small, @click='editPresenter(item)') mdi-pencil
              template(v-slot:item.presenterName='{ item }')
                span {{ item.presenterName }}({{ item.presenterNameIndex }})
              template(v-slot:item.primaryEvaluatorName='{ item }')
                span(v-if='item.primaryEvaluatorName') {{ item.primaryEvaluatorName }}({{ item.primaryEvaluatorNameIndex }})
              template(v-slot:item.secondaryEvaluatorName='{ item }')
                span(v-if='item.secondaryEvaluatorName') {{ item.secondaryEvaluatorName }}({{ item.secondaryEvaluatorNameIndex }})

        //- プレゼンテーション編集ダイアログ
        v-dialog(v-model='presentationEditDialog', persistent, max-width='500px')
          v-card
            v-card-actions
              v-spacer
              v-btn(color='grey darken-1', text, small, @click='closePresentationEditDialog')
                v-icon mdi-close
            v-card-title
              span.headline {{ formTitle }}
              v-card-text
                v-container
                  v-form(ref='form', v-model='isFormValid')
                    v-row
                      v-col(cols='12')
                        v-row
                          v-col(cols='12')
                            v-text-field(
                              v-model='editedPresentationItem.name',
                              label='*プレゼンテーション名',
                              required,
                              :rules='[rules.required]'
                            )
                          v-col(cols='12')
                            v-menu(
                              v-model='menuEnteringOn',
                              :close-on-content-click='false',
                              :nudge-right='40',
                              transition='scale-transition',
                              offset-y,
                              min-width='290px'
                            )
                              template(v-slot:activator='{ on, attrs }')
                                v-text-field(
                                  append-icon='mdi-calendar',
                                  v-model='editedPresentationItem.enteringOn',
                                  label='*評価開始日',
                                  readonly,
                                  v-bind='attrs',
                                  v-on='on',
                                  required,
                                  :rules='[rules.required]'
                                )
                              v-date-picker(
                                v-model='editedPresentationItem.enteringOn',
                                @input='menuEnteringOn = false',
                                locale='ja-jp',
                                :day-format='(date) => new Date(date).getDate()'
                              )
                                v-spacer
                                v-btn(text, color='black', @click='menuEnteringOn = false') キャンセル
                          v-col(cols='12', sm='6', md='12')
                            v-menu(
                              v-model='menuPublishingOn',
                              :close-on-content-click='false',
                              :nudge-right='40',
                              transition='scale-transition',
                              offset-y,
                              min-width='290px'
                            )
                              template(v-slot:activator='{ on, attrs }')
                                v-text-field(
                                  append-icon='mdi-calendar',
                                  v-model='editedPresentationItem.publishingOn',
                                  label='*公開開始日',
                                  readonly,
                                  v-bind='attrs',
                                  v-on='on',
                                  required,
                                  :rules='[rules.required]'
                                )
                              v-date-picker(
                                v-model='editedPresentationItem.publishingOn',
                                @input='menuPublishingOn = false',
                                locale='ja-jp',
                                :day-format='(date) => new Date(date).getDate()'
                              )
                                v-spacer
                                v-btn(text, color='black', @click='menuPublishingOn = false') キャンセル
                small * は入力必須
            v-card-actions
              v-btn(
                v-if='editedIndex !== -1',
                color='blue darken-1',
                text,
                @click='deletePresentationConfirm(editedPresentationItem)'
              ) 削除
              v-spacer
              v-btn(color='blue darken-1', text, @click='savePresentation', :disabled='!isFormValid') {{ formBtn }}
          template(v-slot:activator='{ on, attrs }')
            v-btn.mb-2(color='primary', dark, v-bind='attrs', v-on='on') プレゼンテーションを追加
    template(v-slot:item.status='{ item }')
      span(v-if='item.status === BEFORE_ENTERING') {{ $dayjs(item.enteringOn).format("YYYY/M/D") }}に開催
      span(v-else-if='item.status === BETWEEN_ENTERING_AND_PUBLISHING') 評価入力期間
      span(v-else-if='item.status === AFTER_PUBLISHING') 評価公開期間
    template(v-slot:item.enteringOn='{ item }')
      span {{ $dayjs(item.enteringOn).format("YYYY/M/D") }}
    template(v-slot:item.publishingOn='{ item }')
      span {{ $dayjs(item.publishingOn).format("YYYY/M/D") }}
    template(v-slot:item.presenterDetail='{ item }')
      v-icon.mr-2(@click='showPresentersDetail(item)') mdi-account-edit
    template(v-slot:item.presentationEditing='{ item }')
      v-icon.mr-2(v-show='item.isEditable', small, @click='editPresentation(item)') mdi-pencil
</template>

<script>
import { mapActions, mapState } from 'vuex'
import consts from '../../const/const.js'

export default {
  data: () => ({
    BEFORE_ENTERING: consts.BEFORE_ENTERING,
    BETWEEN_ENTERING_AND_PUBLISHING: consts.BETWEEN_ENTERING_AND_PUBLISHING,
    AFTER_PUBLISHING: consts.AFTER_PUBLISHING,
    selectedValue: '',
    searchPresentation: '',
    searchPresenter: '',
    presentationEditDialog: false,
    presenterDialog: false,
    presenterEditDialog: false,
    menuEnteringOn: false,
    menuPublishingOn: false,
    menuPresentingOn: false,
    options: {
      itemsPerPage: 20,
    },
    presentationHeaders: [
      {
        text: 'ステータス',
        align: 'center',
        sortable: true,
        value: 'status',
      },
      {
        text: 'プレゼンテーション名',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: '評価開始日',
        align: 'start',
        sortable: true,
        value: 'enteringOn',
      },
      {
        text: '公開開始日',
        align: 'center',
        sortable: true,
        value: 'publishingOn',
      },
      {
        text: '参加者編集',
        align: 'center',
        sortable: false,
        value: 'presenterDetail',
        width: '120',
      },
      { text: '編集', align: 'right', value: 'presentationEditing', sortable: false },
    ],
    presenterHeaders: [
      {
        text: '発表日',
        align: 'center',
        sortable: false,
        value: 'presentingOn',
      },
      {
        text: '発表者',
        align: 'center',
        sortable: false,
        value: 'presenterName',
      },
      {
        text: '一時評価者',
        align: 'center',
        sortable: false,
        value: 'primaryEvaluatorName',
      },
      {
        text: '二次評価者',
        align: 'center',
        sortable: false,
        value: 'secondaryEvaluatorName',
      },
      { text: '編集', align: 'center', value: 'presenterEditing', sortable: false },
    ],
    currentDisplayPresentation: {},
    editedIndex: -1,
    editedPresentationItem: {},
    editedPresenterItem: {},
    defaultPresentationItem: {
      id: '',
      status: '',
      name: '',
      enteringOn: '',
      publishingOn: '',
    },
    defaultPresenterItem: {
      id: '',
      presentationId: '',
      presentingOn: '',
      presenterName: '',
      primaryEvaluatorName: '',
      secondaryEvaluatorName: '',
    },
    isFormValid: true,
    rules: {
      required: (value) => !!value || '入力必須',
    },
  }),

  computed: {
    ...mapState('presentations', ['presentations', 'presenters']),
    ...mapState('users', ['userSelectOptions']),
    ...mapState('snackbar', ['isErr']),
    formTitle() {
      return this.editedIndex === -1 ? '新規追加' : '編集'
    },
    formBtn() {
      return this.editedIndex === -1 ? '新規追加' : '編集保存'
    },
  },

  watch: {
    presentationEditDialog(value) {
      value || this.closePresentationEditDialog()
    },
    presenterDialog(value) {
      value || this.closePresenterDialog()
    },
    'editedPresenterItem.primaryEvaluatorId'() {
      if (this.$refs.form) {
        this.$refs.form.validate()
      }
    },
    'editedPresenterItem.secondaryEvaluatorId'() {
      if (this.$refs.form) {
        this.$refs.form.validate()
      }
    },
  },

  async mounted() {
    await this.getPresentations()
  },

  methods: {
    ...mapActions('presentations', [
      'getPresentations',
      'createPresentation',
      'updatePresentation',
      'deletePresentation',
      'getPresenters',
      'createPresenter',
      'updatePresenter',
      'deletePresenter',
    ]),
    checkDuplicate(value) {
      if (
        Number(this.editedPresenterItem.primaryEvaluatorId) === Number(this.editedPresenterItem.secondaryEvaluatorId)
      ) {
        return `評価者が重複しています`
      } else {
        return true
      }
    },

    editPresentation(item) {
      this.editedIndex = this.presentations.indexOf(item)
      this.editedPresentationItem = {
        id: item.id,
        status: item.status,
        name: item.name,
        enteringOn: item.enteringOn ? new Date(item.enteringOn).toISOString().substr(0, 10) : '',
        publishingOn: item.publishingOn ? new Date(item.publishingOn).toISOString().substr(0, 10) : '',
      }
      this.presentationEditDialog = true
    },

    async showPresentersDetail(item) {
      this.currentDisplayPresentation = item
      await this.getPresenters(item)
      this.editedIndexDetail = {
        presentationId: item.id,
        presentationName: item.name,
        enteringOn: item.enteringOn ? new Date(item.enteringOn).toISOString().substr(0, 10) : '',
        publishingOn: item.publishingOn ? new Date(item.publishingOn).toISOString().substr(0, 10) : '',
      }
      this.$nextTick(() => {
        this.presenterDialog = true
      })
    },

    editPresenter(item) {
      this.editedIndex = this.presenters.indexOf(item)
      this.editedPresenterItem = {
        id: item.id,
        presentationId: this.currentDisplayPresentation.id,
        presentingOn: item.presentingOn ? new Date(item.presentingOn).toISOString().substr(0, 10) : '',
        presenterId: item.presenterId,
        presenterName: item.presenterName,
        primaryEvaluatorId: item.primaryEvaluatorId,
        primaryEvaluatorName: item.primaryEvaluatorName,
        secondaryEvaluatorId: item.secondaryEvaluatorId,
        secondaryEvaluatorName: item.secondaryEvaluatorName,
      }
      this.presenterEditDialog = true
    },

    async savePresentation() {
      if (this.editedIndex > -1) {
        await this.updatePresentation(this.editedPresentationItem)
      } else {
        await this.createPresentation(this.editedPresentationItem)
      }
      await this.getPresentations()
      this.$nextTick(() => {
        if (!this.isErr) {
          this.closePresentationEditDialog()
        }
      })
    },

    async savePresenter() {
      if (this.editedIndex > -1) {
        await this.updatePresenter(this.editedPresenterItem)
      } else {
        this.editedPresenterItem.presentationId = this.currentDisplayPresentation.id
        await this.createPresenter(this.editedPresenterItem)
      }
      await this.showPresentersDetail(this.currentDisplayPresentation)
      this.$nextTick(() => {
        if (!this.isErr) {
          this.closePresenterEditDialog()
        }
      })
    },

    async deletePresentationConfirm(item) {
      confirm('削除してよろしいですか？') && (await this.deletePresentation(item))
      await this.getPresentations()
      if (!this.isErr) {
        this.$nextTick(() => {
          this.closePresentationEditDialog()
        })
      }
    },

    async deletePresenterConfirm(item) {
      confirm('削除してよろしいですか？') && (await this.deletePresenter(item))
      await this.showPresentersDetail(this.currentDisplayPresentation)
      if (!this.isErr) {
        this.$nextTick(() => {
          this.closePresenterEditDialog()
        })
      }
    },

    closePresentationEditDialog() {
      this.presentationEditDialog = false
      this.$nextTick(() => {
        this.editedPresentationItem = Object.assign({}, this.defaultPresentationItem)
        this.editedIndex = -1
        this.$refs.form.resetValidation()
      })
    },

    closePresenterDialog() {
      this.presenterDialog = false
    },

    closePresenterEditDialog() {
      this.presenterEditDialog = false
      this.$nextTick(() => {
        this.editedPresenterItem = Object.assign({}, this.defaultPresenterItem)
        this.editedIndex = -1
        this.$refs.form.resetValidation()
      })
    },
  },
}
</script>
