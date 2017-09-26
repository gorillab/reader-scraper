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

// Load .env
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

export const init = (scraperConfig) => {
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
    console.log('@Scraper validate failed!', validate);
    process.exit(1);
  }

  global.scraperConfig = scraperConfig;
};

export const start = async () => {
  try {
    const scraper = JSON.parse(Fs.readFileSync(`${process.env.PWD}/scraper.json`, 'utf8'));
    scraper.apiUrl = process.env.API_URL;
    const res = await Fetch(`${process.env.SCRAPER_ADMIN_URL}/register`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(scraper),
    });

    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.log('Register scraper failed!');
      process.exit(1);
    }

    const data = await res.json();

    if (!scraper.id || !scraper.source.id) {
      Fs.writeFileSync(`${process.env.PWD}/scraper.json`, JSON.stringify(data));
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Register scraper failed!');
    process.exit(1);
  }

  // Initialize the Swagger middleware
  SwaggerTools.initializeMiddleware(Jsyaml.safeLoad(Fs.readFileSync(Path.join(__dirname, '/api/swagger.yaml'), 'utf8')), (middleware) => {
    // Init the server
    const app = Express();
    // Use gorillab health check
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
      console.log(err.stack);                                     // eslint-disable-line no-console
      const errorResponse = {
        message: err.isPublic ? err.message : HttpStatus[err.status],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      };
      res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    });

    // Start the server
    Http.createServer(app).listen(process.env.PORT, process.env.HOST, () => {
      console.log(`Your server is running at http://${process.env.HOST}:${process.env.PORT}`);        // eslint-disable-line no-console
      console.log(`Swagger-ui is available at http://${process.env.HOST}:${process.env.PORT}/docs`);  // eslint-disable-line no-console
    });
  });
};
