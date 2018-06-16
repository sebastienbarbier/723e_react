import React, { Component } from 'react';
import moment from 'moment';

import muiThemeable from 'material-ui/styles/muiThemeable';

import MonthLineGraph from '../charts/MonthLineGraph';

import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import TransactionStore from '../../stores/TransactionStore';
import TransactionActions from '../../actions/TransactionActions';

import TransactionTable from '../transactions/TransactionTable';

const styles = {
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  button: {
    float: 'right',
    marginTop: '12px',
  },
  card: {
    width: '400px',
  },
  actions: {
    width: '30px',
  },
  graph: {
    width: '100%',
  },
};

class Category extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      account: localStorage.getItem('account'),
      category: props.category,
      categories: props.categories,
      onEditTransaction: props.onEditTransaction,
      onDuplicationTransaction: props.onDuplicationTransaction,
      transactions: new Set(),
      stats: null,
      graph: [],
      loading: true,
      snackbar: {
        open: false,
        message: '',
      },
    };
    this.context = context;
  }

  updateCategory = category => {
    if (category && !Array.isArray(category)) {
      this.setState({
        category: category,
      });
    }
  };

  updateTransaction = () => {
    this.setState({
      graph: [],
      loading: true,
    });
    TransactionActions.read({
      category: this.state.category.id,
    });
  };

  changeTransactions = args => {
    if (args && args.transactions && Array.isArray(args.transactions)) {

      // Generate Graph data
      let lineExpenses = {
        // color: 'red',
        values: [],
      };

      let lineIncomes = {
        values: [],
      };

      Object.keys(args.stats.perDates).forEach(year => {
        // For each month of year
        Object.keys(args.stats.perDates[year].months).forEach(month => {
          if (args.stats.perDates[year].months[month]) {
            lineExpenses.values.push({
              date: new Date(year, month),
              value: +args.stats.perDates[year].months[month].expenses * -1,
            });
            lineIncomes.values.push({
              date: new Date(year, month),
              value: args.stats.perDates[year].months[month].incomes,
            });
          } else {
            lineExpenses.values.push({ date: new Date(year, month), value: 0 });
            lineIncomes.values.push({ date: new Date(year, month), value: 0 });
          }
        });
      });

      this.setState({
        loading: false,
        stats: args.stats,
        graph: [lineExpenses], // lineIncomes
        transactions: args.transactions,
      });
    }
  };

  updateAccount = args => {
    if (this.state.account != localStorage.getItem('account')) {
      this.history.push('/categories');
    }
  };

  handleGraphClick = date => {
    this.history.push(
      '/transactions/' +
        date.getFullYear() +
        '/' +
        (+date.getMonth() + 1) +
        '/',
    );
  };

  _deleteData = deletedItem => {
    let list = this.state.transactions.filter(item => {
      return item.id != deletedItem.id;
    });
    this.setState({
      graph: [],
      transactions: list,
    });
    this.changeTransactions(list);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.category && nextProps.category.id) {
      TransactionActions.read({
        category: nextProps.category.id,
      });

      this.setState({
        category: nextProps.category,
        categories: nextProps.categories,
        onEditTransaction: nextProps.onEditTransaction,
        onDuplicationTransaction: nextProps.onDuplicationTransaction,
        transactions: null,
        stats: null,
        open: false,
        loading: true,
      });
    }
  }

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccount);
    TransactionStore.addChangeListener(this.changeTransactions);
    TransactionStore.addAddListener(this.updateTransaction);
    TransactionStore.addUpdateListener(this.updateTransaction);
    TransactionStore.addDeleteListener(this._deleteData);
  }

  componentDidMount() {
    if (this.state.category && this.state.category.id) {
      TransactionActions.read({
        category: this.state.category.id,
      });
    }
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccount);
    TransactionStore.removeChangeListener(this.changeTransactions);
    TransactionStore.removeAddListener(this.updateTransaction);
    TransactionStore.removeUpdateListener(this.updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
  }

  render() {
    return (
      <div>
        <h2 style={{ padding: '0 0 10px 34px' }}>
          {this.state.category ? this.state.category.name : ''}
        </h2>
        <div style={styles.graph}>
          <MonthLineGraph
            values={this.state.graph}
            isLoading={!this.state.transactions || !this.state.categories}
            onClick={this.handleGraphClick}
            ratio="30%"
          />
        </div>
        <div
          className="indicators separatorSandwitch"
          style={{ fontSize: '1.4em', padding: '10px 40px 10px 27px' }}
        >
          <p>
            <small>{moment().year()}</small>
            <br />
            {!this.state.stats ? (
              <span className="loading w80" />
            ) : (
              CurrencyStore.format(
                this.state.stats.perDates[moment().year()]
                  ? this.state.stats.perDates[moment().year()].expenses
                  : 0,
              )
            )}
          </p>
          <p>
            <small>Total</small>
            <br />
            {!this.state.stats ? (
              <span className="loading w120" />
            ) : (
              CurrencyStore.format(this.state.stats.expenses)
            )}
          </p>
          <p>
            <small>Transactions</small>
            <br />
            {!this.state.stats || !this.state.transactions ? (
              <span className="loading w50" />
            ) : (
              this.state.transactions.length
            )}
          </p>
          <p>
            <small>Average price</small>
            <br />
            {!this.state.stats || !this.state.transactions ? (
              <span className="loading w120" />
            ) : (
              CurrencyStore.format(
                this.state.stats.expenses /
                  (this.state.transactions.length || 1),
              )
            )}
          </p>
        </div>
        <div>
          {this.state.transactions && this.state.transactions.length === 0 ? (
            <p>You have no transaction</p>
          ) : (
            <TransactionTable
              transactions={this.state.transactions}
              categories={this.state.categories}
              isLoading={!this.state.transactions || !this.state.categories}
              onEdit={this.state.onEditTransaction}
              onDuplicate={this.state.onDuplicationTransaction}
              pagination="40"
              dateFormat="DD MMM YY"
            />
          )}
        </div>
      </div>
    );
  }
}

export default muiThemeable()(Category);
