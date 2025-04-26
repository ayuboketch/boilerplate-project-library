// tests/2_functional-tests.js
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testId;

  test('POST /api/books with title => create book object/expect book object', function(done) {
    chai.request(server)
      .post('/api/books')
      .send({ title: 'Test Book' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'title');
        assert.property(res.body, '_id');
        assert.equal(res.body.title, 'Test Book');
        testId = res.body._id;
        done();
      });
  });

  test('POST /api/books with no title given', function(done) {
    chai.request(server)
      .post('/api/books')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field title');
        done();
      });
  });

  test('GET /api/books => array of books', function(done) {
    chai.request(server)
      .get('/api/books')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'title');
        assert.property(res.body[0], 'commentcount');
        done();
      });
  });

  test('GET /api/books/[id] with id not in db', function(done) {
    chai.request(server)
      .get('/api/books/000000000000000000000000')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  test('GET /api/books/[id] with valid id in db', function(done) {
    chai.request(server)
      .get(`/api/books/${testId}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.property(res.body, 'comments');
        done();
      });
  });

  test('POST /api/books/[id] with comment', function(done) {
    chai.request(server)
      .post(`/api/books/${testId}`)
      .send({ comment: 'Nice read' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'comments');
        assert.include(res.body.comments, 'Nice read');
        done();
      });
  });

  test('POST /api/books/[id] without comment field', function(done) {
    chai.request(server)
      .post(`/api/books/${testId}`)
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field comment');
        done();
      });
  });

  test('POST /api/books/[id] with comment, id not in db', function(done) {
    chai.request(server)
      .post('/api/books/000000000000000000000000')
      .send({ comment: 'Test' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  test('DELETE /api/books/[id] with valid id in db', function(done) {
    chai.request(server)
      .delete(`/api/books/${testId}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'delete successful');
        done();
      });
  });

  test('DELETE /api/books/[id] with id not in db', function(done) {
    chai.request(server)
      .delete('/api/books/000000000000000000000000')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  test('DELETE /api/books => delete all books', function(done) {
    chai.request(server)
      .delete('/api/books')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'complete delete successful');
        done();
      });
  });
});
