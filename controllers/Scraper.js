import MiddelwaresWrapper from '../helpers/RouteMiddlewaresWrapper';
import * as Scraper from './ScraperService';

export const fetch = MiddelwaresWrapper(Scraper.fetch);

export const health = MiddelwaresWrapper(Scraper.health);
