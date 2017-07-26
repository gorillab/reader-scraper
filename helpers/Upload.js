import Rp from 'request-promise';

const upload = async (posts) => {
  const options = {
    method: 'POST',
    uri: `${process.env.SCRAPER_ADMIN_URL}/upload`,
    body: posts,
    json: true,
  };

  try {
    await Rp(options);
    console.log('Upload successfully!');
  } catch (err) {
    console.log(err);
  }
};

export default upload;
