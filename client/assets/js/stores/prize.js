import {EventEmitter} from 'events';
import AppConstants from '../constants';
import AppDispatcher from '../dispatcher';

const CHANGE_EVENT = 'change';

export default new (class PrizeStore extends EventEmitter {
  prizes = [];
  constructor() {
    super();

    AppDispatcher.register((action) => {
      switch (action.actionType) {
        case AppConstants.ActionTypes.FETCH_PRIZES:
          this._fetch(action);
          break;
      }
      this.emit(CHANGE_EVENT);
    });
  }
  _fetch(action) {
    this.prizes = action.prizes;
  }
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
})();
