import Fetch from 'node-fetch';
import upload from './Upload';

const fetch = async () => {
  try {
    const response = await Fetch(global.scraperConfig.url, global.scraperConfig.options);

    const result = await response.json();

    const posts = global.scraperConfig.map(result);
    if (posts) {
      upload(posts);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

export default fetch;
