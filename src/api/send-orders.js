const qs = require('qs');
const axios = require('axios').default;

const { encode } = require('../helpers/encode');
const { floor } = require('../helpers/floor');
const { API_URL } = require('../../constants');

const newOrderEndpoint = '/fapi/v1/order';

const createParams = (symbol, side, quantity) => (
  qs.stringify({
    side,
    quantity,
    symbol: symbol.toUpperCase(),
    type: 'MARKET',
    timestamp: Date.now(),
  })
);

const openPosition = async (openedPosition, availableBalance, price, { stepSize, minDecimals }, side) => {
  const quantity = floor(availableBalance / price, minDecimals);

  if (openedPosition || quantity < +stepSize) {
    return;
  }

  const params = createParams('btcusdt', side, quantity);
  const sign = encode(params);

  try {
    await axios({
      method: 'POST',
      url: `${API_URL}${newOrderEndpoint}?${params}&signature=${sign}`,
      headers: {
        'X-MBX-APIKEY': process.env.API_KEY,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const closePosition = async (positionAmt) => {
  if (positionAmt < 0.001 && positionAmt > -0.001) {
    console.log(positionAmt);
    return;
  }

  const side = positionAmt > 0 ? 'SELL' : 'BUY';

  const params = createParams('btcusdt', side, Math.abs(+positionAmt));
  const sign = encode(params);

  try {
    await axios({
      method: 'POST',
      url: `${API_URL}${newOrderEndpoint}?${params}&signature=${sign}`,
      headers: {
        'X-MBX-APIKEY': process.env.API_KEY,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  openPosition,
  closePosition,
};
