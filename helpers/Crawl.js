import Xray from 'x-ray';
import upload from './Upload';

const x = Xray();

const crawl = () => {
  x(global.scraperConfig.url, global.scraperConfig.scope, [global.scraperConfig.selector])(
    (err, result) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      } else {
        const posts = global.scraperConfig.map(result);

        upload(posts);
      }
    });
};

export default crawl;
