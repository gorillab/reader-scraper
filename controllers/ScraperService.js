import fetchData from '../helpers/Fetch';
import crawl from './../helpers/Crawl';

const fetch = async (req, res) => {
  if (process.env.SCRAPER_TYPE === 'api') {
    fetchData();
  } else {
    crawl();
  }

  res.json({
    message: 'Done',
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  fetch,
};
