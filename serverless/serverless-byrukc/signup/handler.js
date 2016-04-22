'use strict';

module.exports.handler = function(event, context) {

  context.succeed({ 'id': event.id,  'name': event.name, "age": 102 });
  // return cb(null, {
  //   message: 'Go Serverless! Your Lambda function executed successfully!'
  // });
};



function returnMessage(a,b) { 
  return a + " // " + b;
}