<template lang="pug">
div
  div(v-for='(category, i) in copiedEvaluations', :key='i')
    v-divider(v-if='i')
    v-card.mb-5(flat)
      v-container
        v-row(justify='start', no-gutters)
          v-card-title {{ category.sort_order }} {{ category.profession.name }} - {{ category.name }}
          v-card-actions
            v-btn(v-if='deleteMode', text, small, @click='deleteItem("category", category)')
              v-icon(color='red', small) mdi-trash-can
            v-btn(v-else, text, small, @click='editItem("updateIndicatorCategory", category)')
              v-icon(small) mdi-pencil

        .ml-8(v-for='(subcategory, j) in category.indicatorSubcategories', :key='j')
          v-card.mb-5(outlined)
            v-sheet(color='grey lighten-3')
              v-row(justify='start', no-gutters)
                v-card-subtitle {{ subcategory.sort_order }} {{ subcategory.name }}
                v-card-actions
                  v-btn(v-if='deleteMode', text, small, @click='deleteItem("subcategory", subcategory)')
                    v-icon(color='red', small) mdi-trash-can
                  v-btn(v-else, text, small, @click='editItem("updateIndicatorSubcategory", category, subcategory)')
                    v-icon(small) mdi-pencil
            v-divider.mb-7
            v-form(
              ref='form',
              :value='rankDescriptionValidations[subcategory.id]',
              @input='(value) => updateRankDescriptionValidations({ [subcategory.id]: value })'
            )
              .mr-4.ml-4(v-for='(rank, k) in subcategory.indicatorSubcategoryRanks', :key='k')
                v-textarea.body-2(
                  :rules='rules',
                  :label='rank.rank.code',
                  required,
                  outlined,
                  rows='3',
                  v-model='rank.description'
                )
            v-row(v-if='!deleteMode', justify='end')
              v-card-actions.mr-4
                v-btn(
                  :disabled='!rankDescriptionValidations[subcategory.id]',
                  color='blue darken-1',
                  text,
                  @click='saveRanks(subcategory)'
                ) 編集保存
        v-card-actions.ml-4(v-if='!deleteMode')
          v-btn(text, small, @click='editItem("createIndicatorSubcategory", category)')
            v-icon.mr-4(small) mdi-plus-circle
            span 評価基準中分類を追加
  v-btn(v-if='!deleteMode', text, @click='editItem("createIndicatorCategory")')
    v-icon.mr-4 mdi-plus-circle
    span 評価基準大分類を追加
  v-tooltip(bottom, color='secondary')
    template(v-slot:activator='{ on, attrs }')
      v-btn(
        :color='deleteMode ? "red" : "primary"',
        dark,
        absolute,
        top,
        right,
        fab,
        small,
        v-bind='attrs',
        v-on='on',
        @click='deleteMode = !deleteMode'
      )
        v-icon(small) mdi-trash-can-outline
    span 削除モードに切り替える

  //- 編集ダイアログ
  v-dialog(v-model='dialog', max-width='500px')
    v-card
      v-card-actions
        v-spacer
        v-btn(color='grey darken-1', text, small, @click='closeDialog')
          v-icon mdi-close
      v-card-title
        span.headline {{ formTitle }}
      v-card-subtitle {{ this.formSubTitle }}
      v-card-text
        v-container
          v-form(ref='form', v-model='isFormValid')
            v-row
              v-col(cols='12')
                v-text-field(
                  v-if='isCategory',
                  v-model='editedItem.sortOrder',
                  label='*ソート番号',
                  required,
                  :rules='sortOrderRules'
                )
                v-text-field(v-else, v-model='editedItem.sortOrder', label='*ソート番号', required, :rules='sortOrderRules')
              v-col(cols='12')
                v-select(
                  v-if='editType === "createIndicatorCategory"',
                  v-model='editedItem.professionId',
                  :items='professionSelectOptions',
                  label='職種',
                  required,
                  :rules='rules'
                )
              v-col(cols='12')
                v-text-field(v-if='isCategory', v-model='editedItem.name', label='*評価基準大分類', required, :rules='rules')
                v-text-field(v-else, v-model='editedItem.name', label='*評価基準中分類', required, :rules='rules')
        small * は入力必須

      v-card-actions
        v-spacer
        v-btn(color='blue darken-1', text, @click='save', :disabled='!isFormValid') {{ saveButtonName }}
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'

export default {
  data: () => ({
    copiedEvaluations: [],
    deleteMode: false,
    dialog: false,
    isCategory: false,
    editType: '',
    formTitle: '',
    formSubTitle: '',
    saveButtonName: '',
    editedItem: {
      id: '',
      sortOrder: '',
      professionId: '',
      indicatorCategoryId: '',
      name: '',
    },
    defaultItem: {
      id: '',
      sortOrder: '',
      professionId: '',
      indicatorCategoryId: '',
      name: '',
    },
    isFormValid: true,
    rules: [(value) => !!value || '入力必須'],
    sortOrderRules: [
      (value) => !!String(value) || '入力必須',
      (value) => Number.isInteger(Number(value)) || '数値のみ',
    ],
  }),

  computed: {
    ...mapState('evaluations', ['evaluations', 'indicatorCategorySelectOptions', 'rankDescriptionValidations']),
    ...mapState('professions', ['professionSelectOptions']),
    ...mapState('snackbar', ['isErr']),
  },

  watch: {
    dialog(val) {
      val || this.closeDialog()
    },
  },

  async mounted() {
    await this.getEvaluations()
    this.copiedEvaluations = cloneDeep(this.evaluations)
  },

  methods: {
    ...mapActions('evaluations', [
      'getEvaluations',
      'createIndicatorCategory',
      'updateIndicatorCategory',
      'deleteIndicatorCategory',
      'createIndicatorSubcategory',
      'updateIndicatorSubcategory',
      'deleteIndicatorSubcategory',
      'updateIndicatorSubcategoryRanks',
    ]),
    ...mapMutations('evaluations', ['updateRankDescriptionValidations']),

    editItem(editType, category, subcategory) {
      switch (editType) {
        // 評価基準大分類の新規追加
        case 'createIndicatorCategory':
          this.formTitle = '評価基準大分類の新規追加'
          this.saveButtonName = '新規追加'
          this.isCategory = true
          this.$nextTick(() => {
            this.dialog = true
          })
          break

        // 評価基準中分類の新規追加
        case 'createIndicatorSubcategory':
          this.editedItem = {
            indicatorCategoryId: category.id,
            professionId: category.profession.id,
          }
          this.formTitle = '評価基準中分類の新規追加'
          this.formSubTitle = `評価基準大分類: ${category.profession.name} - ${category.name}`
          this.saveButtonName = '新規追加'

          // 中分類の新規追加は直前にバリデーションをリセットしないとエラーになる
          this.$nextTick(() => {
            this.dialog = true
          })
          break

        // 評価基準大分類編集の場合
        case 'updateIndicatorCategory':
          this.editedItem = {
            id: category.id,
            sortOrder: category.sort_order,
            professionId: category.profession.id,
            name: category.name,
          }
          this.formTitle = '評価基準大分類の編集'
          this.formSubTitle = `職種: ${category.profession.name}`
          this.saveButtonName = '編集保存'
          this.isCategory = true
          break

        // 評価基準中分類編集の場合
        case 'updateIndicatorSubcategory':
          this.editedItem = {
            id: subcategory.id,
            sortOrder: subcategory.sort_order,
            indicatorCategoryId: subcategory.indicator_category_id,
            name: subcategory.name,
          }
          this.formTitle = '評価基準中分類の編集'
          this.formSubTitle = `評価基準大分類: ${category.profession.name} - ${category.name}`
          this.saveButtonName = '編集保存'
          break
      }
      this.editType = editType
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
      this.dialog = true
    },

    closeDialog() {
      this.editedItem = Object.assign({}, this.defaultItem)
      this.isCategory = false
      this.editType = ''
      this.formTitle = ''
      this.formSubTitle = ''
      this.$refs.form.resetValidation()
      this.dialog = false
    },

    async save() {
      switch (this.editType) {
        // 評価基準大分類の新規追加
        case 'createIndicatorCategory':
          await this.createIndicatorCategory(this.editedItem)
          break
        // 評価基準中分類の新規追加
        case 'createIndicatorSubcategory':
          await this.createIndicatorSubcategory(this.editedItem)
          break
        // 評価基準大分類の編集
        case 'updateIndicatorCategory':
          await this.updateIndicatorCategory(this.editedItem)
          break
        // 評価基準中分類の編集
        case 'updateIndicatorSubcategory':
          await this.updateIndicatorSubcategory(this.editedItem)
          break
      }
      await this.getEvaluations()
      this.copiedEvaluations = cloneDeep(this.evaluations)
      this.$nextTick(() => {
        if (!this.isErr) {
          this.closeDialog()
        }
      })
    },

    async saveRanks(subcategory) {
      await this.updateIndicatorSubcategoryRanks(subcategory)
      await this.getEvaluations()
      this.copiedEvaluations = cloneDeep(this.evaluations)
    },

    async deleteItem(deleteType, item) {
      // 評価基準大分類の削除
      if (deleteType === 'category') {
        confirm('削除してよろしいですか？') && (await this.deleteIndicatorCategory(item))
        this.$nextTick(() => {
          if (!this.isErr) {
            this.closeDialog()
          }
        })
        // 評価基準中分類の削除
      } else {
        const alertResult = confirm('削除してよろしいですか？') && (await this.deleteIndicatorSubcategory(item))
        if (alertResult) {
          this.$nextTick(() => {
            if (!this.isErr) {
              this.closeDialog()
            }
          })
        }
      }
      await this.getEvaluations()
      this.copiedEvaluations = cloneDeep(this.evaluations)
    },
  },
}
</script>
