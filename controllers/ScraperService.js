import fetchData from '../helpers/Fetch';
import crawlerData from './../helpers/Crawler';

const fetch = async (req, res) => {
  if (process.env.SCRAPER_TYPE === 'api') {
    fetchData();
  } else {
    crawlerData();
  }

  res.json({
    message: 'Done',
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  fetch,
};
