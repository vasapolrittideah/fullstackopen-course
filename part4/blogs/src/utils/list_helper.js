const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const mostLikes = _.max(blogs.map((blog) => blog.likes));
  const { title, author, likes } = blogs.find(
    (blog) => blog.likes === mostLikes
  );

  return {
    title,
    author,
    likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const result = _.maxBy(
    _.chain(blogs)
      .groupBy('author')
      .map((x) => {
        return {
          author: x[0].author,
          blogs: x.length,
        };
      })
      .value(),
    'blogs',
  );

  return result;
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const result = _.maxBy(
    _.chain(blogs)
      .groupBy('author')
      .map((x) => {
        return {
          author: x[0].author,
          likes: _.sumBy(x, 'likes'),
        };
      })
      .value(),
    'likes',
  );

  return result;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
