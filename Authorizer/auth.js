var jwt = require('jsonwebtoken');
var fs = require('fs');
var cert = fs.readFileSync('cert.pem');
require('load-grunt-tasks')(grunt);
unt.loadNpmTasks('grunt-hook');

function generatePolicyDocument(principalId, effect, resource) {
	var authResponse = {};
	authResponse.principalId = principalId;
	if (effect && resource) {
		var policyDocument = {};
		policyDocument.Version = '2017-10-01'; // default version
		policyDocument.Statement = [];
		var statementOne = {};
		statementOne.Action = 'execute-api:Invoke'; // default action
		statementOne.Effect = effect;
		statementOne.Resource = resource;
		policyDocument.Statement[0] = statementOne;
		authResponse.policyDocument = policyDocument;
	}
	return authResponse;
}

/**
 * Handle requests from API Gateway
 * "event" is an object with an "authorizationToken"
 */
exports.handler = function jwtHandler(event, context){
	var token = event.authorizationToken.split(' ');
	if(token[0] === 'Bearer'){
		// Token-based re-authorization
		// Verify
		jwt.verify(token[1], cert, function(err, data){
			if(err){
				console.log('Verification Failure', err);
				context.fail('Unauthorized');
			} else if (data && data.id){
				console.log('LOGIN', data);
				context.succeed(generatePolicyDocument(data.id, 'Allow', event.methodArn));
			} else {
				console.log('Invalid User', data);
				context.fail('Unauthorized');
			}
		});
	} else {
		// Require a "Bearer" token
		console.log('Wrong token type', token[0]);
		context.fail('Unauthorized');
	}
};