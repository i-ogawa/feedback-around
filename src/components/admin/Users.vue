<template lang="pug">
div
  v-data-table.elevation-1(
    :headers='headers',
    :items='users',
    sort-by='hiredAt',
    :search='search',
    :footer-props='{ "items-per-page-options": [5, 20, 50, -1], "items-per-page-text": "表示件数:" }',
    :options='options'
  )
    template(v-slot:top)
      //- テーブルヘッダー
      v-toolbar(flat, color='grey lighten-3')
        v-spacer
        v-text-field(v-model='search', append-icon='mdi-magnify', label='検索', single-line, hide-details)
        v-spacer

        //- 編集ダイアログ
        v-dialog(v-model='dialog', persistent, max-width='900px')
          v-card
            v-card-actions
              v-spacer
              v-btn(color='grey darken-1', text, small, @click='closeDialog')
                v-icon mdi-close
            v-card-title
              span.headline 編集
              v-card-text
                v-container
                  v-form(ref='form', v-model='isFormValid')
                    v-row
                      v-col(cols='12', sm='12', md='6')
                        v-row
                          v-col(cols='12', sm='6', md='12')
                            div
                              span.caption 管理者権限
                              v-switch.mt-0(v-model='editedItem.isAdmin', label='', dense)
                          v-col(cols='12', sm='6', md='12')
                            v-text-field(v-model='editedItem.code', label='*社員番号', required, :rules='rules')
                          v-col(cols='12', sm='6', md='12')
                            v-text-field(v-model='editedItem.name', label='*名前', required, :rules='rules')
                          v-col(cols='12', sm='6', md='12')
                            v-text-field(v-model='editedItem.kana', label='*ふりがな', required, :rules='rules')
                      v-col(cols='6')
                        v-row
                          v-col.mt-1(cols='12', sm='6', md='12')
                            .mb-16
                          v-col(cols='12', sm='6', md='12')
                            v-autocomplete(
                              v-model='editedItem.rankId',
                              :items='rankSelectOptions',
                              label='*ランク',
                              required,
                              :rules='rules'
                            )
                          v-col(cols='12', sm='6', md='12')
                            v-menu(
                              v-model='menuHiredAt',
                              :close-on-content-click='false',
                              :nudge-right='40',
                              transition='scale-transition',
                              offset-y,
                              min-width='290px'
                            )
                              template(v-slot:activator='{ on, attrs }')
                                v-text-field(
                                  v-model='editedItem.hiredAt',
                                  label='*入社日',
                                  readonly,
                                  v-bind='attrs',
                                  v-on='on',
                                  required,
                                  :rules='rules'
                                )
                              v-date-picker(
                                v-model='editedItem.hiredAt',
                                @input='menuHiredAt = false',
                                locale='ja-jp',
                                :day-format='(date) => new Date(date).getDate()'
                              )
                                v-spacer
                                v-btn(text, color='black', @click='menuHiredAt = false') キャンセル
                          v-col(cols='12', sm='6', md='12')
                            v-menu(
                              v-model='menuRetiredAt',
                              :close-on-content-click='false',
                              :nudge-right='40',
                              transition='scale-transition',
                              offset-y,
                              min-width='290px'
                            )
                              template(v-slot:activator='{ on, attrs }')
                                v-text-field(
                                  v-model='editedItem.retiredAt',
                                  label='退職日',
                                  readonly,
                                  v-bind='attrs',
                                  v-on='on'
                                )
                              v-date-picker(
                                v-model='editedItem.retiredAt',
                                @input='menuRetiredAt = false',
                                locale='ja-jp',
                                :day-format='(date) => new Date(date).getDate()'
                              )
                                v-spacer
                                v-btn(text, color='black', @click='menuRetiredAt = false') キャンセル
              small * は入力必須

            v-card-actions
              v-spacer
              v-btn(color='blue darken-1', text, @click='save', :disabled='!isFormValid') 編集保存

    //- 表示する内容を加工
    template(v-slot:item.rank='{ item }')
      span(v-if='item.rank') {{ item.rank.code }}
    template(v-slot:item.hiredAt='{ item }')
      span(v-show='item.hiredAt') {{ $dayjs(item.hiredAt).format("YYYY/M/D") }}
    template(v-slot:item.isAdmin='{ item }')
      v-icon(v-if='item.isAdmin', small, color='primary') mdi-wrench
    template(v-slot:item.actions='{ item }')
      v-icon.mr-2(small, @click='editItem(item)') mdi-pencil
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  components: {},
  data: () => ({
    search: '',
    dialog: false,
    menuHiredAt: false,
    menuRetiredAt: false,
    rules: [(value) => !!value || '入力必須'],
    options: {
      itemsPerPage: 20,
    },
    headers: [
      {
        text: '社員番号',
        align: 'center',
        sortable: true,
        value: 'code',
      },
      {
        text: '名前(ふりがな)',
        align: 'start',
        sortable: true,
        value: 'nameAndKana',
      },
      {
        text: 'メールアドレス',
        align: 'start',
        sortable: true,
        value: 'mail',
      },
      {
        text: 'ランク',
        align: 'center',
        sortable: true,
        value: 'rank',
      },
      {
        text: '入社日',
        align: 'center',
        sortable: true,
        value: 'hiredAt',
      },
      {
        text: '管理者権限',
        align: 'center',
        sortable: true,
        value: 'isAdmin',
        width: '120',
      },
      { text: '編集', align: 'right', value: 'actions', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      id: '',
      code: '',
      name: '',
      kana: '',
      rank: '',
      hiredAt: '',
      retiredAt: '',
      isAdmin: '',
    },
    isFormValid: true,
  }),

  computed: {
    ...mapState('users', ['users', 'rankSelectOptions']),
    ...mapState('snackbar', ['isErr']),
  },

  watch: {
    dialog(value) {
      value || this.closeDialog()
    },
  },

  async mounted() {
    await this.getUsers()
    await this.getRankSelectOptions()
  },

  methods: {
    ...mapActions('users', ['getUsers', 'updateUser', 'getRankSelectOptions']),

    editItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = {
        id: item.id,
        code: item.code,
        name: item.name,
        kana: item.kana,
        rankCode: item.rank ? item.rank.code : '',
        rankId: item.rank ? item.rank.id : '',
        hiredAt: item.hiredAt ? new Date(item.hiredAt).toISOString().substr(0, 10) : '',
        retiredAt: item.retired ? new Date(item.retiredAt).toISOString().substr(0, 10) : '',
        isAdmin: item.isAdmin,
      }
      this.dialog = true
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    async save() {
      await this.updateUser(this.editedItem)
      await this.getUsers()
      await this.getRankSelectOptions()
      this.$nextTick(() => {
        if (!this.isErr) {
          this.closeDialog()
        }
      })
    },
  },
}
</script>

<style scoped lang="scss">
// mt-1(4pxのマージン)では大きすぎるため、半分の2pxのスタイルを定義
.mt-0point5 {
  margin-top: 2px;
}
</style>
