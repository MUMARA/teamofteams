/// <reference path="../../typings/main.d.ts" />


export class User {

    email: string;
    userID: string;



    constructor(email, userID) {
        this.email = email;
        this.userID = userID;
    }

    Signup(): string {
        return this.email + " // " + this.userID;
    }
}