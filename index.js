import Fs from 'fs';
import Path from 'path';
import Http from 'http';
import SwaggerTools from 'swagger-tools';
import Jsyaml from 'js-yaml';
import Express from 'express';
import Logger from 'morgan';
import HttpStatus from 'http-status';
import Fetch from 'node-fetch';
import { config } from 'dotenv';
import Health from 'gorillab-health';
import Validator from 'validate.js';

import APIError from './helpers/APIError';

config();

Validator.validators.func = (value, options) => {
  if (options) {
    return Validator.isFunction(value) ? undefined : 'is not a valid function';
  }

  return undefined;
};

Validator.validators.obj = (value, options) => {
  if (options) {
    return Validator.isObject(value) ? undefined : 'is not a valid object';
  }

  return undefined;
};

const init = (scraperConfig) => {
  const validate = Validator(scraperConfig, {
    url: {
      presence: true,
      url: true,
    },
    map: {
      presence: true,
      func: true,
    },
    options: {
      presence: true,
      obj: true,
    },
  });

  if (validate) {
    // eslint-disable-next-line no-console
    console.log('Scraper failed to init', validate);
    process.exit(1);
  }

  global.scraperConfig = scraperConfig;
};

const start = async () => {
  try {
    const scraper = {
      name: process.env.SCRAPER_NAME,
      baseUrl: process.env.SCRAPER_BASE_URL,
      version: process.env.SCRAPER_VERSION,
      frequency: process.env.SCRAPER_FREQUENCY,
      source: process.env.SCRAPER_SOURCE,
    };

    const res = await Fetch(`${process.env.SCRAPER_ADMIN_URL}/register`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(scraper),
    });
    const json = res.json();

    if (!json.ok) {
      throw new Error(json);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Scraper failed to start', error);
    process.exit(1);
  }

  // Initialize the Swagger middleware
  SwaggerTools.initializeMiddleware(Jsyaml.safeLoad(Fs.readFileSync(Path.join(__dirname, '/api/swagger.yaml'), 'utf8')), (middleware) => {
    // Init the server
    const app = Express();

    app.use(Health());
    app.use(Logger('common'));
    app.use(middleware.swaggerMetadata());                        // Interpret Swagger resources
    app.use(middleware.swaggerValidator());                       // Validate Swagger requests
    app.use(middleware.swaggerRouter({                            // Route validated requests
      swaggerUi: Path.join(__dirname, '/swagger.json'),
      controllers: Path.join(__dirname, './controllers'),
      useStubs: process.env.NODE_ENV === 'development',
    }));
    app.use(middleware.swaggerUi());                              // Swagger UI
    app.use((req, res, next) => next(new APIError('API not found', HttpStatus.NOT_FOUND)));
    app.use((err, req, res, next) => {                            // eslint-disable-line
      // eslint-disable-next-line no-console
      console.log(err.stack);
      const errorResponse = {
        message: err.isPublic ? err.message : HttpStatus[err.status],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      };
      res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    });

    // Start the server
    Http.createServer(app).listen(process.env.PORT, process.env.HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`Your server is running at http://${process.env.HOST}:${process.env.PORT}`);
      // eslint-disable-next-line no-console
      console.log(`Swagger-ui is available at http://${process.env.HOST}:${process.env.PORT}/docs`);
    });
  });
};

export {
  init,
  start,
};
