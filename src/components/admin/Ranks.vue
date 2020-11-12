<template lang="pug">
div
  v-data-table.elevation-1(
    :headers='headers',
    :items='ranks',
    :search='search',
    :footer-props='{ "items-per-page-options": [5, 20, 50, -1], "items-per-page-text": "表示件数:" }',
    :options='options'
  )
    template(v-slot:top)
      v-toolbar(flat, color='grey lighten-3')
        v-spacer
        v-text-field(v-model='search', append-icon='mdi-magnify', label='検索', single-line, hide-details)
        v-spacer
        //-編集ダイアログ
        v-dialog(v-model='dialog', persistent, max-width='900px')
          template(v-slot:activator='{ on, attrs }')
            v-btn.mb-2(color='primary', dark, v-bind='attrs', v-on='on') ランクを追加
          v-card
            v-card-actions
              v-spacer
              v-btn(color='grey darken-1', text, @click='closeDialog')
                v-icon mdi-close
            v-card-title
              span.headline {{ formTitle }}
              v-card-text
                v-container
                  v-form(ref='form', v-model='isFormValid')
                    v-row
                      v-col(cols='12', sm='6', md='7')
                        v-autocomplete(
                          v-model='editedItem.professionId',
                          v-on:change='filterRankSelectOptions(editedItem.professionId)',
                          :items='professionSelectOptions',
                          label='職種',
                          required,
                          :rules='rules'
                        )
                      v-col(cols='12', sm='12', md='7')
                        v-text-field(v-model='editedItem.name', label='*ランク名', required, :rules='rules')
                      v-col(cols='12', sm='12', md='7')
                        v-text-field(v-model='editedItem.code', label='*コード', required, :rules='rules')
                      v-col(cols='12', sm='12', md='7')
                        v-autocomplete(
                          v-model='editedItem.previous_rank_id',
                          :items='filteredRankSelectOptions',
                          label='一つ前のランク'
                        )
                      v-col(cols='12', sm='12', md='7')
                        v-text-field(
                          v-model='editedItem.sort_order',
                          label='*ソート番号',
                          required,
                          :rules='sortOrderRules'
                        )
                      v-col(cols='12', sm='12', md='12')
                        v-textarea(v-model='editedItem.description', label='*説明', outlined, required, :rules='rules')
                small * は入力必須
            v-card-actions
              v-btn(v-if='editedIndex !== -1', color='blue darken-1', text, @click='deleteRank(editedItem.id)') 削除
              v-spacer
              v-btn(color='blue darken-1', text, @click='save()', :disabled='!isFormValid') {{ formBtn }}
    template(v-slot:item.actions='{ item }')
      v-icon.mr-2(small, @click='editItem(item)') mdi-pencil
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  data: () => ({
    search: '',
    options: {
      itemsPerPage: 20,
    },
    headers: [
      {
        text: '職種',
        align: 'center',
        sortable: true,
        value: 'profession.name',
      },
      {
        text: '名前',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: 'コード',
        align: 'start',
        sortable: true,
        value: 'code',
      },
      {
        text: '説明',
        align: 'start',
        sortable: true,
        value: 'description',
      },
      {
        text: '一つ前のランク',
        align: 'center',
        sortable: true,
        value: 'previous_rank_code',
      },
      { text: '編集', align: 'right', value: 'actions', sortable: false },
    ],
    dialog: false,
    editedIndex: -1,
    profIndex: -1,
    profession: '',
    editedItem: {
      id: '',
      name: '',
      code: '',
      description: '',
      previous_rank_id: '',
      previous_rank_code: '',
      sort_order: '',
      profession: '',
    },
    defaultItem: {
      name: '',
    },
    filteredRankSelectOptions: [],
    isFormValid: true,
    rules: [(value) => !!value || '入力必須'],
    sortOrderRules: [
      (value) => !!String(value) || '入力必須',
      (value) => Number.isInteger(Number(value)) || '数値のみ',
    ],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新規追加' : '編集'
    },
    formBtn() {
      return this.editedIndex === -1 ? '新規保存' : '編集保存'
    },
    ...mapState('ranks', ['ranks', 'professionSelectOptions', 'rankSelectOptions']),
    ...mapState('professions', ['professionSelectOptions']),
    ...mapState('snackbar', ['isErr']),
  },

  async mounted() {
    await this.getRanks()
    await this.getProfessionSelectOptions()
    await this.getRankSelectOptions()
  },

  methods: {
    ...mapActions('ranks', ['getRanks', 'updateRanks', 'getRankSelectOptions', 'createRanks', 'deleteRanks']),
    ...mapActions('professions', ['getProfessionSelectOptions']),

    editItem(item) {
      this.editedIndex = this.ranks.indexOf(item)
      this.editedItem = {
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
        previous_rank_id: item.previous_rank_id,
        previous_rank_code: item.previous_rank_code,
        sort_order: item.sort_order,
        professionId: item.profession.id,
      }
      this.filterRankSelectOptions(item.profession.id)
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.filteredRankSelectOptions = []
        this.$refs.form.resetValidation()
      })
    },
    filterRankSelectOptions(professionId) {
      this.filteredRankSelectOptions = this.rankSelectOptions.filter(
        (profession) => profession.profId === professionId || profession.profId === ''
      )
    },
    async save() {
      if (this.editedIndex > -1) {
        await this.updateRanks(this.editedItem)
      } else {
        await this.createRanks(this.editedItem)
      }
      await this.getRanks()
      await this.getProfessionSelectOptions()
      await this.getRankSelectOptions()
      if (!this.isErr) {
        this.closeDialog()
      }
    },
    async deleteRank(item) {
      confirm('削除してよろしいですか？') && (await this.deleteRanks(item))
      await this.getRanks()
      await this.getProfessionSelectOptions()
      await this.getRankSelectOptions()
      if (!this.isErr) {
        this.closeDialog()
      }
    },
  },
}
</script>
