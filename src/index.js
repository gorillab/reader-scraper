require('dotenv').config();

const { CronJob } = require('cron');

const Mongoose = require('./db/mongoose');
const { loadSourceJobs } = require('./helpers/scraper-cron');

Mongoose.connection.on('connected', () => {
  console.log('Cron service is running...');
  new CronJob(process.env.MAIN_CRON, async () => { // eslint-disable-line
    loadSourceJobs();
  }, null, true, 'Asia/Ho_Chi_Minh');
});
