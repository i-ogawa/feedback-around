<template lang="pug">
div
  v-data-table.elevation-1(
    :headers='headers',
    :items='professions',
    :search='search',
    :footer-props='{ "items-per-page-options": [5, 20, 50, -1], "items-per-page-text": "表示件数:" }',
    :options='options'
  )
    template(v-slot:top)
      v-toolbar(flat, color='grey lighten-3')
        v-spacer
        v-text-field(v-model='search', append-icon='mdi-magnify', label='検索', single-line, hide-details)
        v-spacer

        v-dialog(v-model='dialog', persistent, max-width='500px')
          template(v-slot:activator='{ on, attrs }')
            v-btn.mb-2(color='primary', dark, v-bind='attrs', v-on='on') 職種を追加
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
                      v-col(cols='12', sm='6', md='12')
                        v-text-field(v-model='editedItem.name', label='*職種名', required, :rules='rules')
                small * は入力必須

            v-card-actions
              v-btn(
                v-if='editedIndex !== -1',
                color='blue darken-1',
                text,
                @click='deleteProfessionConfirm(editedItem.id)'
              ) 削除
              v-spacer
              v-btn(color='blue darken-1', text, @click='save', :disabled='!isFormValid') {{ formBtn }}
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
        text: '職務名',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      { text: '編集', align: 'right', value: 'actions', sortable: false },
    ],
    dialog: false,
    editedIndex: -1,
    editedItem: {
      name: '',
    },
    defaultItem: {
      name: '',
    },
    isFormValid: true,
    rules: [(value) => !!value || '入力必須'],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新規追加' : '編集'
    },
    formBtn() {
      return this.editedIndex === -1 ? '新規保存' : '編集保存'
    },
    ...mapState('professions', ['professions']),
    ...mapState('snackbar', ['isErr']),
  },

  watch: {
    dialog(value) {
      value || this.closeDialog()
    },
  },

  async mounted() {
    await this.getProfessions()
  },

  methods: {
    ...mapActions('professions', ['getProfessions', 'updateProfession', 'deleteProfession', 'createProfession']),

    editItem(item) {
      this.editedIndex = this.professions.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.$refs.form.resetValidation()
      })
    },

    async save() {
      if (this.editedIndex > -1) {
        await this.updateProfession(this.editedItem)
      } else {
        await this.createProfession(this.editedItem)
      }
      await this.getProfessions()
      this.$nextTick(() => {
        if (!this.isErr) {
          this.closeDialog()
        }
      })
    },
    async deleteProfessionConfirm(item) {
      confirm('削除してよろしいですか？') && (await this.deleteProfession(item))
      await this.getProfessions()
      this.$nextTick(() => {
        if (!this.isErr) {
          this.closeDialog()
        }
      })
    },
  },
}
</script>
