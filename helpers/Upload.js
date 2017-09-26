import Fetch from 'node-fetch';

const upload = async (posts) => {
  const scraperUrl = process.env.SCRAPER_API_URL;
  if (scraperUrl) {
    try {
      await Fetch(`${process.env.SCRAPER_ADMIN_URL}/upload`, {
        headers: {
          'Content-Type': 'application/json',
          'scraper-api-url': scraperUrl,
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
  }
};

export default upload;
