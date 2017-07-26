import Rp from 'request-promise';
import Moment from 'moment';
import { URL } from 'url';

import upload from './Upload';

const fetch = async () => {
  const d = new Date();
  const twoDateAgo = Moment(new Date(d.setDate(d.getDate() - 2))).format('YYYY-MM-DD');
  const options = {
    uri: 'https://api.github.com/search/repositories',
    qs: {
      access_token: 'bfc2d61a4403d00459224731a23c93ded483527e',
      q: `language:javascript created:>${twoDateAgo}`,
      sort: 'stars',
      order: 'desc',
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,
  };

  try {
    const result = await Rp(options);
    if (result.total_count > 0) {
      const items = result.total_count > process.env.FETCH_LIMIT
        ? result.items.slice(0, process.env.FETCH_LIMIT) : result.items;
      const posts = items.map((item) => {
        const url = new URL(item.url);

        return {
          url: url.href,
          title: item.full_name,
          description: item.description,
          image: item.owner.avatar_url,
          host: url.hostname,
          path: url.pathname,
        };
      });

      upload(posts);
    }
  } catch (err) {
    console.log(err);
  }
};

export default fetch;
