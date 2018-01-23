import {mapGetters} from 'vuex'

export const playingMixin = {
  computed: {
    ...mapGetters([
      'sequenceList'
    ])
  },
  mounted() {
    this._calcView(this.sequenceList)
  },
  activated() {
    this._calcView(this.sequenceList)
  },
  watch: {
    sequenceList(sequenceList) {
      this._calcView(sequenceList)
    }
  }
}