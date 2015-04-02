
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

    it('Check function for adding comments', function (done) {

       
        request(app)
            .post('/api/blogs/551d23e240d785c3059c9c06/comments')
            .send({"contentText":"sggge"})
            .expect(200)
            .expect("data is stored",done)
           
    });


});