const axios = require('axios');

const { API_URL } = require('../../constants');

const exchangeInfoEndpoint = '/fapi/v1/exchangeInfo';

const fetchLotSize = async () => {
  let lotSize;

  try {
    const { data } = await axios.get(`${API_URL}${exchangeInfoEndpoint}`);

    const btcFilters = data.symbols.find(({ symbol }) => symbol === 'BTCUSDT');

    lotSize = btcFilters.filters.find(({ filterType }) => filterType === 'LOT_SIZE');
    lotSize.minDecimals = lotSize.stepSize.toString().split('.')[1]?.length || 0;
  } catch (error) {
    console.log(error);
  }

  return lotSize;
};

module.exports = {
  fetchLotSize,
};
