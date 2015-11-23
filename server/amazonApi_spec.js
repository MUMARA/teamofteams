var frisby = require('frisby');
frisby.create('Get amazoneUrl for userImg upload')
    .get('http://localhost:3000/api/saveuserprofilepicture?userID=sweet&file_type=image/png')
    .expectStatus(200)
    .expectJSON({
        url:"https://pwowuserimg.s3.amazonaws.com/sweet.png"
    })
     .expectJSONTypes({
        signed_request: String,
        url:String
    })
    .toss();
frisby.create('Get amazoneUrl for groupImg upload')
    .get('http://localhost:3000/api/savegroupprofilepicture?groupID=sweet&file_type=image/png')
    .expectStatus(200)
    .expectJSON({
        url:"https://pwowgroupimg.s3.amazonaws.com/sweet.png"
    })
    .expectJSONTypes({
        signed_request: String,
        url:String
    })
    .toss();
frisby.create('Get amazoneUrl for subgroupImg upload')
    .get('http://localhost:3000/api/savesubgroupprofilepicture?groupID=sweet&file_type=image/png&subgroupID=sunrise')
    .expectStatus(200)
    .expectJSON({
        url:"https://pwowsubgroupimg.s3.amazonaws.com/sweet_sunrise.png"
    })
    .expectJSONTypes({
        signed_request: String,
        url:String
    })
    .toss();
//npm install -g jasmin-node --save-dev
//from command line type ::
// jasmine-node amazonApi_spec.js

var apis = {
    groupProfilePictureApi:{
        method:get,
        url:'https://panacloudapi.herokuapp.com/api/savegroupprofilepicture',
        payload:{
            file_type:'image/png',
            groupID:'name of group'
        },
        response:{
            signed_request:"long strig of url to make  put request ",
            url:'url string'
        }
    },
    userProfilePictureApi: {
        method: get,
        url: 'https://panacloudapi.herokuapp.com/api/saveuserprofilepicture',
        payload: {
            file_type: 'image/png',
            userID: 'name of group'
        },
        response: {
            signed_request: "long strig of url to make  put request ",
            url: 'url string'
        }
    },
    subgroupProfilePictureApi:{
        method:get,
        url:'https://panacloudapi.herokuapp.com/api/savesubgroupprofilepicture',
        payload:{
            file_type:'image/png',
            groupID:'name of group',
            subgroupID:'name of subgroup'
        },
        response:{
            signed_request:"long strig of url to make  put request ",
            url:'url string'
        }
    }
}