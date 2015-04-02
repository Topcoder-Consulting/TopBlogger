
var request = require('supertest');
var app = require('../app');
var User = require('../models/User');
var Blog = require('../models/Blog');

describe('Getting Blog test', function () {



    it('should return 200 response while accessing api', function (done) {
        request(app)
            .get('/api/blogs/4280209828')
            .set('Accept', 'application/json')
            .set('Authorization','JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImdveWFycGl0IiwiaGFuZGxlIjoiZ295YWwuYXJwaXQuOTEiLCJpYXQiOjE0Mjc5MDkzMDJ9.islU8i8oX-x1H68OgtThquigmurGOFvw3W6L8gMMq8Y')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res) {
            	if (err) {
            		throw err;
            	}
           		done();
           	})
    });
});

describe('Deleting Blog test using POST /blogs/{id}', function () {

    var sampleUser1, sampleUser2, sampleBlog1;
    before(function() {
        sampleUser1 = new User({
          handle: 'a',
          JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImEiLCJoYW5kbGUiOiJhIiwiaWF0IjoxNDI3OTEzNzk5fQ.f-vl6KhO24kzEDyCvqPjWym4hc_X5LOHJVR7SPtWGr8'
        });
        sampleUser1.save();
        sampleUser2 = new User({
            handle: 'b',
            JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImIiLCJoYW5kbGUiOiJiIiwiaWF0IjoxNDI3OTg2MTE1fQ.2i21rAtgoCSZMwbeSeU3utazkKJN-TmXh80UoW-B-YU'
        })
        sampleUser2.save();

        sampleBlog1 = new Blog({
          author: sampleUser1,
          title: 'Blog Title for test',
          content: 'This is a sample blog content for test',
          isPublished: false,
          createdDate: (new Date).getTime(),
          lastUpdatedDate: (new Date).getTime(),
          slug: 'slug1'
        });
        sampleBlog1.save();
    })

    it('should return 403 when user othen than author tries to delete a post', function(done) {
        request(app)
        .delete('/api/blogs/' + sampleBlog1._id)
        .set('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImIiLCJoYW5kbGUiOiJiIiwiaWF0IjoxNDI3OTg2MTE1fQ.2i21rAtgoCSZMwbeSeU3utazkKJN-TmXh80UoW-B-YU')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done();
        });
    });

    it('should return 401 when authorization is not provided', function(done) {
        request(app)
        .delete('/api/blogs/' + sampleBlog1._id)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done();
        });
    });

    it('should return 200 response while deleting a blog', function (done) {
        request(app)
        .delete('/api/blogs/' + sampleBlog1._id)
        .set('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImEiLCJoYW5kbGUiOiJhIiwiaWF0IjoxNDI3OTEzNzk5fQ.f-vl6KhO24kzEDyCvqPjWym4hc_X5LOHJVR7SPtWGr8')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done();
        });
    });

    it('should return 400 response when trying to delete a non existent blog post', function (done) {
        request(app)
        .delete('/api/blogs/' + sampleBlog1._id)
        .set('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImEiLCJoYW5kbGUiOiJhIiwiaWF0IjoxNDI3OTEzNzk5fQ.f-vl6KhO24kzEDyCvqPjWym4hc_X5LOHJVR7SPtWGr8')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done();
        });
    });

});