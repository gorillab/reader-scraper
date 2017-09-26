import MiddelwaresWrapper from '../helpers/RouteMiddlewaresWrapper';
import * as Scraper from './ScraperService';

const fetch = process.env.NODE_ENV === 'mock' ? (req, res) => {
  res.json({
    message: 'Done',
  });
} : MiddelwaresWrapper(Scraper.fetch);

export {
  // eslint-disable-next-line import/prefer-default-export
  fetch,
};
