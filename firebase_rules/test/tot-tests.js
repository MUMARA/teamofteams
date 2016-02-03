var bolt = require('firebase-bolt');
var rulesSuite = bolt.rulesSuite;

rulesSuite("Team of Teams Tests", function(test) {
  var uid = test.uid;
  //var groupid = test.groupid;
  test.database("multi-test", "V4pRxvp12zTpi0wRRbYuPYvlopSudm5YX6qGiU1y");
  test.rules("securityrules");
  //...<your tests here>...
  
  //Path  for nodes
  var uId =  uid( "arsalan")
  var groupid = "panacloud";
  var pathforGroupGroupID = "/groups/" + groupid;
  var pathforUserUserID = "/users/" + uId;
  var pathforGroupNameGroupID = "/groups-names/" + groupid
  var pathforGroupMembersGroupidUid = "/group-members/" + groupid + "/" +  uId; 
  
 //Create Team of Teams with User

 test("Team of Teams write Test with User", function(rules){
     rules
          .as("admin")
          .at(pathforUserUserID)
          .write({
              email           : "arsalan@panacloud.com",
              firstName       : "Arsalan",
              lastName        : "Rajput",
              "date-created"  : test.TIMESTAMP,
              status          : 0
         })
         .succeeds("User successfully Created")
         //user Group Memberships
         .as("arsalan")
         .at("/user-group-memberships/" + uid("arsalan") + "/" + groupid)
         .write({
             "membership-type": 1,
             "timestamp": test.TIMESTAMP
         })
         
         //Groups Names
         .as("arsalan")
         .at(pathforGroupNameGroupID)
         .write({
             title: "Rajput"
         }).succeeds("Authenticated user can write on group name")
        
        //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")
              
         .as("arsalan")
         .at(pathforGroupGroupID)
         
         .write({
             privacy : { 
                 invitationType : 1 
             },
             "members-checked-in" : { 
                 count    : 0
             },
             title : "Hello",
             timestamp : test.TIMESTAMP,
             "members-count" : 1,
             "subgroups-count" : 0,
             timeZone : "12345",
             phone    : "124542124612225",
             "owner-img-url" : "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode    :    "1"
             
         })
         .succeeds("Any authanticated user can create group")
          
 });

//Create Team of teams with unAuth User

test("Team of Teams write Test with unAuth User", function(rules){
     rules
         .as("anon")
         .at(pathforGroupGroupID)
         
         .write({
             privacy : { 
                 invitationType : 1 
             },
             "members-checked-in" : { 
                 count    : 0
             },
             title : "Hello",
             timestamp : test.TIMESTAMP,
             "members-count" : 1,
             "subgroups-count" : 0,
             timeZone : "12345",
             phone    : "124542124612225",
             "owner-img-url" : "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode    :    "1"
             
         })
         .fails("Any authanticated user can create group")
          
 });
 
 

//Read Team of Teams test User
 test("Team of Teams Read Tests With User", function(rules){
     rules
          .as("admin")
          .at(pathforUserUserID)
         
          .write({
              email           : "arsalan@panacloud.com",
              firstName       : "Arsalan",
              lastName        : "Rajput",
              "date-created"  : test.TIMESTAMP,
              status          : 0
         })
         .succeeds("User successfully Created")
         
         .as("arsalan")
         .at("/user-group-memberships/" + uid("arsalan") + "/"+ groupid)
          .write({
            "membership-type" : 1,
            "timestamp"       : test.TIMESTAMP
          })

         .as("arsalan")
         .at(pathforGroupGroupID)
         .read()
         .succeeds("user group members can read data")
 });
//Team of teams update test with unauth user


test("team of teams update test with unauth" ,function(rules){
    rules
       // un auth create group test
       .as("anon")
       .at(pathforGroupGroupID)
       .write({
        privacy : { 
                 invitationType : 1 
             },
             "members-checked-in" : { 
                 count    : 0
             },
             title : "un Auth user try to create group but i could not",
             timestamp : test.TIMESTAMP,
             "members-count" : 1,
             "subgroups-count" : 0,
             timeZone : "12345",
             phone    : "124542124612225",
             "owner-img-url" : "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode    :    "1"
             
       }).fails("No authanticated user can create group")
        
        // un auth update group test
       
      .as("anon")
      .at(pathforGroupGroupID)
      .write({
         privacy : { 
                 invitationType : 1 
             },
             "members-checked-in" : { 
                 count    : 0
             },
             title     : "un Auth user try to create group but it cann't create and update",
             timestamp : test.TIMESTAMP,
             "members-count" : 1,
             "subgroups-count" : 0,
             timeZone : "12345",
             phone    : "124542124612225",
             "owner-img-url" : "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode    :    "1"
             
      }).fails("un Auth user try to create group but it cann't create and update")
       
  
})


//Team of teams update test with auth user
 test("team of Teams update by User" ,function(rules){
     rules
          .as("admin")
          .at(pathforUserUserID)
          
          .write({
              email          : "arsalan@panacloud.com",
              firstName      : "Arsalan",
              lastName       : "Rajput",
              "date-created" : test.TIMESTAMP,
              status         :  0
          }).succeeds("Only admin can create user")
       
        //user Group Memberships
         .as("arsalan")
         .at("/user-group-memberships/" + uid("arsalan") + "/" + groupid)
         
         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")
         
         //Groups Names
         .as("arsalan")
         .at(pathforGroupNameGroupID)
         
         .write({
             title: "Panacloud"
         }).succeeds("Authenticated user can write on group name")
        
        //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members created")
         
         //Create Group 
         .as("arsalan")
         .at("/groups/" + groupid)
         
         .write({
             privacy : {
                invitationType : 1 
             },
             "members-checked-in" : {
                 count    :   0 
             },
             title        :   "Panacloud MeetOne",
             timestamp    :   test.TIMESTAMP,
             "members-count"   :   1,
             "subgroups-count" :   0,
             timeZone          :  "1234556",
             "owner-img-url"   :  "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode   : "1"
             
         }).succeeds("Any authanticated user can create group")
              //update Group 
           
             //user Group Memberships
             
         .as("arsalan")
         .at("/user-group-memberships/" + uid("arsalan") + "/" + groupid)
         .write({
             "membership-type": 0,
             "timestamp"      : test.TIMESTAMP
           }).succeeds("user-group-memberships created")
         
         //Groups Names
         .as("arsalan")
         .at(pathforGroupNameGroupID)
         
         .write({
             title: "Rajput"
         }).succeeds("Authenticated user can write on group name")
        
        //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         
         .write({
                  'membership-type': 0,
                   timestamp       : 1452767752756
         }).succeeds("Groups Members created with membershiptype 0")
           
           
           
         .as("arsalan")
         .at(pathforGroupGroupID)
         .write({
              privacy : {
                invitationType : 3 
             },
             "members-checked-in" : {
                 count         :   4 
             },
             title             :   "Mohammad Arsalan Rajput fail",
             timestamp         :   test.TIMESTAMP,
             "members-count"   :   1,
             "subgroups-count" :   0,
             timeZone          :   "1234556",
             "owner-img-url"   :   "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode   : "1"
             
         }).fails("Only Admin and Ownercan update group")
 })

//Team of teams update by Admin 
 test("team of teams update by admin" ,function(rules){
     rules  
         .as("admin")
         .at(pathforUserUserID)
         
         .write({
             email     : "arsalan@panacloud.com",
             firstName : "Arsalan Rajput",
             lastName  : "Rajput",
             "date-created" : test.TIMESTAMP,
             status :    0
         }).succeeds("admin can only create users")
         
          //user Group Memberships
         .as("arsalan")
         .at("/user-group-memberships/" + uid("arsalan") + "/" + groupid)
         
         .write({
             "membership-type": 1,
             "timestamp": test.TIMESTAMP
         }).succeeds("User Group Memberships Created")
         
         //Groups Names
         .as("arsalan")
         .at(pathforGroupNameGroupID)
         
         .write({
             title: "Rajput"
         }).succeeds("Authenticated user can write on group name")
        
        //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members created")
         
         //create group 
         
        .at(pathforGroupGroupID)
        .write({
            privacy : {
                invitationType : 1
             },
             "members-checked-in" : {
                 count         :   2 
             },
             title             :   "Arsalan Rajput",
             timestamp         :   test.TIMESTAMP,
             "members-count"   :   1,
             "subgroups-count" :   0,
             timeZone          :  "1234556",
             "owner-img-url"   :  "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode   : "1"
       }).succeeds("Group Created")
       
       //update Group 
       
        //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 2,
                  timestamp: 1452767752756
         }).succeeds("Group Memebers Created")
         
        .as("arsalan")
        .at(pathforGroupGroupID)
        
        .write({
             privacy : {
                invitationType : 1
             },
             "members-checked-in" : {
                 count         :   2 
             },
             title             :   "Mohammad Arsalan Rajput succeeds",
             timestamp         :   test.TIMESTAMP,
             "members-count"   :   1,
             "subgroups-count" :   0,
             timeZone          :  "12345568989809898",
             "owner-img-url"   :  "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode   : "1"
        }).succeeds("admin can also update group");
       
      
 })

//team of teams update test with owner

 test("team of teams update by owner" ,function(rules){
     rules  
         .as("admin")
         .at(pathforUserUserID)
         .write({
             email     : "arsalan@panacloud.com",
             firstName : "Arsalan Rajput",
             lastName  : "Rajput",
             "date-created" : test.TIMESTAMP,
             status :    0
         }).succeeds("admin can only create users")
         
          //user Group Memberships
         .as("arsalan")
         .at("/user-group-memberships/" + uid("arsalan") + "/" + groupid)
         
         .write({
             "membership-type": 1,
             "timestamp": test.TIMESTAMP
         }).succeeds("User Group Memberships Created")
         
         //Groups Names
         .as("arsalan")
         .at(pathforGroupNameGroupID)
         .write({
             title: "Rajput"
         }).succeeds("Authenticated user can write on group name")
        
        //Groups Members
        .as("arsalan")
        .at(pathforGroupMembersGroupidUid)
        
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Member create")
         
         //create group 
        .at(pathforGroupGroupID)
        
        .write({
            privacy : {
                invitationType : 1
             },
             "members-checked-in" : {
                 count         :   2 
             },
             title             :   "Group update test with owner",
             timestamp         :   test.TIMESTAMP,
             "members-count"   :   1,
             "subgroups-count" :   0,
             timeZone          :  "1234556",
             "owner-img-url"   :  "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode   : "1"
       }).succeeds("Group Created")
       
        //update Group 
       
        //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Member create")
         
        .as("arsalan")
        .at(pathforGroupGroupID)
        
        .write({
             privacy : {
                invitationType : 1
             },
             "members-checked-in" : {
                 count         :   2 
             },
             title             :   "Group update test with owner succeeds",
             timestamp         :   test.TIMESTAMP,
             "members-count"   :   1,
             "subgroups-count" :   0,
             timeZone          :  "12345568989809898",
             "owner-img-url"   :  "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
             signupMode   : "1"
        }).succeeds("owner update group");
       
       
 })


//Group Name Read test with unAuth
   test("Group Name Read Test with unAuth user" ,function(rules){
       rules  
       .as("arsalan") 
        .at(pathforGroupNameGroupID)
         .write({
             title: "Panacloud"
          }).succeeds("Authenticated user can write on group name")
         
           .as("anon")
           .at("/groups-names/")
           .read()
           .fails("Un auth user cannot read group  names")
   })
  
 //Group Name Read  test with Auth
   test("Group Name read Test with Auth user" ,function(rules){
      rules
          .as("admin")
          .at(pathforUserUserID)
          .write({
              email           : "arsalanRajput@panacloud.com",
              firstName       : "Arsalan",
              lastName        : "Rajput",
              "date-created"  : test.TIMESTAMP,
              status          :   0
          }).succeeds("Only admin can create User")
          
           //Groups Names
           .as("arsalan")
          .at(pathforGroupNameGroupID)
          
           .write({
             title: "Panacloud"
          }).succeeds("Authenticated user can write on group name")
         
          .as("arsalan")
          .at("/groups-names")
          .read()
          .succeeds("only Auth user can read Groups name")
   })
   
      //Group Name create  test with unAuth User 
   test("group name write test", function (rules) {
     rules
       .as("anon")
       .at(pathforGroupNameGroupID)
       .write({
         title: "Panacloud"
       }).fails("Authenticated user can write on group name")

   })
   
   //Group Name create  test with Auth User
   test("group name write test" ,function(rules){
      rules
      .as("admin")
      .at(pathforUserUserID)
      
      .write({
          email     : "arsalan@panacloud.com",
          firstName : "Arsalan",
          lastName  : "Rajput",
          "date-created"  :  test.TIMESTAMP,
          status    : 0
      }).succeeds("Admin can create users")
      
      .as("arsalan")
      .at(pathforGroupNameGroupID)
      
      .write({
          title : "Panacloud"
      }).succeeds("Authenticated user can write on group name")
   
})  
   //Group Name update  test with un Auth  user
  
    test("group name update test with unauth" ,function(rules){
        rules  
            .as("admin")
            .at(pathforUserUserID)
            .write({
                 email : "arsalan@panacloud.com",
                 firstName : "Arsalan",
                 lastName : "Rajput",
                 "date-created"  :  test.TIMESTAMP,
                 status : 0
            }).succeeds("Only admin can create users")
            
            .as("arsalan")
            .at(pathforGroupNameGroupID)
      
              .write({
                  title: "Testing rules for group name update with unauth user "
              }).succeeds("Any auth user can create groups")
              
              // .as("arsalan")
              // .at(pathforGroupMembersGroupidUid)
              
              // .write({
              //     'membership-type': 3
              // })
              
              .as("anon")
              .at(pathforGroupNameGroupID)
              
              .write({
                  title: "Arsalan Rajput",
                  groupImgUrl: "http://www.google.com"
              }).fails("unauth user can not update group name")
      })
      
      
      //Group Name update  test with Auth  user
    
    test("group name update test with user" ,function(rules){
        rules  
            .as("admin")
            .at(pathforUserUserID)
            .write({
                 email : "arsalan@panacloud.com",
                 firstName : "Arsalan",
                 lastName : "Rajput",
                 "date-created"  :  test.TIMESTAMP,
                 status : 0
            }).succeeds("Only admin can create users")
            
            .as("arsalan")
            .at(pathforGroupNameGroupID)
      
              .write({
                  title: "Testing rules for group name update with auth user"
              }).succeeds("Any auth user can create groups")
              
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)
              
              .write({
                  'membership-type': 0
              })
              
              .as("arsalan")
              .at(pathforGroupNameGroupID)
              
              .write({
                  title: "test succeesfull ",
                  groupImgUrl: "http://www.google.com"
              }).fails("auth user can not update group name")
      })
      

      
       //Group Name update  test with Owner

    test("group name update test with Owner" ,function(rules){
        rules  
            .as("admin")
            .at(pathforUserUserID)
            .write({
                 email           : "arsalan@panacloud.com",
                 firstName       : "Arsalan",
                 lastName        : "Rajput",
                 "date-created"  :  test.TIMESTAMP,
                 status          :  0
            }).succeeds("Only admin can create users")
            
            .as("arsalan")
            .at(pathforGroupNameGroupID)
            
            .write({
                  title: "Testing rules for group name update with Owner"
              }).succeeds("Any auth user can create groups")
              
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)
              
             .write({
                  'membership-type': 1,
                   timestamp       : 1452767752756
                   
              })
              .as("arsalan")
              .at(pathforGroupNameGroupID)
              
              .write({
                  title: "succesfully rules testing for group name update with Owner",
                  groupImgUrl: "http://www.google.com"
              }).succeeds("Owner can update group name")
      })
    
      
     
       //Group Name update  test with Admin
    
    test("group name update test with Admin" ,function(rules){
        rules  
            .as("admin")
            .at(pathforUserUserID)
            .write({
                 email           : "arsalan@panacloud.com",
                 firstName       : "Arsalan",
                 lastName        : "Rajput",
                 "date-created"  :  test.TIMESTAMP,
                 status          :  0
            }).succeeds("Only admin can create users")
            
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)
              
              .write({
                  'membership-type': 1,
                   timestamp       : 1452767752756
              }).succeeds("Group Members created")
              
              .as("arsalan")
              .at(pathforGroupNameGroupID)
        
                .write({
                    title: "Testing rules for group name update with admin"
                }).succeeds("Any auth user can create groups")
                
                .as("arsalan")
                .at("/user-group-memberships/" + uid("arsalan") + "/"+ groupid)
                .write({
                 "membership-type" : 1,
                 "timestamp"       : test.TIMESTAMP
                })
                .as("arsalan")
                .at(pathforGroupMembersGroupidUid)
                .write({
                    'membership-type': 2,
                    timestamp        : 1452767752756
                }).succeeds("Group Members created")
                
                .as("arsalan")
                .at(pathforGroupNameGroupID)
                .write({
                    title: "succesfully rules testing for group name update with admin",
                    groupImgUrl: "http://www.google.com"
                }).succeeds("Admin can also  update group name")
      })
//-----------------------------------------------------------------------
 
 
 /*
 test("User Read Tests", function(rules){
     rules
        .as('admin')
        .at('/users/' + uid('zia'))
        .write({
            email         : "zia@panacloud.com",
            firstName    : "Zia",
            lastName     : "Khan",
            "date-created"  : test.TIMESTAMP,
             status        : 0
        })
        //.as('arsalan')
        .at('/users/' + uid('zia'))
        .read()
        .succeeds("Any authenticated user can read user data")
 });   */ 
 
 
 /** 
    test("Inbox tests.", function(rules) {
    rules
      .as('tom')
      .at('/users/' + uid('bill') + '/inbox/1')
      .write({
        from: uid('tom'),
        to: uid('bill'),
        message: 'Hi, Bill!'
      })
      .succeeds("Normal write.")

      .write(null)
      .fails("Sender cannot delete sent message.")

      .write({
        from: uid('tom'),
        to: uid('bill'),
        message: 'Hello, again!'
      })
      .fails("Sender cannot overwrite.")

      .at('/users/' + uid('bill') + '/inbox/2')
      .write({
        from: uid('tom'),
        to: uid('bill'),
        message: 'Hi, Bill!',
        spurious: 'supurious data'
      })
      .fails("No undefined fields.")

      .write({
        from: uid('george'),
        to: uid('bill'),
        message: 'Hi, Bill!'
      })
      .fails("From field should be correct.")

      .at('/users/' + uid('bill') + '/inbox/1/message')
      .write("Bill gets my inheritance")
      .fails("Cannnot tamper with message.")

      .at('/users/' + uid('bill') + '/inbox/1/from')
      .write(uid('bill'))
      .fails("Cannot tamper with from field.")

      .as('bill')
      .at('/users/' + uid('bill') + '/inbox/1')
      .write(null)
      .succeeds("Receiver can delete received mail.");
  });


  test("Outbox tests.", function(rules) {
    rules
      .as('bill')
      .at('/users/' + uid('bill') + '/outbox/1')
      .write({
        from: uid('bill'),
        to: uid('tom'),
        message: "Hi, Tom!"
      })
      .succeeds("Normal write.")

      .as('tom')
      .write(null)
      .fails("Receiver cannot delete outbox message.")

      .as('bill')

      .at('/users/' + uid('bill') + '/outbox/1/message')
      .write("Bill gets my inheritance.")
      .fails("Sender cannot tamper with outbox message.")

      .at('/users/' + uid('bill') + '/outbox/1/from')
      .write('bill')
      .fails("Can't do a partial overwrite - even if same data.")

      .as('bill')
      .at('/users/' + uid('bill') + '/outbox/2')
      .write({
        from: 'joe',
        to: 'tom',
        message: "Hi, Tom!"
      })
      .fails("From field must be correct.")

      .write({
        from: 'bill',
        to: 'tom',
        message: "Hi, Tom!",
        spurious: "spurious"
      })
      .fails("No undefined fields.")

      .at('/users/' + uid('bill') + '/outbox/1')
      .write(null)
      .succeeds("Sender can delete sent mail in outbox.");
  });

  test("Read permissions.", function(rules) {
    rules
      .as('bill')
      .at('/users/' + uid('bill') + '/outbox/1')
      .write({
        from: uid('bill'),
        to: uid('tom'),
        message: 'Hi, Tom!'
      })
      .succeeds("Normal write.")

      .as('tom')
      .at('/users/' + uid('bill') + '/inbox/1')
      .write({
        from: uid('tom'),
        to: uid('bill'),
        message: 'Hi, Bill!'
      })

      .as('bill')
      .at('/users/' + uid('bill') + '/inbox/1')
      .read()
      .succeeds("Can read own inbox.")

      .at('/users/' + uid('bill') + '/outbox/1')
      .read()
      .succeeds("Can read own outbox.")

      .as('tom')
      .at('/users/' + uid('bill') + '/inbox/1')
      .read()
      .fails("Can't read Bill's inbox.")

      .at('/users/' + uid('bill') + '/outbox/1')
      .read()
      .fails("Can't read Bills outbox.");
  });*/ 
})