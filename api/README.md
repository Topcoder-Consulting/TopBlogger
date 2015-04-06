1, Set the JWT Token
	start the app: node app.js 
	register a user and get token from http://localhost:3000
	set the JWTToken configuration variable in ./config/config.js to the token 

2, Test the API
	start the app: 
		$node app.js 
	load the mocked blogs into database: 
		$wget http://localhost:3000/tmp/load
    run mocha test:
    	$./node_modules/.bin/mocha ./test/getBlog.js
    	
2, Demo video:
	https://youtu.be/FVryycaK9tE