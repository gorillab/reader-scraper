import MiddelwaresWrapper from '../helpers/RouteMiddlewaresWrapper';
import * as Scraper from './ScraperService';

export const fetch = MiddelwaresWrapper(Scraper.fetch);

export const healthCheck = MiddelwaresWrapper(Scraper.healthCheck);
