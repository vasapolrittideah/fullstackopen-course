const supertest = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../src/models/user');
const helper = require('./test_helper');

const app = require('../src/app');
const api = supertest(app);

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({
      username: 'root',
      passwordHash,
    });

    await user.save();
  }, 10000);

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'vasapol',
      name: 'Vasapol Rittideah',
      password: 'ontheway',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'SuperUser',
      password: 'superman',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('creation fails with proper statuscode and message if username or password too short', async () => {
    const usersAtStart = await helper.usersInDb();

    // Test username
    let newUser = {
      username: 'r',
      name: 'SuperUser',
      password: 'superman',
    };

    let result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Path `username` (`r`) is shorter than the minimum allowed length (3)');

    // Test password
    newUser = {
      username: 'root',
      name: 'SuperUser',
      password: 's',
    };

    result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('password must be at least 3 charactors long');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});
