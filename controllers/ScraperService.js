import { URL } from 'url';
import { BAD_REQUEST } from 'http-status';
import fetchData from '../helpers/Fetch';
import crawl from './../helpers/Crawl';
import APIError from '../helpers/APIError';

const adminUrl = new URL(process.env.SCRAPER_ADMIN_URL);

const fetch = (req, res, next) => {
  if (adminUrl.host !== req.headers.host) {
    return next(new APIError('Scraper admin url invalid', BAD_REQUEST, true));
  }

  if (process.env.SCRAPER_TYPE === 'api') {
    fetchData();
  } else {
    crawl();
  }

  return res.json({
    message: 'Done',
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  fetch,
};
