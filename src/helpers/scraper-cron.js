const Fetch = require('node-fetch');
const { CronJob } = require('cron');

const Source = require('./../source.model.js');
const Post = require('./../post.model.js');
const URL = require('url');

const sourceJobs = new Map();

const fetchPosts = async ({ sourceId, sourceUrl }) => {
  try {
    const posts = await (await Fetch(sourceUrl)).json();

    for (const { content, title = content, image, url } of posts.reverse()) {
      if (title) {
        const postUrl = URL.parse(url) || {};
        const {
          hostname: host,
          pathname: path,
        } = postUrl;

        const post = await Post.findOne({
          isDeleted: false,
          host,
          path,
        });

        if (!post) {
          const newPost = new Post({
            title,
            content,
            image,
            url,
            host,
            path,
            source: sourceId,
          });
          await newPost.createByUser();
        } else {
          post.created.at = new Date();
          await post.updateByUser();
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const removeSourceJob = ({ _id }) => {
  const sourceId = _id.toString();
  if (sourceJobs.has(sourceId)) {
    sourceJobs.get(sourceId).stop();
    sourceJobs.delete(sourceId);
  }
};

const addSourceJob = async ({ _id, frequency, url: sourceUrl }) => {
  removeSourceJob({
    _id,
  });

  const sourceId = _id.toString();

  sourceJobs.set(sourceId, new CronJob(frequency, async () => { // eslint-disable-line
    fetchPosts({
      sourceId,
      sourceUrl,
    });
  }, null, true, 'Asia/Ho_Chi_Minh'));
};

const loadSourceJobs = async () => {
  const query = {
    isDeleted: false,
    isActive: true,
  };

  const sources = await Source.list({
    query,
  });

  for (const source of sources) {
    await addSourceJob(source);
  }
};

const loadSource = async () => {
  const query = {
    isDeleted: false,
    isActive: true,
  };

  const sources = await Source.list({
    query,
  });

  for (const { _id: sourceId, url: sourceUrl } of sources) {
    await fetchPosts({
      sourceId,
      sourceUrl,
    });
  }
};

module.exports = {
  addSourceJob,
  removeSourceJob,
  loadSourceJobs,
  loadSource,
};
