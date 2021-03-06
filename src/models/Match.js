import { observable, extendObservable, action, computed } from 'mobx'
import moment from 'moment'
import Data from '../data'
import MessageStore from '../stores/MessageStore'
import User from './User'

class Match {
  id = null
  store = null

  @observable lastActivityDate
  @observable user
  @observable isNew
  @observable isSuperLike
  @observable isBoostMatch
  @observable isBlocked
  @observable messageStore

  constructor(store, json = {}, user = {}) {
    this.store = store
    this.id = json._id
    this.authorId = json.userId
    this.user = new User(this, user._id, user)
    this.setFromJson(json)
  }

  @action setFromJson(json) {
    this.lastActivityDate = json.lastActivityDate
    this.isNew = json.isNew
    this.isSuperLike = json.isSuperLike
    this.isBoostMatch = json.isBoostMatch
    this.isBlocked = json.isBlocked
    this.messageStore = new MessageStore(this, json)
  }

  @action remove() {
    this.store.remove(this.id)
  }

  @computed get ago() {
    return moment(this.lastActvityTime).fromNow()
  }

  @computed get lastActvityTime() {
    if (this.messageStore.last.created_date) {
      return new Date(this.messageStore.last.created_date)
    }

    return new Date(this.lastActivityDate)
  }

  @computed get isNewMatch() {
    return this.isNew && !this.messageStore.hasMessages
  }

  @computed get areUnread() {
    return this.isNew
  }
}

export default Match
