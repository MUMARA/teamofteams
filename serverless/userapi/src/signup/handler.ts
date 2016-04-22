/// <reference path="../../typings/main.d.ts" />

import {User} from '../lib/User';


exports.handler = function(event, context: Context) {
   var user = new User(event.email, event.userID); 
    
   context.succeed(user);
};

