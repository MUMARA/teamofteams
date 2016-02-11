var bolt = require('firebase-bolt');
var rulesSuite = bolt.rulesSuite;

rulesSuite("Team of Teams Tests", function(test) {
  var uid = test.uid;
  //var groupid = test.groupid;
  test.database("multi-test", "V4pRxvp12zTpi0wRRbYuPYvlopSudm5YX6qGiU1y");
  test.rules("securityrules");
  //...<your tests here>...

  //Path  for nodes
  var uId                                      =   uid( "arsalan");
  var groupid                                  =   "panacloud";
  var pathforGroupGroupID                      =   "/groups/" + groupid;
  var pathforUserUserID                        =   "/users/" + uId;
  var pathforGroupNameGroupID                  =   "/groups-names/" + groupid;
  var pathforGroupMembersGroupidUid            =   "/group-members/" + groupid + "/" +  uId;
  var pathforUserGroupMembershipUIDGroupId     =   '/user-group-memberships/' + uId + "/" + groupid;
  var pathforGroupCheckInCurrent               =   "/group-check-in-current/" + groupid + "/" +  uId;
  var pathforGroupCheckInRecords               =   "/group-check-in-records/" +  groupid + "/" +  uId;
  var pathforGroupMembershipRequestsGroupIdUid =   "/group-membership-requests/" + groupid + "/" +  uId;
  var pathforGroupMembershipRequestsByUser     =   "/group-membership-requests-by-user/" + uId + "/" + groupid;
  var pathforGroupChannelGroupIdChannelID      =   "/group-channel/" + groupid + "/panachat";
  var pathforGroupMessagesGroupIdChannelIdmessagesid = "/group-messages/" + groupid + "/panachat" + "/message01";
   //---------------------------------------------------
  //User Data
  var usersData = { email           : "arsalan@panacloud.com",
                    firstName       : "Arsalan",
                    lastName        : "Rajput",
                    "date-created"  : test.TIMESTAMP,
                    status          : 0      };
//Group Data
  var groupData = {
                    privacy : {
                        invitationType : 1
                    },
                    "members-checked-in-count" : 0,
                    title             : "Hello",
                    timestamp         : test.TIMESTAMP,
                    "members-count"   : 1,
                    "subgroups-count" : 0,
                    timeZone          : "12345",
                    phone             : "124542124612225",
                    "group-owner-id"  : "panacloud"
  };
  //Group Check In Current Data
 var GroupCheckInCurrentData = {
                  'group-url'           : "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
                   id                   : "K8nI4WqFq6BTiXZkEqn",
                   location             :  {
                     lat                :  12345,
                     lon                :  67890
                   },
                   message              :  "Hello World",
                   "source-device-type" : 1,
                   "source-type"        : 1,
                   timestamp            : test.TIMESTAMP,
                   type                 : 1
};
//Group CheckIn Record Data
var GroupCheckInRecordData = {
                  'group-url'           : "https://www.google.com.pk/imgres?imgurl=https://www.google.com/doodle4google/images/splashes/featured.png&imgrefurl=https://www.google.com/intl/en_ie/doodle4google/&h=485&w=1005&tbnid=C2v5frVt68mtsM:&docid=o9VhKqRKg4PkNM&ei=iU2vVorZFMjxULLRkZgB&tbm=isch&ved=0ahUKEwjKwfPGxtbKAhXIOBQKHbJoBBMQMwg7KAwwDA",
                   location             :  {
                       lat                :  12345,
                       lon                :  67890
                   },
                   message              :  "Hello World",
                   "source-device-type" : 1,
                   "source-type"        : 1,
                   timestamp            : test.TIMESTAMP,
                   type                 : 1
};
//Group Activity Streams Data
var GroupActivityStreamsData = {
                       actor    :   {
                         displayName   :   "Arsalan",
                         email         :   "a4arshi@yahoo.com",
                         id            :   '123445',
                         type          :    "user"
                     },
                     displayName       :   "Arsalan Create this group",
                     language          :   "en",
                     object            :   {
                          displayName  :   "rajput",
                          id           :   "panacloud",
                          type         :   "group",
                          url          :   "http://www.google.com"
                     },
                     published         :   1233445566666,
                     verb              :   "group-creation"
};

//Group Channel Data
var  GroupChannelData =  { "created-by" : "Arsalan" ,
                            timestamp   : test.TIMESTAMP,
                            title       : "Panachat" };
//Group Messages Data
var GroupMessagesData = {
                  from       :   uId,
                  text       :   "hello World",
                  timestamp  :   test.TIMESTAMP
};
    //Testing Start from here
//==============================================================================================
//Create Team of Teams with User
/*
var GroupMembershipsRequestData = { message : "Please Add me in this group" , timestamp : test.TIMESTAMP };
 test("Team of Teams write Test with User", function(rules){
     rules
          .as("admin")
          .at(pathforUserUserID)
          .write(usersData)
          .succeeds("User successfully Created")

         //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)
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

          //Group Create
         .as("arsalan")
         .at(pathforGroupGroupID)

         .write(groupData)
         .succeeds("Any authanticated user can create group")

         //Group Activity Streams create
         .as('arsalan')
         .at('/group-activity-streams/' +groupid)
         .write(GroupActivityStreamsData)
         .succeeds("auth user can write group-activity-streams");

 });

//Create Team of teams with unAuth User

test("Team of Teams write Test with unAuth User", function(rules){
     rules
         .as("anon")
         .at(pathforGroupGroupID)

         .write(groupData)
         .fails("Any authanticated user can create group");

 });



//Read Team of Teams test User
 test("Team of Teams Read Tests With User", function(rules){
     rules
          .as("admin")
          .at(pathforUserUserID)

          .write(usersData)
         .succeeds("User successfully Created")

         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)
          .write({
            "membership-type" : 1,
            "timestamp"       : test.TIMESTAMP
          })

         .as("arsalan")
         .at(pathforGroupGroupID)
         .read()
         .succeeds("user group members can read data");
 });
//Team of teams update test with unauth user


test("team of teams update test with unauth" ,function(rules){
    rules
       // un auth create group test
       .as("anon")
       .at(pathforGroupGroupID)
       .write(groupData)
       .fails("No authanticated user can create group")

        // un auth update group test

      .as("anon")
      .at(pathforGroupGroupID)
      .write(groupData)
      .fails("un Auth user try to create group but it cann't create and update");


});
*/
//Team of teams update test with auth user
 test("team of Teams update by User" ,function(rules){
     rules
          .as("admin")
          .at(pathforUserUserID)

          .write(usersData).succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

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

         .write(groupData)
         .succeeds("Any authanticated user can create group")

         //Group Activity Streams create
         .as('arsalan')
         .at('/group-activity-streams/' +groupid)
         .write(GroupActivityStreamsData)
         .succeeds("auth user can write group-activity-streams")

        //update Group
       //user Group Memberships  type update from 1 to 3 for testing as members

         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)
         .write({
             "membership-type": 3,
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
                  'membership-type': 3,
                   timestamp       : 1452767752756
         }).succeeds("Groups Members created with membershiptype 0")


     //Group members can not update Group
         .as("arsalan")
         .at(pathforGroupGroupID)
         .write(groupData)
         .fails("Only Admin and Owner can update group");
 });
/*
//Team of teams update by Admin
 test("team of teams update by admin" ,function(rules){
     rules
         .as("admin")
         .at(pathforUserUserID)

         .write(usersData).succeeds("admin can only create users")

          //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

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
        .write(groupData)
        .succeeds("Group Created")

        //Group Activity Streams create
        .as('arsalan')
        .at('/group-activity-streams/' +groupid)
        .write(GroupActivityStreamsData)
        .succeeds("auth user can write group-activity-streams")

       //update Group

        //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 2,
                  timestamp: 1452767752756
         }).succeeds("Group Memebers Created")

       //Group Admin can update Group
        .as("arsalan")
        .at(pathforGroupGroupID)
        .write(groupData)
        .succeeds("admin can also update group");
 });

//team of teams update test with owner

 test("team of teams update by owner" ,function(rules){
     rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData).succeeds("admin can only create users")

          //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

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

        .write(groupData)
        .succeeds("Group Created")

        //Group Activity Streams create
        .as('arsalan')
        .at('/group-activity-streams/' +groupid)
        .write(GroupActivityStreamsData)
        .succeeds("auth user can write group-activity-streams")

        //update Group

        //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)

         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Member create")
        //Owner can update group
        .as("arsalan")
        .at(pathforGroupGroupID)

        .write(groupData)
        .succeeds("owner update group");


 });

//GROUP NAMES start
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
           .fails("Un auth user cannot read group  names");
   });

 //Group Name Read  test with Auth
   test("Group Name read Test with Auth user" ,function(rules){
      rules
          .as("admin")
          .at(pathforUserUserID)
          .write(usersData).succeeds("Only admin can create User")

           //Groups Names
           .as("arsalan")
          .at(pathforGroupNameGroupID)

           .write({
             title: "Panacloud"
          }).succeeds("Authenticated user can write on group name")

          .as("arsalan")
          .at("/groups-names")
          .read()
          .succeeds("only Auth user can read Groups name");
   });

      //create test
      //Group Name create  test with unAuth User

   test("group name write test", function (rules) {
     rules
       .as("anon")
       .at(pathforGroupNameGroupID)
       .write({
         title: "Panacloud"
       }).fails("Authenticated user can write on group name");

   });

   //Group Name create  test with Auth User
   test("group name write test" ,function(rules){
      rules
      .as("admin")
      .at(pathforUserUserID)

      .write(usersData).succeeds("Admin can create users")

      .as("arsalan")
      .at(pathforGroupNameGroupID)

      .write({
          title : "Panacloud"
      }).succeeds("Authenticated user can write on group name");

});
   //update test
   //Group Name update  test with un Auth  user

    test("group name update test with unauth" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")

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
              }).fails("unauth user can not update group name");
      });


      //Group Name update  test with Auth  user

    test("group name update test with user" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")

            //Group Name
            .as("arsalan")
            .at(pathforGroupNameGroupID)

              .write({
                  title: "Testing rules for group name update with auth user"
              }).succeeds("Any auth user can create groups")

              //Group Members
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

              .write({
                  'membership-type': 0
              })

              //Group Name
              .as("arsalan")
              .at(pathforGroupNameGroupID)

              .write({
                  title: "test succeesfull ",
                  groupImgUrl: "http://www.google.com"
              }).fails("auth user can not update group name");
      });

 //Group Name update  test with Auth another user

    test("group name update test with user" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")

              //Group Members membership type should be 1 for creating group Members

              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

              .write({
                  'membership-type': 1,
                   timestamp       : 1452767752756
              }).succeeds("Group Members created")

              //Group Name
            .as("arsalan")
            .at(pathforGroupNameGroupID)

              .write({
                  title: "Testing rules for group name update with auth user"
              }).succeeds("Any auth user can create groups")


              //Group Name update test with other user
              .as("taimoor")
              .at(pathforGroupNameGroupID)

              .write({
                  title: "test succeesfull ",
                  groupImgUrl: "http://www.google.com"
              }).fails("other auth user can not update group name too");
      });

       //Group Name update  test with Owner

    test("group name update test with Owner" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")

            //Group Name
            .as("arsalan")
            .at(pathforGroupNameGroupID)

            .write({
                  title: "Testing rules for group name update with Owner"
              }).succeeds("Any auth user can create groups")

              //Group Members
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

             .write({
                  'membership-type': 1,
                   timestamp       : 1452767752756

              })

              //Group Name
              .as("arsalan")
              .at(pathforGroupNameGroupID)

              .write({
                  title: "succesfully rules testing for group name update with Owner",
                  groupImgUrl: "http://www.google.com"
              }).succeeds("Owner can update group name");
      });

//Group Name update  test with other Owner

    test("group name update test with other Owner" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")


              //Group Members membership type should be 1 for creating group Members
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

              .write({
                  'membership-type': 1,
                   timestamp       : test.TIMESTAMP
              }).succeeds("Group Members created")

              //Group Name
            .as("arsalan")
            .at(pathforGroupNameGroupID)

            .write({
                  title: "Testing rules for group name update with other Owner"
              }).succeeds("Any auth user can create groups")
            //Group update test other Onwer it will fail bcoz real owner can update group name
              .as("arsalan")
              .at("/groups/" + "meetone") // other group name

              .write({
                  title: "other group Owner can not update group name",
                  groupImgUrl: "http://www.google.com"
              }).fails("Owner can update group name");
      });

       //Group Name update  test with Admin
    test("group name update test with Admin" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")

            //Group Members
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

              .write({
                  'membership-type': 1,
                   timestamp       : 1452767752756
              }).succeeds("Group Members created")

              //Group Name
              .as("arsalan")
              .at(pathforGroupNameGroupID)

                .write({
                    title: "Testing rules for group name update with admin"
                }).succeeds("Any auth user can create groups")

                //User group Membership
                .as("arsalan")
                .at(pathforUserGroupMembershipUIDGroupId)
                .write({
                 "membership-type" : 1,
                 "timestamp"       : test.TIMESTAMP
                })

                //Group Members
                .as("arsalan")
                .at(pathforGroupMembersGroupidUid)
                .write({
                    'membership-type': 2,
                    timestamp        : 1452767752756
                }).succeeds("Group Members created")

                //Group Name
                .as("arsalan")
                .at(pathforGroupNameGroupID)
                .write({
                    title: "succesfully rules testing for group name update with admin",
                    groupImgUrl: "http://www.google.com"
                }).succeeds("Admin can also  update group name");
      });


        //Group Name update  test with other Admin

    test("group name update test with other Admin" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("Only admin can create users")

              //User Group Membership

                .as("arsalan")
                .at("/user-group-memberships/" + uid("arsalan") + "/"+ groupid)

                .write({
                    "membership-type" : 1,
                    "timestamp"       : test.TIMESTAMP
                })
              //Group Members membership type should be 1 for creating group Members

              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

              .write({
                  'membership-type': 1,
                   timestamp       : 1452767752756
              }).succeeds("Group Members created")

                //Group Name
              .as("arsalan")
              .at(pathforGroupNameGroupID)

                .write({
                    title: "Testing rules for group name update with  other admin"
                }).succeeds("Any auth user can create groups")


              //Group Members change membership-type from 1 to 2  for testing as admin
                .as("arsalan")
                .at(pathforGroupMembersGroupidUid)
                .write({
                    'membership-type': 2,
                    timestamp        : 1452767752756
                }).succeeds("Group Members created")

                //Group update test other admin it will fail bcoz real admin can update group name
                .as("arsalan")
                .at("/groups/meetone")
                .write({
                    title: "Admin can not update other group name",
                    groupImgUrl: "http://www.google.com"
                }).fails("Admin can also update group name");
      });


  //user group memberships Start
//user group memberships read test with Auth User

      test("user group memberships read test with Auth User", function(rules){

        rules
        .as('admin')
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("User successfully Created")

            .as('taimoor')
            .at('/user-group-memberships/' + uid("taimoor"))

            .read()
            .succeeds("user is Authenticated");
      });

    //user group memberships read test with UnAuth User
      test("user group memberships read test with UnAuth User", function(rules){

        rules
            .as('admin')
            .at(pathforUserUserID)
            .write(usersData)
            .succeeds("User successfully Created")

            .as('anon')
            .at('/user-group-memberships/' +uid("taimoor"))

            .read()
            .fails("user is UnAuthenticated cannot read");
    });

      test("user group memberships read test with another User", function(rules){

    rules
        .as('admin')
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("User successfully Created")

        .as('arsalan')
        .at('/user-group-memberships/' +uid("taimoor"))

        .read()
        .fails("user is UnAuthenticated canot read");
  });



  //user Group Membership write test with auth user
     test("user group memberships group-id write test with Auth User", function(rules){

        rules
            .as('admin')
            .at(pathforUserUserID)
            .write(usersData)
            .succeeds("User successfully Created")

            .as('arsalan')
            .at(pathforUserGroupMembershipUIDGroupId)
            .write({
                "membership-type" : 1,
                'timestamp' : test.TIMESTAMP
            })
            .succeeds("user is Authenticated");

      });

//user Group Membership write test with unauth user

 test("user-group-memberships test with unauth user" ,function(rules){
    rules
       .as("admin")
       .at(pathforUserUserID)
       .write(usersData).succeeds("Only admin can create user")

       .as("anon")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
         "membership-type"    : 1,
          timestamp           :  test.TIMESTAMP
       }).fails("un auth can not write on user-group-membership");

 });

 //user Group Membership write test with other auth user
     test("user group memberships group-id write test with Auth User", function(rules){

        rules
            .as('admin')
            .at(pathforUserUserID)
            .write(usersData)
            .succeeds("User successfully Created")

            .as('taimoor')
            .at(pathforUserGroupMembershipUIDGroupId)
            .write({
                "membership-type" : 1,
                'timestamp' : test.TIMESTAMP
            })
            .fails("users cannot write other's user-group-membership");

      });

 //discusss

//user Group Memberships update test with  auth user


  test("user group memberships group-id write test with Auth User", function(rules){

        rules
            .as('admin')
            .at(pathforUserUserID)
            .write(usersData)
            .succeeds("User successfully Created")

            .as('arsalan')
            .at(pathforUserGroupMembershipUIDGroupId)
            .write({
                "membership-type" : 1,
                'timestamp' : test.TIMESTAMP
            })
            .succeeds("user-group-membership created succeesufully")

             .as('taimoor')
             .at('/user-group-memberships/' +uid("taimoor") + "/" + groupid)

             .write({
                "membership-type" : 0,
                'timestamp' : test.TIMESTAMP
             })
            .fails("user-group-membership created succeesufully");


      });



//Group Members start

//group members read test with  auth user

test("group members read test with auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("Only admin can create user")

      //Group Members
      .as("arsalan")
      .at(pathforGroupMembersGroupidUid)
      .write({
        'membership-type' : 1,
         timestamp : test.TIMESTAMP
      }).succeeds("Group Members succeesfully created")

     //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       "membership-type" : 1,
       timestamp         : test.TIMESTAMP
     }).succeeds("User Group Membership Created")

     //Membership type in Group Members update 1 to 3 for testing as members

     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
        'membership-type' : 3,
         timestamp        : test.TIMESTAMP
     }).succeeds("membership type update successfully")

     //Group Members group id read test
     .as("arsalan")
     .at("/group-members/" + groupid)
     .read()
     .succeeds("group Members can read on group members group id");
});



//group members read test with admin

test("group members read test with admin", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp        : test.TIMESTAMP
     })
     .succeeds("Group Members succeesfully created")

     //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")

     //Membership type in Group Members update 1 to 3 for testing as admin
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       "membership-type" : 2,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("membership type update successfully")

    //Group Members group id read test
    .as("arsalan")
    .at("/group-members/" + groupid)
    .read()
    .succeeds("admin can read on group members group id");

});



//group members read test with block User

test("group members read test with block user", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp        : test.TIMESTAMP
     })
     .succeeds("Group Members succeesfully created")

     //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")

     //Membership type in Group Members update 1 to 3 for testing as admin
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       "membership-type" : -1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("membership type update successfully")

    //Group Members group id read test
    .as("arsalan")
    .at("/group-members/" + groupid)
    .read()
    .fails("admin can read on group members group id");

});



//group members read test with unauth User

test("group members read test with unauth user", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("Group Members succeesfully created")

    //Group Members group id read test
    .as("anon")
    .at("/group-members/" + groupid)
    .read()
    .fails("unauth cannot read on group members group id");

});



//group members read test with different user

test("group members read test with different user", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp        : test.TIMESTAMP
     })
     .succeeds("Group Members succeesfully created")

     //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")

     //Membership type in Group Members update 1 to 3 for testing as admin
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       "membership-type" : 2,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("membership type update successfully")

    //Group Members group id read test
    .as("taimoor")
    .at("/group-members/" + groupid)
    .read()
    .fails("diiferent user cannot read on group members group id");

});


//disscuss that membership type 1 is for owner but we are checking for user
//group members write test with unauth user

test("group members write test with unauth user", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("anon")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .fails("Un auth user cannot create group members");

});



//group members write test with auth user

test("group members write test with unauth user", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members");

});

//group members write test with different auth user

test("group members write test with unauth user", function(rules) {
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

      //Group Members
     .as("taimoor")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .fails("other user cannot create group members");

});



//group members update test with unauth user

test("group members update test with unauth user", function(rules) {


  rules
    .as('admin')
    .at(pathforUserUserID)
    .write(usersData).succeeds("group members read admin created")

    //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members")

     .as('anon')
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     }).fails("unauth user cannot update group member");



});


//group members update test with auth user

test("group members update test with auth user", function(rules) {


  rules
    .as('admin')
    .at(pathforUserUserID)
    .write(usersData).succeeds("group members read admin created")

    //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members")

      //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     })
     .fails("User Group Membership Created")


     .as('arsalan')
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     }).fails("auth user cannot update group member");



});



//group members update test with admin

test("group members update test with admin", function(rules) {


  rules
    .as('admin')
    .at(pathforUserUserID)
    .write(usersData).succeeds("group members read admin created")

    //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members")

      //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")

       //user group members  membership-type updated for testing as admin
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 2,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")


     .as('arsalan')
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     }).succeeds("admin can update group member");



});




//group members update test with owner

test("group members update test with owner", function(rules) {


  rules
    .as('admin')
    .at(pathforUserUserID)
    .write(usersData).succeeds("group members read admin created")

    //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members")

      //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")


     .as('arsalan')
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     }).succeeds("owner can update group member");



});


//group members update test with different group owner

test("group members update test with owner", function(rules) {


  rules
    .as('admin')
    .at(pathforUserUserID)
    .write(usersData).succeeds("group members read admin created")

    //Group Members
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members")


      //Group Members for testing update for different owner
     .as("taimoor")
     .at('/group-members/meatOne/' + uid('taimoor'))
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members")


      //user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created")


     .as('taimoor')
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     }).fails("different owner cannot update group member");

});


//group members update test with admin

test("group members update test with admin", function(rules) {


  rules //user01
    .as('admin')
    .at(pathforUserUserID)
    .write(usersData).succeeds("group members read admin created")

     //user02
   .as('admin')
    .at("/users/" + uid("taimoor"))
    .write({
         email           : "arsalan@panacloud.com",
         firstName       : "tai",
         lastName        : "Rajput",
         "date-created"  : test.TIMESTAMP,
         status          : 0
     }).succeeds("group members read admin created1")

    //1 Group Members owner
     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members2")

        //2 Group Members  owner
     .as("taimoor")
     .at('/group-members/meatOne/' + uid('taimoor'))
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP
     })
     .succeeds("auth user can create group members3")



      //1 user group members created for updating group Members membership-type
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created4")

       //2 user group members created for updating group Members membership-type
     .as("taimoor")
     .at('/user-group-memberships/' + uid('taimoor') + "/meatOne")
     .write({
       'membership-type' : 1,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created 5")


       //1 user group members  membership-type updated for testing as admin
     .as("arsalan")
     .at(pathforUserGroupMembershipUIDGroupId)
     .write({
       'membership-type' : 2,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created6")

       //2 user group members  membership-type updated for testing as admin
     .as("taimoor")
     .at('/group-members/meatOne/' + uid('taimoor'))
     .write({
       'membership-type' : 2,
       timestamp         : test.TIMESTAMP

     })
     .succeeds("User Group Membership Created7")

     //other group  member admin try to update others group
     .as('taimoor')
     .at(pathforGroupMembersGroupidUid)
     .write({
       'membership-type' : 3,
       timestamp         : test.TIMESTAMP

     }).fails("other admin cannot update others group member8");
});


// Group members/GroupId/UserID  Read test with auth user
test("Group Members read test with unauth" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData).succeeds("group members read admin created")

     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
         'membership-type' : 1,
          timestamp         : test.TIMESTAMP
      })
      .succeeds("auth user can create group members2")

      .as("arsalan")
      .at(pathforGroupMembersGroupidUid)
      .read()
      .succeeds("Auth User can read group members it self");
    });

  // Group members/GroupId/UserID  Read test with un auth user
      test("Group Members read test with unauth" ,function(rules){
        rules
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("group members read admin created")
          //Group Members created
          .as("arsalan")
          .at(pathforGroupMembersGroupidUid)
          .write({
              'membership-type' : 1,
                timestamp         : test.TIMESTAMP
            })
            .succeeds("auth user can create group members2")
            //un auth user read test
            .as("anon")
            .at(pathforGroupMembersGroupidUid)
            .read()
            .fails("un Auth User cannot read group members");
          });

  // Group members/GroupId/UserID  Read test with other user
      test("Group Members read test with unauth" ,function(rules){
        rules  // 1 user
            .as("admin")
            .at(pathforUserUserID)
            .write(usersData).succeeds("group members read admin created")

          //2 user
           .as("admin")
            .at("/users/" + uid("taimoor"))

            .write(usersData).succeeds("group members read admin created")

            //1 group members created
              .as("arsalan")
              .at(pathforGroupMembersGroupidUid)

                .write({
                     'membership-type' : 1,
                      timestamp         : test.TIMESTAMP
                })
                .succeeds("auth user can create group members2")

            //2 group members created
              .as("taimoor")
              .at("/group-members/meetOne/" + uid("taimoor"))

              .write({
                  'membership-type' : 1,
                  timestamp         : test.TIMESTAMP
            })
            .succeeds("auth user can create group members2")

            //other group members can not read others group members
            .as("taimoor")
            .at(pathforGroupMembersGroupidUid)

            .read()
            .fails("other Auth User cannot read other group member");
          });

//group-activity-streams read with auth user

test("group-activity-streams read with auth user", function(rules) {

   rules
          .as("admin")
          .at(pathforUserUserID)
          .write(usersData)
         .succeeds("User successfully Created")

         //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

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

         .write(groupData)
         .succeeds("Any authanticated user can create group")

          .as('arsalan')
          .at('/group-activity-streams/' +groupid)
          .read()
          .succeeds("group-activity-streams read with auth user");

});


//group-activity-streams read with unauth user

test("group-activity-streams read with unauth user", function(rules) {

   rules
          .as("admin")
          .at(pathforUserUserID)
          .write(usersData)
         .succeeds("User successfully Created")
         //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)
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

         .write(groupData)
         .succeeds("Any authanticated user can create group")

          .as('anon')
          .at('/group-activity-streams/' +groupid)
          .read()
          .fails("group-activity-streams read with unauth user");

});

//group-activity-streams write with auth user

test("group-activity-streams write with auth user", function(rules) {

   rules
          .as("admin")
          .at(pathforUserUserID)
          .write(usersData)
         .succeeds("User successfully Created")

         //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

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

         .write(groupData)
         .succeeds("Any authanticated user can create group")

          .as('arsalan')
          .at('/group-activity-streams/' +groupid)
          .write(GroupActivityStreamsData)
          .succeeds("auth user can write group-activity-streams");

});
//group-activity-streams write with unauth user

test("group-activity-streams write with unauth user", function(rules) {

   rules
          .as("admin")
          .at(pathforUserUserID)
          .write(usersData)
         .succeeds("User successfully Created")

         //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

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

         .write(groupData)
         .succeeds("Any authanticated user can create group")
          //UnAuthenticated user can not create group Activity Streams
          .as('anon')
          .at('/group-activity-streams/' +groupid)
          .write(GroupActivityStreamsData)
          .fails("unauth user cannot write group-activity-streams");

});

//----------------------------------------------------------
//Group Check In Current
//group-check-in-current read test with unauth user

test("group-check-in-current read test with unauth user" ,function(rules){
    rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData).succeeds("Only Admin can create user")

         //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")

         .as("anon")
         .at("/group-check-in-current/" + groupid)
         .read()
         .fails("Un auth user can not read group check in current");
});

//Group Check In current Read test with auth user

test("group-check-in-current read test with auth user" ,function(rules){
    rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData).succeeds("Only Admin can create user")

         //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")

         .as("arsalan")
         .at(pathforGroupCheckInCurrent)
         .read()
         .succeeds("auth user can read group check in current");
});


//Group Check In current Read test with Block user

test("group-check-in-current read test with Block user" ,function(rules){
    rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData).succeeds("Only Admin can create user")

         //Groups Members
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")

         //user Group Memberships add for update Group Members Membership type from 1 to -1
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp": test.TIMESTAMP
         })
         //Groups Members membership-type update for testing read test with block user
        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': -1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")

         //Block USer read Test
         .as("arsalan")
         .at(pathforGroupCheckInCurrent)
         .read()
         .fails("block user cannot read group check in current");
});

//Group checked-in Current Write TEst with un Auth User

test("Group checked-in Current Write TEst with un auth User" ,function(rules){
     rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData)
         .succeeds("Only Admin Can create user")

         //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")

        //unAuth user Cannot Group checked-in

         .as("anon")
         .at(pathforGroupCheckInCurrent)
         .write(GroupCheckInCurrentData)
         .fails("UnAuth user can not Group checked-in ");
});

//Group checked-in Current Write TEst with Auth User

test("Group checked-in Current Write TEst with auth User" ,function(rules){
     rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData)
         .succeeds("Only Admin Can create user")

         //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                   timestamp: 1452767752756
         }).succeeds("Group Members Created")

          //Auth user Can Group checked-in
         .as("arsalan")
         .at(pathforGroupCheckInCurrent)
         .write(GroupCheckInCurrentData)
         .succeeds("Auth user can Group checked-in ");
});
//Group checked-in Current Write TEst with different Auth User

test("Group checked-in Current Write TEst with different auth User" ,function(rules){
     rules     //user01
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData)
         .succeeds("Only Admin Can create user")

         //user02
        .as('admin')
        .at("/users/" + uid("taimoor"))
        .write({
             email           : "arsalan@panacloud.com",
             firstName       : "tai",
             lastName        : "Rajput",
             "date-created"  : test.TIMESTAMP,
             status          : 0
         }).succeeds("group members read admin created1")


         //Groups Members01
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                   timestamp: 1452767752756
         }).succeeds("Group Members Created")

          //Group Members02
          .as("taimoor")
          .at('/group-members/meatOne/' + uid('taimoor'))
          .write({
            'membership-type' : 1,
            timestamp         : test.TIMESTAMP
          })
            .succeeds("auth user can create group members3")

          //Auth user Can Group checked-in
         .as("taimoor")
         .at(pathforGroupCheckInCurrent)
         .write(GroupCheckInCurrentData)
         .fails("other Auth user cannot Group checked-in to other user");
});

//Group checked-in Current Write TEst with Block User

test("Group checked-in Current Write TEst with block User" ,function(rules){
     rules
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData)
         .succeeds("Only Admin Can create user")

         //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                   timestamp: 1452767752756
         }).succeeds("Group Members Created")

         //user Group Memberships add for update Group Members Membership type from 1 to -1
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp": test.TIMESTAMP
         }).succeeds("user Group Membership created")

         //Groups Members membership-type update for testing read test with block user

        .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': -1,
                  timestamp: 1452767752756
         }).succeeds("Group Members Created")

          //Auth user Can Group checked-in
         .as("arsalan")
         .at(pathforGroupCheckInCurrent)
         .write(GroupCheckInCurrentData)
         .fails("Auth user can Group checked-in ");
});


//Group Check In Records
//Group checked-in record read test with unauth user

test("Group checked-in record read test with unauth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only Admin can create User")

      //Groups Members
      .as("arsalan")
      .at(pathforGroupMembersGroupidUid)
      .write({
               'membership-type': 1,
                timestamp: 1452767752756
      }).succeeds("Group Members Created")

      //Read test with un Auth user
      .as("anon")
      .at("/group-check-in-records/" + groupid)
      .read()
      .fails("Un Authenticated can not Read Group checked-in records");
});


//Group checked-in record read test with Auth user

test("Group checked-in record read test with auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only Admin can create User")

      //Groups Members
      .as("arsalan")
      .at(pathforGroupMembersGroupidUid)
      .write({
               'membership-type': 1,
                timestamp: 1452767752756
      }).succeeds("Group Members Created")

      //Read test with un Auth user
      .as("arsalan")
      .at("/group-check-in-records/" + groupid)
      .read()
      .succeeds("Authenticated can Read Group checked-in records");
});
//Group checked-in record read test with different Auth user

test("Group checked-in record read test with different auth user" ,function(rules){
  rules  //user01
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only Admin Can create user")

      //user02
     .as('admin')
     .at("/users/" + uid("taimoor"))
     .write({
          email           : "arsalan@panacloud.com",
          firstName       : "tai",
          lastName        : "Rajput",
          "date-created"  : test.TIMESTAMP,
          status          : 0
      }).succeeds("group members read admin created1")

      //Groups Members01
      .as("arsalan")
      .at(pathforGroupMembersGroupidUid)
      .write({
               'membership-type': 1,
                timestamp: 1452767752756
      }).succeeds("Group Members Created")

       //Group Members02
       .as("taimoor")
       .at('/group-members/meatOne/' + uid('taimoor'))
       .write({
         'membership-type' : 1,
         timestamp         : test.TIMESTAMP
       })
         .succeeds("auth user can create group members3")

      //Read test with un Auth user
      .as("taimoor")
      .at("/group-check-in-records/" + groupid)
      .read()
      .fails("Authenticated can Read Group checked-in records");
});

//Group checked-in records read test with block User

test("Group checked-in records read test with block User" ,function(rules){
  rules
       .as("admin")
       .at(pathforUserUserID)
       .write(usersData)
       .succeeds("Only admin can create user")

       //Groups Members
       .as("arsalan")
       .at(pathforGroupMembersGroupidUid)
       .write({
            'membership-type': 1,
             timestamp: 1452767752756
       }).succeeds("Group Members Created")

       //user Group Memberships add for update Group Members Membership type from 1 to -1
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": 1,
           "timestamp": test.TIMESTAMP
       }).succeeds("user Group Membership created")

       //Groups Members membership-type update for testing read test with block user

        .as("arsalan")
        .at(pathforGroupMembersGroupidUid)
        .write({
            'membership-type': -1,
            timestamp: 1452767752756
          }).succeeds("Group Members Created")

         //Group checked-in record test with block user
          .as("arsalan")
          .at("/group-check-in-records/" + groupid)
          .read()
          .fails("Block user can not read Group checked-in record");

});

//Group checked-in records write test with unauth User

test("Group checked-in records write test with unauth User" ,function(rules){
  rules
      //Groups Members
      .as("arsalan")
      .at(pathforGroupMembersGroupidUid)
      .write({
           'membership-type': 1,
            timestamp: 1452767752756
      }).succeeds("Group Members Created")

      .as("anon")
      .at(pathforGroupCheckInRecords)
      .write(GroupCheckInRecordData)
      .fails("Un authanticated can write group checked-in records");

});

//Group checked-in records write test with auth User

test("Group checked-in records write test with auth User" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //Groups Members
        .as("arsalan")
        .at(pathforGroupMembersGroupidUid)
        .write({
             'membership-type': 1,
              timestamp: 1452767752756
        }).succeeds("Group Members Created")

        .as("arsalan")
        .at(pathforGroupCheckInRecords)
        .write(GroupCheckInRecordData)
        .succeeds("Auth user can write on group checked-in records ");

});
//Group checked-in records write test with auth User

test("Group checked-in Records Write Test with different auth User" ,function(rules){
     rules     //user01
         .as("admin")
         .at(pathforUserUserID)
         .write(usersData)
         .succeeds("Only Admin Can create user")

         //user02
        .as('admin')
        .at("/users/" + uid("taimoor"))
        .write({
             email           : "arsalan@panacloud.com",
             firstName       : "tai",
             lastName        : "Rajput",
             "date-created"  : test.TIMESTAMP,
             status          : 0
         }).succeeds("group members read admin created1")


         //Groups Members01
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 1,
                   timestamp: 1452767752756
         }).succeeds("Group Members Created")

          //Group Members02
          .as("taimoor")
          .at('/group-members/meatOne/' + uid('taimoor'))
          .write({
            'membership-type' : 1,
            timestamp         : test.TIMESTAMP
          })
          .succeeds("auth user can create group members3")

          .as("taimoor")
          .at(pathforGroupCheckInRecords)
          .write(GroupCheckInRecordData)
          .fails("other Auth user cannot write Group checked-in records to other user");
});

//Group checked-in records Write test with block User

test("Group checked-in records Write test with block User" ,function(rules){
  rules
       .as("admin")
       .at(pathforUserUserID)
       .write(usersData)
       .succeeds("Only admin can create user")

       //Groups Members
       .as("arsalan")
       .at(pathforGroupMembersGroupidUid)
       .write({
            'membership-type': 1,
             timestamp: 1452767752756
       }).succeeds("Group Members Created")

       //user Group Memberships add for update Group Members Membership type from 1 to -1
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": 1,
           "timestamp": test.TIMESTAMP
       }).succeeds("user Group Membership created")

       //Groups Members membership-type update for testing read test with block user

        .as("arsalan")
        .at(pathforGroupMembersGroupidUid)
        .write({
            'membership-type': -1,
            timestamp: 1452767752756
          }).succeeds("Group Members Created")

         //Group checked-in record test with block user
          .as("arsalan")
          .at("/group-check-in-records/" + groupid)
          .write(GroupCheckInRecordData)
          .fails("Block user can not write Group checked-in record");

});

//Group Membership Request start here
// Group Membership Requests Read test with unauth user

test("Group Membership Requests Read test with unauth user" ,function(rules){
rules

      .as('anon')
      .at(pathforGroupMembershipRequestsGroupIdUid)
      .read()
      .fails("Un authanticated user can not read Group Memberships Requests");
});

// Group Membership Requests Read test with Auth user

test("Group Membership Requests Read test with Auth user" ,function(rules){
rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      .as('arsalan')
      .at(pathforGroupMembershipRequestsGroupIdUid)
      .read()
      .succeeds("Un authanticated user can not read Group Memberships Requests");
});

// Group Membership Requests Read test with different Auth user

test("Group Membership Requests Read test with different Auth user" ,function(rules){
rules  //user01
       .as("admin")
       .at(pathforUserUserID)
       .write(usersData)
       .succeeds("Only Admin Can create user")

       //user02
      .as('admin')
      .at("/users/" + uid("taimoor"))
      .write({
           email           : "arsalan@panacloud.com",
           firstName       : "tai",
           lastName        : "Rajput",
           "date-created"  : test.TIMESTAMP,
           status          : 0
       }).succeeds("group members read admin created1")

      .as('taimoor')
      .at(pathforGroupMembershipRequestsGroupIdUid)
      .read()
      .fails("other user can not read Group Memberships Requests of different user");
});


// Group Membership Requests write test with unAuth user
test("Group Membership Requests Read test with unauth user" ,function(rules){
rules

      .as('anon')
      .at(pathforGroupMembershipRequestsGroupIdUid)
      .write(GroupMembershipsRequestData)
      .fails("Un authanticated user can not Request Group Memberships Requests");
});


// Group Membership Requests write test with Auth user

test("Group Membership Requests Read test with Auth user" ,function(rules){
rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      .as('arsalan')
      .at(pathforGroupMembershipRequestsGroupIdUid)
      .write(GroupMembershipsRequestData)
      .succeeds("authanticated user can Request Group Memberships Requests");
});


// Group Membership Requests write test with different Auth user

test("Group Membership Requests Read test with different Auth user" ,function(rules){
rules   //user01
       .as("admin")
       .at(pathforUserUserID)
       .write(usersData)
       .succeeds("Only Admin Can create user")

       //user02
      .as('admin')
      .at("/users/" + uid("taimoor"))
      .write({
           email           : "arsalan@panacloud.com",
           firstName       : "tai",
           lastName        : "Rajput",
           "date-created"  : test.TIMESTAMP,
           status          : 0
       }).succeeds("group members read admin created1")
      // Group Memberships Requests test with different user
      .as('taimoor')
      .at(pathforGroupMembershipRequestsGroupIdUid)
      .write(GroupMembershipsRequestData)
      .fails("other authanticated user cannot Request Group Memberships Requests of different user");
});


//Group Membership Requests By User start here
//Group membership requests-by-user read test with unauth
test("Group Membership requests-by-user read test with unauth",function(rules){
  rules
   .as("anon")
   .at(pathforGroupMembershipRequestsByUser)
   .read()
   .fails("Un authanticated user can not read Group Membership requests-by-user");
});

//discusss it is working but it should not
//Group membership requests-by-user read test with auth User
test("Group Membership requests-by-user read test with  auth User", function(rules){
  rules
    .as("admin")
    .at(pathforUserUserID)
    .write(usersData)
    .succeeds("Only admin can create user")

   .as("arsalan")
   .at(pathforGroupMembershipRequestsByUser)
   .read()
   .succeeds("authanticated user also can not read Group Membership requests-by-user");
});

//Group membership requests-by-user read test with Admin
test("Group Membership requests-by-user read test with admin",function(rules){
  rules
    .as("admin")
    .at(pathforUserUserID)
    .write(usersData)
    .succeeds("Only admin can create user")

    //Groups Members
    .as("arsalan")
    .at(pathforGroupMembersGroupidUid)
    .write({
         'membership-type': 1,
          timestamp: 1452767752756
    }).succeeds("Group Members Created")

    //user Group Memberships add for update Group Members Membership type from 1 to 2 for testing as admin
    .as("arsalan")
    .at(pathforUserGroupMembershipUIDGroupId)

    .write({
        "membership-type": 1,
        "timestamp": test.TIMESTAMP
    }).succeeds("user Group Membership created")

    //Groups Members membership-type update for testing read test with block user

     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
         'membership-type': 2,
         timestamp: 1452767752756
       }).succeeds("Group Members Created")

   .as("arsalan")
   .at(pathforGroupMembershipRequestsByUser)
   .read()
   .succeeds("Admin can read Group Membership requests-by-user");
});


//Group membership requests-by-user read test with different group  Admin
test("Group Membership requests-by-user read test with different group admin",function(rules){
  rules   //user01
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

         //user02
       .as('admin')
        .at("/users/" + uid("taimoor"))
        .write({
             email           : "arsalan@panacloud.com",
             firstName       : "tai",
             lastName        : "Rajput",
             "date-created"  : test.TIMESTAMP,
             status          : 0
         }).succeeds("group members read admin created1")

        //Groups Members
        .as("arsalan")
        .at(pathforGroupMembersGroupidUid)
        .write({
             'membership-type': 1,
              timestamp: 1452767752756
        }).succeeds("Group Members Created")

        //Group Members02
        .as("taimoor")
        .at('/group-members/meatOne/' + uid('taimoor'))
        .write({
          'membership-type' : 1,
          timestamp         : test.TIMESTAMP
        })
          .succeeds("auth user can create group members3")

    //user Group Memberships add for update Group Members Membership type from 1 to 2 for testing as admin
    .as("arsalan")
    .at(pathforUserGroupMembershipUIDGroupId)

    .write({
        "membership-type": 1,
        "timestamp": test.TIMESTAMP
    }).succeeds("user Group Membership created")

    //Groups Members membership-type update for testing read test with block user

     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
         'membership-type': 2,
         timestamp: 1452767752756
       }).succeeds("Group Members Created")

   .as("arsalan")
   .at("/group-membership-requests-by-user/" +  uid('taimoor') + "/" + "Meetone")
   .read()
   .fails("different Admin cannot read Group Membership requests-by-user of other Group membership requests-by-user");
});



//Group membership requests-by-user read test with Owner
test("Group Membership requests-by-user read test with Owner",function(rules){
  rules
    .as("admin")
    .at(pathforUserUserID)
    .write(usersData)
    .succeeds("Only admin can create user")

    //Groups Members
    .as("arsalan")
    .at(pathforGroupMembersGroupidUid)
    .write({
         'membership-type': 1,
          timestamp: 1452767752756
    }).succeeds("Group Members Created")

 //Group Membership requests-by-user read test with owner
   .as("arsalan")
   .at(pathforGroupMembershipRequestsByUser)
   .read()
   .succeeds("Owner can read Group Membership requests-by-user");
});

//Group membership requests-by-user read test with different Owner
test("Group Membership requests-by-user read test with different Owner",function(rules){
  rules  //user01
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

         //user02
       .as('admin')
        .at("/users/" + uid("taimoor"))
        .write({
             email           : "arsalan@panacloud.com",
             firstName       : "tai",
             lastName        : "Rajput",
             "date-created"  : test.TIMESTAMP,
             status          : 0
         }).succeeds("group members read admin created1")

         //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
              'membership-type': 1,
               timestamp: 1452767752756
         }).succeeds("Group Members Created")

         //Group Members02
         .as("taimoor")
         .at('/group-members/meatOne/' + uid('taimoor'))
         .write({
           'membership-type' : 1,
           timestamp         : test.TIMESTAMP
         })
           .succeeds("auth user can create group members3")

 //Group Membership requests-by-user read test with different owner
   .as("taimoor")
   .at(pathforGroupMembershipRequestsByUser)
   .read()
   .fails("different Owner can not read Group Membership requests-by-user of other Group memberships requests-by-user");
});

//Group membership requests-by-user write test with unauth
test("Group Membership requests-by-user read test with unauth",function(rules){
  rules
       .as("anon")
       .at(pathforGroupMembershipRequestsByUser)
       .write({ timestamp   : test.TIMESTAMP })
       .fails("Un authanticated user can not write Group Membership requests-by-user");
});
//disscuss  it is working but it should not
//Group membership requests-by-user write test with auth User

test("Group Membership requests-by-user write test with  auth User", function(rules){
  rules
    .as("admin")
    .at(pathforUserUserID)
    .write(usersData)
    .succeeds("Only admin can create user")

   .as("arsalan")
   .at(pathforGroupMembershipRequestsByUser)
   .write({ timestamp   : test.TIMESTAMP })
   .fails("authanticated user also can not write Group Membership requests-by-user");
});

//Group membership requests-by-user write test with Admin
test("Group Membership requests-by-user read test with admin",function(rules){
  rules
    .as("admin")
    .at(pathforUserUserID)
    .write(usersData)
    .succeeds("Only admin can create user")

    //Groups Members
    .as("arsalan")
    .at(pathforGroupMembersGroupidUid)
    .write({
         'membership-type': 1,
          timestamp: 1452767752756
    }).succeeds("Group Members Created")

    //user Group Memberships add for update Group Members Membership type from 1 to 2 for testing as admin
    .as("arsalan")
    .at(pathforUserGroupMembershipUIDGroupId)

    .write({
        "membership-type": 1,
        "timestamp": test.TIMESTAMP
    }).succeeds("user Group Membership created")

    //Groups Members membership-type update for testing read test with block user

     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
         'membership-type': 2,
         timestamp: 1452767752756
       }).succeeds("Group Members Created")

   .as("arsalan")
   .at(pathforGroupMembershipRequestsByUser)
   .write({ "timestamp": test.TIMESTAMP })
   .succeeds("Admin can write Group Membership requests-by-user");
});

//Group membership requests-by-user write test with different group  Admin
test("Group Membership requests-by-user write test with different group admin",function(rules){
  rules   //user01
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

         //user02
       .as('admin')
        .at("/users/" + uid("taimoor"))
        .write({
             email           : "arsalan@panacloud.com",
             firstName       : "tai",
             lastName        : "Rajput",
             "date-created"  : test.TIMESTAMP,
             status          : 0
         }).succeeds("group members read admin created1")

        //Groups Members
        .as("arsalan")
        .at(pathforGroupMembersGroupidUid)
        .write({
             'membership-type': 1,
              timestamp: 1452767752756
        }).succeeds("Group Members Created")

        //Group Members02
        .as("taimoor")
        .at('/group-members/meatOne/' + uid('taimoor'))
        .write({
          'membership-type' : 1,
          timestamp         : test.TIMESTAMP
        })
          .succeeds("auth user can create group members3")

    //user Group Memberships add for update Group Members Membership type from 1 to 2 for testing as admin
    .as("arsalan")
    .at(pathforUserGroupMembershipUIDGroupId)

    .write({
        "membership-type": 1,
        "timestamp": test.TIMESTAMP
    }).succeeds("user Group Membership created")

    //Groups Members membership-type update for testing read test with block user

     .as("arsalan")
     .at(pathforGroupMembersGroupidUid)
     .write({
         'membership-type': 2,
          "timestamp": test.TIMESTAMP
       }).succeeds("Group Members Created")

   .as("arsalan")
   .at("/group-membership-requests-by-user/" +  uid('taimoor') + "/" + "Meetone")
   .write({ "timestamp": test.TIMESTAMP })
   .fails("different Admin cannot write Group Membership requests-by-user of other Group membership requests-by-user");
});

//Group membership requests-by-user write test with Owner
test("Group Membership requests-by-user write test with Owner",function(rules){
  rules
    .as("admin")
    .at(pathforUserUserID)
    .write(usersData)
    .succeeds("Only admin can create user")

    //Groups Members
    .as("arsalan")
    .at(pathforGroupMembersGroupidUid)
    .write({
         'membership-type': 1,
          "timestamp": test.TIMESTAMP
    }).succeeds("Group Members Created")

 //Group Membership requests-by-user read test with owner
   .as("arsalan")
   .at(pathforGroupMembershipRequestsByUser)
   .write({ "timestamp": test.TIMESTAMP })
   .succeeds("Owner can read Group Membership requests-by-user");
});


//Group membership requests-by-user write test with different Owner
test("Group Membership requests-by-user write test with different Owner",function(rules){
  rules  //user01
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

         //user02
       .as('admin')
        .at("/users/" + uid("taimoor"))
        .write({
             email           : "arsalan@panacloud.com",
             firstName       : "tai",
             lastName        : "Rajput",
             "date-created"  : test.TIMESTAMP,
             status          : 0
         }).succeeds("group members read admin created1")

         //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
              'membership-type': 1,
               timestamp: 1452767752756
         }).succeeds("Group Members Created")

         //Group Members02
         .as("taimoor")
         .at('/group-members/meatOne/' + uid('taimoor'))
         .write({
           'membership-type' : 1,
           timestamp         : test.TIMESTAMP
         })
           .succeeds("auth user can create group members3")

 //Group Membership requests-by-user read test with different owner
   .as("taimoor")
   .at(pathforGroupMembershipRequestsByUser)
   .write({ timestamp : test.TIMESTAMP })
   .fails("different Owner can not write Group Membership requests-by-user of other Group memberships requests-by-user");
});


//Group channel  start here
//group channel read test with un auth user
test("group channel read test with un auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      //user Group Memberships
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": 1,
           "timestamp"      : test.TIMESTAMP
       }).succeeds("user-group-memberships created")

     //Group channel read test with unauth
      .as("anon")
      .at(pathforGroupChannelGroupIdChannelID)
      .read()
      .fails("Un authenticated user cannot read Group channel Chat");

});

//group channel read test with block  user
test("group channel read test with un auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      //user Group Memberships
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": -1,
           "timestamp"      : test.TIMESTAMP
       }).succeeds("user-group-memberships created")

     //Group channel read test with unauth
      .as("arsalan")
      .at(pathforGroupChannelGroupIdChannelID)
      .read()
      .fails("block user cannot read Group channel Chat");

});

//group channel read test with  auth user
test("group channel read test with auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      //user Group Memberships
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": 1,
           "timestamp"      : test.TIMESTAMP
       }).succeeds("user-group-memberships created")

     //Group channel read test with auth
      .as("arsalan")
      .at(pathforGroupChannelGroupIdChannelID)
      .read()
      .succeeds("authenticated user can read Group channel Chat");

});


//group channel write test with un auth user
test("group channel write test with un auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      //user Group Memberships
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": 1,
           "timestamp"      : test.TIMESTAMP
       }).succeeds("user-group-memberships created")

     //Group channel write test with unauth
      .as("anon")
      .at(pathforGroupChannelGroupIdChannelID)
      .write(GroupChannelData)
      .fails("Un authenticated user cannot write Group channel Chat");

});

//group channel write test with block user
test("group channel write test with un auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      //user Group Memberships
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": -1,
           "timestamp"      : test.TIMESTAMP
       }).succeeds("user-group-memberships created")

     //Group channel write test with block user
      .as("arsalan")
      .at(pathforGroupChannelGroupIdChannelID)
      .write(GroupChannelData)
      .fails("block user cannot write Group channel Chat");

});

//group channel write test with auth user
test("group channel write test with auth user" ,function(rules){
  rules
      .as("admin")
      .at(pathforUserUserID)
      .write(usersData)
      .succeeds("Only admin can create user")

      //user Group Memberships
       .as("arsalan")
       .at(pathforUserGroupMembershipUIDGroupId)

       .write({
           "membership-type": 1,
           "timestamp"      : test.TIMESTAMP
       }).succeeds("user-group-memberships created")

     //Group channel write test with auth
      .as("arsalan")
      .at(pathforGroupChannelGroupIdChannelID)
      .write(GroupChannelData)
      .succeeds("authenticated user can write Group channel Chat");

});

//Group Messages start here
//group-messages read test with un auth user

test("group-messages read test with un auth user" ,function(rules){
  rules

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        .as("anon")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .read()
        .fails("Un authenticated user can not read Group messages");

});

//group-messages read test with  auth user

test("group-messages read test with un auth user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .read()
        .succeeds("authenticated user can read Group messages");

});
//group-messages read test with  Block user

test("group-messages read test with Block user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": -1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .read()
        .fails("block authenticated user can read Group messages");

});

//group-messages write test with un auth user

test("group-messages write test with un auth user" ,function(rules){
  rules
        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        .as("anon")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(GroupMessagesData)
        .fails("Un authenticated user can not write Group messages");

});

//group-messages write test with  auth user

test("group-messages write test with un auth user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(GroupMessagesData)
        .succeeds("authenticated user can write Group messages");

});

//group-messages update test with  unauth user

test("group-messages update test with un auth user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        // Group Message write
        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(GroupMessagesData)
        .succeeds("authenticated user can write Group messages")

        // Group Message update test with un auth
        .as("anon")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write({from :  uId , timestamp  : test.TIMESTAMP , text : "Message update successfully"})
        .fails("un authenticated user cannot  update Group messages");
});

//group-messages update test with  auth user

test("group-messages update test with auth user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        // Group Message write
        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(GroupMessagesData)
        .succeeds("authenticated user can write Group messages")

        // Group Message update test with auth
        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write({from :  uId , timestamp  : test.TIMESTAMP , text : "Message update successfully"})
        .succeeds("authenticated user can update Group messages");
});

//group-messages delete test with  unauth user

test("group-messages update test with unauth user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        // Group Message write
        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(GroupMessagesData)
        .succeeds("authenticated user can write Group messages")

        // Group Message delete test with unauth
        .as("anon")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(null)
        .fails("un authenticated user cannot delete Group messages");
});


//group-messages delete test with  auth user

test("group-messages delete test with auth user" ,function(rules){
  rules
        .as("admin")
        .at(pathforUserUserID)
        .write(usersData)
        .succeeds("Only admin can create user")

        //user Group Memberships
         .as("arsalan")
         .at(pathforUserGroupMembershipUIDGroupId)

         .write({
             "membership-type": 1,
             "timestamp"      : test.TIMESTAMP
         }).succeeds("user-group-memberships created")

        // Group Message write
        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(GroupMessagesData)
        .succeeds("authenticated user can write Group messages")

        // Group Message delete test with auth
        .as("arsalan")
        .at(pathforGroupMessagesGroupIdChannelIdmessagesid)
        .write(null)
        .succeeds("authenticated user can delete Group messages");
});
*/
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
});
