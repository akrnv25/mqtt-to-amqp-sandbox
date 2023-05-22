class StorageService {
  _storage = {};

  constructor() {}

  setItem(key, value) {
    this._storage[key] = value;
  }

  getItem(key) {
    return this._storage[key];
  }

  removeItem(key) {
    this._storage[key] = null;
  }

  clear() {
    this._storage = {};
  }
}

module.exports = new StorageService();
