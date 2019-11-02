export class jsonStorage {
    constructor () {
      this.storage = sessionStorage
    }
  
    static getItem (key) {
      const self = new this()
      const jsonObject = JSON.parse(self.storage.getItem(key))
      return (jsonObject || {})
    }

    static exist(key){
        const self = new this()
        return !!self.storage.getItem(key);
    }
  
    static setItem (key, value) {
      const self = new this()
      const json = JSON.stringify(value)
      return self.storage.setItem(key, json)
    }
  
    static removeItem (key) {
      const self = new this()
      self.storage.removeItem(key)
    }
  
    static clear () {
      const self = new this()
      self.storage.clear()
    }
  }
  