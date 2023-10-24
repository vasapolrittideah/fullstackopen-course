const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({ user: request.user.id.toString() }).populate(
    'user',
    { username: 1, name: 1 }
  );
  return response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body;
  const user = request.user;

  if (!title || !url) {
    return response.status(400).json({
      error: 'title and url are required',
    });
  }

  const blog = await Blog.create({
    title,
    author,
    url,
    likes: likes ?? 0,
    user: user.id,
  });

  user.blogs = user.blogs.concat(blog._id);
  await user.save();

  return response.status(201).json(blog);
});

blogsRouter.put('/:id', async (request, response) => {
  const user = request.user;

  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(400).json({
      error: 'blog does not exist',
    });
  }

  const { title, author, url, likes } = request.body;

  if (blog.user.toString() === user.id.toString()) {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blog.id,
      {
        title,
        author,
        url,
        likes,
      },
      {
        new: true,
        context: 'query',
      }
    );
    return response.json(updatedBlog);
  }

  return response.status(401).json({
    error: 'blog does not exist to the user',
  });
});

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user;

  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(400).json({
      error: 'blog does not exist',
    });
  }

  if (blog.user.toString() === user.id.toString()) {
    await Blog.deleteOne(blog);
    return response.status(204).end();
  }

  return response.status(401).json({
    error: 'blog does not exist to the user',
  });
});

module.exports = blogsRouter;
