const mongoose = require('mongoose');
const supertest = require('supertest');
const Blog = require('../src/models/blog');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const User = require('../src/models/user');

const app = require('../src/app');
const api = supertest(app);

let token = '';
let userId = '';

beforeAll(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = await User.create({
    username: 'root',
    passwordHash,
  });

  userId = user.id;

  const loginRequest = {
    username: 'root',
    password: 'sekret',
  };
  const response = await api.post('/api/login').send(loginRequest);
  token = response.body.token;
}, 20000);

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of helper.initialBlogs) {
    blog.user = userId;
    await Blog.create(blog);
  }
}, 20000);

describe('when there is initially some blogs saved', () => {
  test('return 401 Unauthorized if token is not provided', async () => {
    await api.get('/api/blogs').expect(401);
  });

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('blogs contain id property', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`);

    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe('addition of a new blog', () => {
  test('return 401 Unauthorized if token is not provided', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    };

    await api.post('/api/blogs').send(newBlog).expect(401);
  });

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const totalBlogs = await helper.blogsInDb();
    expect(totalBlogs).toHaveLength(helper.initialBlogs.length + 1);

    const contents = totalBlogs.map((blog) => blog.title);
    expect(contents).toContain('Go To Statement Considered Harmful');
  });

  test('likes is default to zero if missing', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      // likes: 2,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const totalBlogs = await helper.blogsInDb();
    expect(totalBlogs).toHaveLength(helper.initialBlogs.length + 1);

    const contents = totalBlogs.find((blog) => blog.title === newBlog.title);
    expect(contents.likes).toBe(0);
  });

  test('return 400 Bad Request if title missing', async () => {
    const newBlog = {
      // title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  test('return 400 Bad Request if url missing', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      // url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});

describe('deletion of a blog', () => {
  test('return 401 Unauthorized if token is not provided', async () => {
    const blogsAtState = await helper.blogsInDb();
    const blogToDelete = blogsAtState[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtState = await helper.blogsInDb();
    const blogToDelete = blogsAtState[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((r) => r.title);
    expect(contents).not.toContain(blogToDelete.title);
  });

  test('fails with status code 400 if id is not valid', async () => {
    const invalidId = '6513d24120db41920fa3e7f8';

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe('updating of a blog', () => {
  test('return 401 Unauthorized if token is not provided', async () => {
    const blogsAtState = await helper.blogsInDb();
    const blogToUpdate = {
      likes: blogsAtState[0].likes + 10,
    };

    await api
      .put(`/api/blogs/${blogsAtState[0].id}`)
      .send(blogToUpdate)
      .expect(401);
  });

  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtState = await helper.blogsInDb();
    const blogToUpdate = {
      likes: blogsAtState[0].likes + 10,
    };

    const updatedBlog = await api
      .put(`/api/blogs/${blogsAtState[0].id}`)
      .send(blogToUpdate)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(updatedBlog.body.likes).toBe(blogToUpdate.likes);
  });

  test('fails with status code 400 if id is not valid', async () => {
    const invalidId = '6513d24120db41920fa3e7f8';
    const blogToUpdate = { likes: 999999 };

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(blogToUpdate)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          likes: blogToUpdate.likes,
        }),
      ])
    );
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
