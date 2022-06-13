'use strict'

// Data
const account1 = {
  owner: 'Ewerton Franco',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-06-09T17:01:17.194Z',
    '2022-06-12T23:36:17.929Z',
    '2022-06-13T10:51:36.790Z',
  ],
  currency: 'BRL',
  locale: 'pt-BR',
}

const account2 = {
  owner: 'João Paulo',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-06-12T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
}

const accounts = [account1, account2]

// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan--amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

/////////////////////////////////////////////////
const calcDaysPast = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

const formatCurrency = (value, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)

const formatMovementDates = (date, locale) => {
  const daysPassed = calcDaysPast(new Date(), date)

  if (daysPassed === 0) return 'Hoje'
  if (daysPassed === 1) return 'Ontem'
  if (daysPassed <= 7) return `${daysPassed} dias atrás`

  return new Intl.DateTimeFormat(locale).format(date)
}

const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0),
      sec = String(time % 60).padStart(2, 0)
    labelTimer.textContent = `${min}:${sec}`

    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = 'Acesse sua conta para começar.'
      containerApp.style.opacity = 0
    }
    time--
  }

  let time = 120
  tick()
  const timer = setInterval(tick, 1000)

  return timer
}

const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = ''

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements

  movs.forEach((mov, idx) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal'

    const date = new Date(acc.movementsDates[idx]),
      displayDate = formatMovementDates(date, acc.locale),
      formattedMovement = formatCurrency(mov, acc.locale, acc.currency)

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${idx + 1} ${type === 'deposit' ? 'depósito' : 'saque'}
        </div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
      `
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0)

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  )
}

const calcDisplaySummary = acc => {
  const incomes = acc.movements
      .filter(mov => mov > 0)
      .reduce((acc, mov) => acc + mov),
    outcomes = acc.movements
      .filter(mov => mov < 0)
      .reduce((acc, mov) => acc + mov, 0),
    interest = acc.movements
      .filter(mov => mov > 0)
      .map(deposit => (deposit * acc.interestRate) / 100)
      .filter(int => int > 1)
      .reduce((acc, int) => acc + int, 0)

  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency)
  labelSumOut.textContent = formatCurrency(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  )
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  )
}

const createUserNames = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('')
  })
}
createUserNames(accounts)

const updateUI = acc => {
  displayMovements(acc)
  calcDisplayBalance(acc)
  calcDisplaySummary(acc)
}

// Event handlers
let currentAccount,
  timer,
  isSorted = false

btnLogin.addEventListener('click', e => {
  e.preventDefault()

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  )

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and welcome message
    labelWelcome.textContent = `Bem vindo(a) de volta, ${
      currentAccount.owner.split(' ')[0]
    }!`
    containerApp.style.opacity = 1

    const now = new Date(),
      options = {
        // can be 'numeric', 'long and '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        // weekday: 'long',
      }

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now)

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    if (timer) clearInterval(timer)
    timer = startLogOutTimer()

    updateUI(currentAccount)
  }
})

btnTransfer.addEventListener('click', e => {
  e.preventDefault()

  const amount = +inputTransferAmount.value,
    receiverAccount = accounts.find(
      acc => acc.username === inputTransferTo.value
    )

  inputTransferAmount.value = inputTransferTo.value = ''

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount)
    receiverAccount.movements.push(amount)

    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAccount.movementsDates.push(new Date().toISOString())
    updateUI(currentAccount)

    // Reset timer when transfer happens
    clearInterval(timer)
    timer = startLogOutTimer()
  }
})

btnLoan.addEventListener('click', e => {
  e.preventDefault()

  /*
   * Loan is available if the current user have
   * any deposit higher than 10% of the requested amount
   * */
  const amount = Math.floor(inputLoanAmount.value)
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount)
      currentAccount.movementsDates.push(new Date().toISOString())
      updateUI(currentAccount)

      // Reset timer when loan happens
      clearInterval(timer)
      timer = startLogOutTimer()
    }, 1500)
  }
  inputLoanAmount.value = ''
})

btnClose.addEventListener('click', e => {
  e.preventDefault()

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    )

    // Delete account and hide UI
    accounts.splice(index, 1)
    containerApp.style.opacity = 0
  }
  inputCloseUsername.value = inputClosePin.value = ''
})

btnSort.addEventListener('click', e => {
  e.preventDefault()

  displayMovements(currentAccount, !isSorted)
  isSorted = !isSorted
})
