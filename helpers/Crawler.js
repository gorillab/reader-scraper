import Xray from 'x-ray';
import upload from './Upload';

const x = Xray();

const crawler = () => {
  x(global.scraperConfig.url, global.scraperConfig.scope, [global.scraperConfig.selector])
  .limit(process.env.FETCH_LIMIT)((err, result) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } else {
      const posts = global.scraperConfig.map(result);

      upload(posts);
    }
  });
};

export default crawler;
