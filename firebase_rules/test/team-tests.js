var bolt       = require('firebase-bolt');
var rulesSuite = bolt.rulesSuite;

rulesSuite("Team Tests", function(test) {
  var uid = test.uid;
  test.database("multi-test", "V4pRxvp12zTpi0wRRbYuPYvlopSudm5YX6qGiU1y");
  test.rules("securityrules");
  //...<your tests here>...
 //================================================
//Path for Nodes
var uId                                      =   uid( "arsalan");
var groupid                                  =   "panacloud";
var subgroupid                               =   "meetOne";
var pathforGroupGroupID                      =   "/groups/" + groupid;
var pathforUserUserID                        =   "/users/" + uId;
var pathforGroupNameGroupID                  =   "/groups-names/" + groupid;
var pathforGroupMembersGroupidUid            =   "/group-members/" + groupid + "/" +  uId;
var pathforUserGroupMembershipUIDGroupId     =   '/user-group-memberships/' + uId + "/" + groupid;
var pathforSubgroupGroupIDSubgroupID         =   "/subgroups/" + groupid  + "/" +  subgroupid;
var pathforSubgroupmembersGroupIDSubgroupIDUSerID = "/subgroup-members/" + groupid + "/" + subgroupid + "/" + uId;
//=================================================
//User Data
var usersData = { email           : "arsalan@panacloud.com",
                  firstName       : "Arsalan",
                  lastName        : "Rajput",
                  "date-created"  : test.TIMESTAMP,
                  status          : 0      };

//Sub Group Data
var subgroupData = {
                  policyID             :  "1",
                  "members-checked-in-count" :   0,
                   title               : "Hello",
                   timestamp           : test.TIMESTAMP,
                   "members-count"     : 1,
                   "microgroups-count" : 0


};
//Group Data
  var groupData = {
                    privacy :  1,
                    "members-checked-in-count" : 0,
                    title             : "Hello",
                    timestamp         : test.TIMESTAMP,
                    "members-count"   : 1,
                    "subgroups-count" : 0,
                    timeZone          : "12345",
                    phone             : "124542124612225",
                    "group-owner-id"  : "panacloud"
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
    var SubgroupMembersData = {

      };
//=============================================
//Sub Groups Write test with owner
 test("Subgroup create Tests with owner", function(rules){
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
         .succeeds("auth user can write group-activity-streams")

         //Sub Group Members
         .as("arsalan")
         .at(pathforSubgroupmembersGroupIDSubgroupIDUSerID)
         .write({
               "membership-type"     :  1,
               timestamp             : test.TIMESTAMP
         })
         .succeeds("Group Owner and admin can create subgroup")

         //Sub group Created
         .as("arsalan")
         .at(pathforSubgroupGroupIDSubgroupID)
         .write(subgroupData)
         .succeeds("Owner and admin can create group");
 });

//Sub Groups Write test with Admin
 test("subgroup create by admin" ,function(rules){
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


       //Groups Members update 1 to 2 for testing as admin
        //Groups Members
         .as("arsalan")
         .at(pathforGroupMembersGroupidUid)
         .write({
                  'membership-type': 2,
                  timestamp: 1452767752756
         }).succeeds("Group Memebers Created")

         //Sub Group Members
         .as("arsalan")
         .at(pathforSubgroupmembersGroupIDSubgroupIDUSerID)
         .write({
               "membership-type"     :  1,
               timestamp             : test.TIMESTAMP
         })
         .succeeds("Group Owner and admin can create subgroup")

         //Sub group Created
         .as("arsalan")
         .at(pathforSubgroupGroupIDSubgroupID)
         .write(subgroupData)
         .succeeds("Owner and admin can create group");
 });
 //Sub Groups Write test with Admin
  test("subgroup create by admin" ,function(rules){
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

         //user Group Memberships
        .as("arsalan")
        .at(pathforUserGroupMembershipUIDGroupId)

        .write({
            "membership-type": 1,
            "timestamp": test.TIMESTAMP
        }).succeeds("User Group Memberships Created")

        //Groups Members update 1 to 3 for testing as members

         //Groups Members
          .as("arsalan")
          .at(pathforGroupMembersGroupidUid)
          .write({
                   'membership-type': 3,
                   timestamp: 1452767752756
          }).succeeds("Group Memebers Created type 3")

          //Sub Group Members
          .as("arsalan")
          .at(pathforSubgroupmembersGroupIDSubgroupIDUSerID)
          .write({
                "membership-type"     :  1,
                timestamp             : test.TIMESTAMP
          })
          .fails("Group Members can not create subgroup")

          //Sub group Created
          .as("arsalan")
          .at(pathforSubgroupGroupIDSubgroupID)
          .write(subgroupData)
          .fails("Members can not create group");
  });

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
