
var request = require('supertest');
var app = require('../app');

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

describe('Create Blog', function() {

    it('should return 201 response for basic new blog creation', function(done) {
        request(app)
            .post('/api/blogs')
            .set('Content-Type', 'application/json')
            .set('Authorization','JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImdveWFycGl0IiwiaGFuZGxlIjoiZ295YWwuYXJwaXQuOTEiLCJpYXQiOjE0Mjc5MDkzMDJ9.islU8i8oX-x1H68OgtThquigmurGOFvw3W6L8gMMq8Y')
            .send({
                "title": "title 01",
                "slug": "slug 01",
                "publishedDate": 123456,
                "createdDate": 123456,
                "lastUpdatedDate": 123456,
                "content": "content 01",
                "isPublished": false,
                "author" : {
                    "_id": "551ee459b49473f52409f5ce",
                    "handle" : "user1"
                },
                "tags" : [
                    {
                        "name": "tag01"
                    },
                    {
                        "name": "tag02"
                    }
                    ]
            })
            .expect('Content-Type', /json/)
            .expect(201)
            .end(function(err,res) {
            	if (err) {
            		throw err;
            	}
           		done();
           	})
    })

    it('should return 400 response for invalid input', function(done) {
        request(app)
            .post('/api/blogs')
            .set('Content-Type', 'application/json')
            .set('Authorization','JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImdveWFycGl0IiwiaGFuZGxlIjoiZ295YWwuYXJwaXQuOTEiLCJpYXQiOjE0Mjc5MDkzMDJ9.islU8i8oX-x1H68OgtThquigmurGOFvw3W6L8gMMq8Y')
            .send({
                "title": "title 01"
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err,res) {
            	if (err) {
            		throw err;
            	}
           		done();
           	})
    })

});
