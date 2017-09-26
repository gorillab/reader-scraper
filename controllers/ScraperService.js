import fetchData from '../helpers/Fetch';

const fetch = async (req, res) => {
  fetchData();

  res.json({
    message: 'Done',
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  fetch,
};
