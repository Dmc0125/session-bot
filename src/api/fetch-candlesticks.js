const axios = require('axios').default;

const { API_URL } = require('../../constants');

const candlesticksEndpoint = '/fapi/v1/klines';

const formatToCandleData = (data) => (
  // eslint-disable-next-line no-unused-vars
  data.map(([openTime, o, h, l, c]) => ({
    openTime,
    closePrice: c,
    openPrice: o,
  }))
);

const fetchCandlesticks = async (extendData = true, limit) => {
  let candleData;

  try {
    const { data } = await axios.get(`${API_URL}${candlesticksEndpoint}?symbol=BTCUSDT&interval=30m&limit=${limit || 1000}`);

    // eslint-disable-next-line no-unused-vars
    candleData = formatToCandleData(data);

    if (extendData) {
      const { data: prevData } = await axios.get(`${
        API_URL
      }${
        candlesticksEndpoint
      }?symbol=BTCUSDT&interval=30m&limit=1000&endTime=${
        candleData[0].openTime - 1000 * 60 * 30
      }&startTime${
        candleData[0].openTime - 1000 * 60 * 30 * 1000
      }`);

      candleData = [...formatToCandleData(prevData), ...candleData];
    }
  } catch (error) {
    console.log(error);
  }

  return candleData;
};

module.exports = {
  fetchCandlesticks,
};
