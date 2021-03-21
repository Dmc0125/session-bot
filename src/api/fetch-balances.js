const qs = require('qs');
const { default: axios } = require('axios');

const { encode } = require('../helpers/encode');
const { API_URL } = require('../../constants');

const accountEndpoint = '/fapi/v2/account';

const fetchBalances = async () => {
  let account = {};

  try {
    const params = qs.stringify({
      timestamp: Date.now(),
    });
    const sign = encode(params);

    const { data } = await axios({
      method: 'GET',
      url: `${API_URL}${accountEndpoint}?${params}&signature=${sign}`,
      headers: {
        'X-MBX-APIKEY': process.env.API_KEY,
      },
    });

    const { leverage, positionAmt } = data.positions.find(({ symbol }) => symbol === 'BTCUSDT');

    account = {
      availableBalance: data.assets.find(({ asset }) => asset === 'USDT').walletBalance * leverage,
      positionAmt,
    };
  } catch (error) {
    console.log(error);
  }

  return account;
};

module.exports = {
  fetchBalances,
};
