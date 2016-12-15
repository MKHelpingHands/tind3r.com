import { observable, extendObservable, action, computed } from 'mobx'
import moment from 'moment'
import { user, meta } from '../runtime'
import Data from '../data'

class User {
  id = null
  store = null
  @observable isLoading = false
  @observable done = 0

  constructor(store, id) {
    this.store = store
    this.id = id
  }

  @action fetch() {
    this.isLoading = true
    user(this.id).then(action(resp => {
      if (resp.message) {
        this.message = resp.message
        return
      }

      this.isLoading = false
      extendObservable(this, resp.results)
    })).catch(resp => {
      this.needFb = true
      this.isLoading = false
    })
  }

  @action asyncAction(method) {
    this.isLoading = true
    return new Promise((resolve, reject) => {
      method(this.id).then(action(resp => {
        this.done = 1
        this.isLoading = false
        resolve(resp)
      })).catch(action(resp => {
        reject(resp)
        this.isLoading = false
      }))
    })
  }

  @action like() : Promise {
    return this.asyncAction(Data.like)
  }

  @action pass() : Promise {
    return this.asyncAction(Data.pass)
  }

  @action superLike() : Promise {
    return this.asyncAction(Data.superLike)
  }

  @action fetchMeta() {
    this.isLoading = true
    meta().then(action(resp => {
      extendObservable(this, resp.user)
      this.isLoading = false
    }))
  }

  @action setFromJson(json) {
    extendObservable(this, json)
  }

  @computed get age() {
    return moment().diff(this.birth_date, 'years')
  }

  @computed get seen() {
    return moment(this.ping_time).format('DD/MM HH:mm')
  }

  @computed get seenMin() {
    return moment(this.ping_time).fromNow()
  }

  @computed get km() {
    return (this.distance_mi * 1.6093).toFixed(0)
  }

  @computed get instaLink() {
    if (this.instagram && this.instagram.username) {
      return `https://www.instagram.com/${this.instagram.username}/`
    }

    return null
  }

  @computed get instaName() {
    return this.instagram && this.instagram.username
  }

  @computed get school() {
    if (_.head(this.schools)) {
      return this.schools[0].name
    }

    return null
  }

  @computed get photosWithInsta() {
    const insta = this.instagram && this.instagram.photos
    const photos = []

    _.each(this.photos, i => photos.push(i.url))
    _.each(insta, i => photos.push(i.image))

    return photos
  }
}

export default User
