const WebSocket = require('ws');

require('dotenv').config();

const { fetchCandlesticks } = require('./api/fetch-candlesticks');
const { fetchLotSize } = require('./api/fetch-lot-size');
const { fetchBalances } = require('./api/fetch-balances');
const { openPosition, closePosition } = require('./api/send-orders');
const { WSS_URL } = require('../constants');

const initBot = async () => {
  const ws = new WebSocket(`${WSS_URL}/ws/btcusdt@kline_1m`, {
    method: 'SUBSCRIBE',
    id: 2,
  });

  ws.on('open', () => {
    console.log('Connected');
  });

  const filters = await fetchLotSize();
  const [prevCandle] = await fetchCandlesticks(false, 1);

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

      if (openDate.getHours() === 11 && openDate.getMinutes() === 0) {
        // LONG
        await openPosition(positionAmt > 0, availableBalance, candleData.o, filters, 'BUY');
      } else if (openDate.getHours() === 18 && openDate.getMinutes() === 30) {
        // CLOSE LONG
        await closePosition(positionAmt);
      }

      if (openDate.getHours() === 1 && openDate.getMinutes() === 30) {
        // SHORT
        await openPosition(positionAmt > 0, availableBalance, candleData.o, filters, 'SELL');
      } else if (openDate.getHours() === 6 && openDate.getMinutes() === 0) {
        // CLOSE SHORT
        await closePosition(positionAmt);
      }
    }
  });

  ws.on('close', () => {
    initBot();
  });
};

initBot();
