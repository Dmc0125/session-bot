const WebSocket = require('ws');

require('dotenv').config();

const { fetchCandlesticks } = require('./api/fetch-candlesticks');
const { fetchLotSize } = require('./api/fetch-lot-size');
const { fetchBalances } = require('./api/fetch-balances');
const { openPosition, closePosition } = require('./api/send-orders');

const { WSS_URL } = require('../constants');

const startBot = async () => {
  const filters = await fetchLotSize();
  const [prevCandle] = await fetchCandlesticks(false, 1);

  let inPosition = false;

  const initWs = () => {
    const ws = new WebSocket(`${WSS_URL}/ws/btcusdt@kline_30m`, {
      method: 'SUBSCRIBE',
      id: 2,
    });

    ws.on('open', () => {
      console.log('Connected');
    });

    ws.on('message', async (dataJSON) => {
      const data = JSON.parse(dataJSON);

      if (data.e === 'kline') {
        const { k: candleData } = data;
        const { t: openTime } = candleData;
        const openDate = new Date(openTime);

        if (prevCandle.openTime === openTime) {
          return;
        }

        prevCandle.openTime = openTime;

        const { availableBalance, positionAmt } = await fetchBalances();

        if (openDate.getUTCHours() === 10 && openDate.getUTCMinutes() === 0) {
          // LONG
          await openPosition(positionAmt > 0, availableBalance, candleData.o, filters, 'BUY');
          inPosition = true;
        } else if (openDate.getUTCHours() === 17 && openDate.getUTCMinutes() === 30) {
          // CLOSE LONG
          inPosition = false;
        } else if (openDate.getUTCHours() === 0 && openDate.getUTCMinutes() === 30) {
          // SHORT
          await openPosition(positionAmt > 0, availableBalance, candleData.o, filters, 'SELL');
          inPosition = true;
        } else if (openDate.getUTCHours() === 5 && openDate.getUTCMinutes() === 0) {
          // CLOSE SHORT
          inPosition = false;
        }

        if (!inPosition) {
          // CLOSE POSITION
          await closePosition(positionAmt);
        }
      }
    });

    ws.on('close', () => {
      initWs();
    });
  };

  initWs();
};

startBot();
