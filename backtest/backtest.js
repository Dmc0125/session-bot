const { fetchCandlesticks } = require('../src/api/fetch-candlesticks');

let capital = 50;
let entry;

const runBacktest = async () => {
  const candleData = await fetchCandlesticks();

  candleData.forEach(({ openTime, openPrice }) => {
    const openDate = new Date(openTime);

    if (openDate.getUTCHours() === 10 && openDate.getUTCMinutes() === 0) {
      // BUY
      entry = openPrice;
      // console.log('LONG', openDate, entry);
    } else if (openDate.getUTCHours() === 17 && openDate.getUTCMinutes() === 30 && entry) {
      // SELL
      const pnl = openPrice / entry;
      capital *= pnl;
      entry = openPrice;
      // console.log('CLOSE LONG', openDate, entry, capital, pnl);
    }

    if (openDate.getUTCHours() === 0 && openDate.getUTCMinutes() === 30) {
      entry = openPrice;
      // console.log('SHORT', openDate, entry);
    } else if (openDate.getUTCHours() === 5 && openDate.getUTCMinutes() === 0 && entry) {
      const pnl = 1 - (openPrice / entry) + 1;
      capital *= pnl;
      entry = openPrice;
      // console.log('CLOSE SHORT', openDate, entry, capital, pnl);
    }
  });

  console.log(capital, 'Pnl: ', `${(capital / 50 - 1) * 100}%`);
};

runBacktest();
