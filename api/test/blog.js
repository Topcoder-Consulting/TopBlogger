
var request = require('supertest');
var app = require('../app');
var Blog = require('../models/Blog');
var User = require('../models/User');
var assert = require('assert');
var Comment = require('../models/Comment');

describe('Getting Blog Api test', function () {

    var user,Blog1;
    before(function(done) {
       
         user = new User({
             handle: 'jeffdonthemic'
        });

         Blog1 = new Blog({
            author: user,
            title: 'Blog Title for test',
            content: 'This is a sample blog content for test',
            isPublished: false,
            createdDate: (new Date).getTime(),
            lastUpdatedDate: (new Date).getTime(),
            slug: 'slug1'
        });
        Blog1.save(function() {
            done();
        });
     });

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

   

    /*
        Check whether the comment has been added or not'
    */

    it('Check function for adding comments', function (done) {
        
        var isValidOrg = function(res) {
            var textCommented = res.body.comments[0].content;
            assert.equal(textCommented,'sggge')
        };
        request(app)
            .post('/api/blogs/' + Blog1._id + '/comments')
            .send({"contentText":"sggge"})
            .expect(200)
            .expect(isValidOrg)
            .end(done)
          
         
            
    });
});

    /*
        Testing function for deleting the comments
    */

    describe('Check for deleting the comments' , function() {
        var user, Blog2;
        before(function(done) {
            user = new User({
                handle: 'goyarpit123'
            });
            
             //user.save(function(){})

            var comment = new Comment({
            author: user,
            content: 'Testing deleting the comment',
            lastUpdateedDate: (new Date).getTime(),
            postedDate: ( new Date).getTime()
             });

            Blog2 = new Blog({
            author: user,
            title: 'Blog Title for testing deleteing comments',
            content: 'This is a sample blog content for test',
            isPublished: false,
            comments:[comment],
            createdDate: (new Date).getTime(),
            lastUpdatedDate: (new Date).getTime(),

            slug: 'slug3'
           });
           Blog2.save(function(err,result) {
                done();
                
        });
    });
        
        it('Testing for comment id does not exist', function(done){
           
                request(app)
                .delete('/api/blogs/' + Blog2._id +'/comments/' + Blog2._id)
                .expect(200)
                .expect({error :'Comment does not exist'})
                .end(done)
        })

        it('testing for  the comment is deleted',function(done){
              var isValidOrg = function(res) {
                assert.equal(res.body.comments.length,0)
              };
              request(app)
              .set(request.user)
              .delete('/api/blogs/' + Blog2._id +'/comments/' + Blog2.comments[0]._id)
              .expect(200)
              .expect(isValidOrg)
              .end(done)


        })

});
