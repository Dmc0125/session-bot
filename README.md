# Session trading bot

- BTC/USDT Binance trading bot
  - Long 10:00am - 5:30pm UTC
  - Short 00:30am - 5:00am UTC

## Setup

- Create .env file

- Set API_KEY and SECRET_KEY variables from binance
  - It has to have futures trading permissions

```.env
API_KEY=...
SECRET_KEY=...
```

## Start bot

```sh
npm start
```

## Backtest

```sh
npm run backtest
```
