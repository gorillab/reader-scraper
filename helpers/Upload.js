import Fetch from 'node-fetch';

const upload = async (posts) => {
  try {
    await Fetch(`${process.env.SCRAPER_ADMIN_URL}/upload`, {
      headers: {
        'Content-Type': 'application/json',
        'scraper-base-url': `${process.env.SCRAPER_BASE_URL}`,
      },
      method: 'POST',
      body: JSON.stringify(posts),
    });
    // eslint-disable-next-line no-console
    console.log('Upload successfully!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

export default upload;
