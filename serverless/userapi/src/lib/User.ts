/// <reference path="../../typings/main.d.ts" />


export class User {

    email: string
    userID: string

    public static Signup(){
        
    }

    constructor(email, userID) {
        this.email = email;
        this.userID = userID;
    }
}