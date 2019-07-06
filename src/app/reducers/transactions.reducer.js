import {
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  USER_LOGOUT
} from "../constants";

const initialState = null;

function transactions(state = initialState, action) {
  switch (action.type) {
    case TRANSACTIONS_READ_REQUEST:
      return Array.from(action.transactions);
    case TRANSACTIONS_DELETE_REQUEST: {
      return state.filter(t => t.id !== action.id);
    }
    case TRANSACTIONS_CREATE_REQUEST: {
      let transactions = Array.from(state);
      transactions.push(action.transaction);
      return transactions;
    }
    case TRANSACTIONS_UPDATE_REQUEST: {
      let transactions = Array.from(state);
      transactions = transactions.filter(t => t.id !== action.transaction.id);
      transactions.push(action.transaction);
      return transactions;
    }
    case ACCOUNTS_SWITCH_REQUEST: {
      return null;
    }
    case ACCOUNTS_CURRENCY_REQUEST: {
      return null;
    }
    // case USER_LOGOUT:
    //   return null;
    default:
      return state;
  }
}

export default transactions;
