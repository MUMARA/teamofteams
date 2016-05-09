/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';



console.log('running sw.js')

/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["/","1b00890606b53d5f5199fb555ee2e9xg"],["/app-dev.js","1b00890606a53d5d5199fb444ee2e0bc"],["/bower_components/angular-animate/angular-animate.js","c5f5a86255244211c039250b2e48dbb8"],["/bower_components/angular-aria/angular-aria.js","be71a0a76f1cb52a6386192c5b51107b"],["/bower_components/angular-audio/app/angular.audio.js","ffb6376cc93b1d492beeb83fa965497f"],["/bower_components/angular-filter/dist/angular-filter.js","e025d4254b6733859cc31c8de24d2889"],["/bower_components/angular-img-cropper/dist/angular-img-cropper.min.js","cf4168ff3f27b10cf87ad9678c0d9bb4"],["/bower_components/angular-material-data-table/dist/md-data-table.css","c0c750e4a7f4cecc4d3e243c51a5df89"],["/bower_components/angular-material-data-table/dist/md-data-table.js","6e00fd5a26a3423855519550e2f9e732"],["/bower_components/angular-material-icons/angular-material-icons.js","e15743d0992ba9d6e2039a0d9b2f8f32"],["/bower_components/angular-material/angular-material.css","46af97d920a21fe0ed5320a93fdb3bf8"],["/bower_components/angular-material/angular-material.js","f1801b7fb65dbf454489daa14d73568e"],["/bower_components/angular-messages/angular-messages.js","6bd632e657e3dcd6b9eed6c8a3a64336"],["/bower_components/angular-sanitize/angular-sanitize.js","8896d8b577487713331f25388d42c797"],["/bower_components/angular-simple-logger/dist/angular-simple-logger.js","e73a726caa05c767d6c0ac66bb3386f0"],["/bower_components/angular-truncate-2/dist/angular-truncate-2.js","7e8918a3f332ae37504865a22cad7f93"],["/bower_components/angular-ui-router/release/angular-ui-router.js","918ba26f2dd494a6675db8400a3bfaf4"],["/bower_components/angular/angular.js","44a4f42184a6be6859dd330395da10c8"],["/bower_components/angularfire/dist/angularfire.min.js","941ec74e20175e58631eb84844ebd38c"],["/bower_components/firebase/firebase-debug.js","cfdcde05d885e4ad9d60dc3686f96bd5"],["/bower_components/leaflet/dist/leaflet-src.js","303c1b3f336bd776dc9468c456ce2898"],["/bower_components/leaflet/dist/leaflet.css","f4e9ad81782ce8cd14c99592c4238e20"],["/bower_components/moment/moment.js","14123994e3e23f8a271f25d23f43ff60"],["/bower_components/mui/mui.js","3e064fd01f2b903c1accba51db3eee91"],["/bower_components/ng-mfb/mfb/dist/mfb.css","21d756f444ad3c0e10fc2cd3c59492a2"],["/bower_components/ng-mfb/src/mfb-directive.js","331ccecc70f5c790567a1e8d4e7b3173"],["/bower_components/ngGeolocation/ngGeolocation.min.js","66047ba15e6a66a5d98566cc09a870bb"],["/bower_components/ngstorage/ngStorage.min.js","c8617aa6579d3ca2d5a8188179f6cf79"],["/bower_components/rxjs/dist/rx.all.js","978125bda446341b3a76dc5372ef05fc"],["/bower_components/ui-leaflet/dist/ui-leaflet.js","51daf4b6e316ca30d38676d346c1a391"],["/components/activity/activity.html","4f474a7068e4f533502a0f7e2d578898"],["/components/activity/activity.js","4ac701f34abcf9f6beee0ff08a1fffbe"],["/components/chat/chat.html","5668464d032c3bfec1b1b74c9e4ea9a8"],["/components/chat/chat.js","3712654bbcfb46baba4283357839a090"],["/components/collaborator/collaborator.html","6babf19d6931db0b1870310f00e31335"],["/components/collaborator/collaborator.js","6c7e76f69775e862bee8457e6a08c339"],["/components/collaborator/collaboratorService.js","a646ad738ada5aad92eb67a1fc73a552"],["/components/componentsCoreModule.js","efb599e1aedae292bca322729beffd0a"],["/components/create-group/create-group.html","b282b98783eabe3cd6442a6eb95d4387"],["/components/create-group/create-group_org.html","fc2dab18ef45b7f6d67bccf7093da7d0"],["/components/create-group/createGroup.js","82b18a809b5794b0af4c90c248afb65e"],["/components/create-group/createGroupService.js","418a5f540864d1ef0bb6915825b4f9c4"],["/components/create-sub-group/create-sub-group-org.html","672630c0c939b5015cbfa9e1c4ad8137"],["/components/create-sub-group/create-sub-group.html","18e8f7d9a6fd746117937eabaa62b324"],["/components/create-sub-group/createSubGroup.js","c683cc3afa55f30dbff35e459778f933"],["/components/create-sub-group/createSubGroupService.js","a5c982d711cabd6587a5cd23c8da75ae"],["/components/edit-group/edit-group-org.html","07e0347f54d74d3fbc92390c07e3d475"],["/components/edit-group/edit-group.html","c88dcb612481aea00c16b00c180ef883"],["/components/edit-group/edit-group.js","18479454955993195405d43b538b7b71"],["/components/edit-group/editGroupService.js","feea56bfad77b462cf3e5b15a727681d"],["/components/forgot/forgot.html","bdaa63174a1a216da77a3604a20b239a"],["/components/forgot/forgot.js","44ef21a7389c822705ff4192eda387c3"],["/components/forgot/forgotService.js","6ecb0f41459e55a7efe2e29a418fcae2"],["/components/group/group.html","1e356d39098c921fcd872694d396dfc0"],["/components/group/group.js","513a87cd7115f913a1a13308c6f21888"],["/components/group/groupService.js","9e7a8ba83a5041417738f9c913ffa47e"],["/components/group/group_.js","771e36327ffcd7e3c810f4dc3fe080e4"],["/components/group/group_org.html","1274aa0c450a414d55da1556ee5ab1a0"],["/components/home/home.html","d36131729f532eea4fc4adc1487baed1"],["/components/home/home.js","e772d7065411cdc1394f53e5b7847ab7"],["/components/join-group/join-group.html","fdc41204d88fbca8ae4e0d664cc4459b"],["/components/join-group/join-group_org.html","8a47c5a976291a1713c8f8280026452b"],["/components/join-group/joinGroup.js","1d56696ed72546437482a16eda3a39de"],["/components/join-group/joinGroupService.js","e773d00f20ad3352a065d53f86b792d0"],["/components/manualattendace/manualattendace.html","3a1658cb1b91087a0d5b35d5cafd8f66"],["/components/manualattendace/manualattendace.js","0f81061fe829f9fc250cc23c28c79a02"],["/components/membershipcard/membershipcard.html","6a35ca3027ef7112a4f8cd15bb89ad0f"],["/components/membershipcard/membershipcard.js","cd48558bf6db3670460fb9b1d5fdb3f6"],["/components/nav-loginbar/nav-loginbar.html","b1bfcf4643823858cd1fb16d4d8624a0"],["/components/nav-loginbar/navLoginbar.js","a69c7ab640cf2489cf0c841d2d7a82e1"],["/components/nav-toolbar/nav-toolbar.html","a5f31a867fb2793fa8f361f9669b0c92"],["/components/nav-toolbar/navToobarService.js","e760c069e683860eb89fab9c365dcb3a"],["/components/nav-toolbar/navToolbar.js","ed86990fbc1ab03c127853a90d5d1a16"],["/components/personal-settings/personal-settings.html","759e1cc66a33bedf3cc4552bb0651d57"],["/components/personal-settings/personal-settings.js","d8bb39c42bbf68cdaa8f63aace8eb194"],["/components/personal-settings/personal-settingsService.js","1db6e5e86e9c0477b86f37db38cf0d8d"],["/components/policy/policy.html","520643f97df3ee2075e83f49c8e1d921"],["/components/policy/policy.js","e8377011246c98fe3e7532cec2e269c2"],["/components/policy/policyService.js","d7525cd632487dd233658a61b2f55af4"],["/components/policy/policy_working.html","f534afb18b5d2d87deb40c3d21d01437"],["/components/progressreport/progressreport.html","9c1bc95c956b526f864a9a5f553a5ae8"],["/components/progressreport/progressreport.js","7b088c76b035befc016710701a639779"],["/components/progressreport/progressreportService.js","89fe914ba26bfed179b54e54ffe25eec"],["/components/quiz/images.png","7b05845583a9e7016cf9e5df26e47bdf"],["/components/quiz/images/closeIcon.png","ab560bf9f90a7da79245300a071b702f"],["/components/quiz/images/deleteIcon.png","22f222670aab3f9b37cf4b1dcdc8b4c5"],["/components/quiz/images/ic_delete_24px.svg","47a58eb12c698f21697d92e2981caea0"],["/components/quiz/quiz.html","af1294a7fabf6a39682de1d3427e1b49"],["/components/quiz/quiz.js","ef94eb725766984ee7231ececf85555e"],["/components/quiz/quizService.js","019146b10da5ea1ba5c06e59a372f8c9"],["/components/report/report.html","9e9d3d800d32ebbb6ad0e24f3fb6d8ea"],["/components/report/report.js","2f111df06c07ef9ca354a685fc3adf29"],["/components/sign-up/sign-up.html","bde233b4888f5ef3470ce02698b39a39"],["/components/sign-up/signUp.js","6d3a1ea38bb84a787d3524e845ea05a6"],["/components/sign-up/signUpService.js","2c937c1bfdf21e0376fbbf3408062d4b"],["/components/signin/signInService.js","be7dcbb0192a5f1935ce680c5a9574f7"],["/components/signin/signin.html","49360eafbb13a9719af271c85ff79fd3"],["/components/signin/signin.js","3eabf817418e2e31197e88dba9c7b795"],["/components/user-setting/user-setting.html","2ed1714d8811ee6ccd3ebf88487702cd"],["/components/user-setting/user-setting_org.html","f281eb4adc88ebb3fe095e65a24b727f"],["/components/user-setting/userSetting.js","d60bf1efd68d500227d63bbf9a32ccdd"],["/components/user-setting/userSettingService.js","147528e1b017822bd4522ef41a86b865"],["/components/user/user.html","a74a26b78efd84d8eace512257eca6be"],["/components/user/user.js","2f00a86bff5f1bf7c7caa1c002ba009c"],["/components/user/userService.js","8a504a2f7fc7dea06ac4cb4354e3a0bb"],["/components/user/user_org.html","e080a80b522c92cc63807c717486c4d4"],["/components/user/usergroupcard.html","403ef73440f6ba4ecefa994bacdb44a3"],["/config/appRoutes.js","d32deba7cd8015f69e95c9e2a335cfa7"],["/config/ngMaterialConfig.js","dd5f0ff41f08ad8ed01cc9e1de76258b"],["/coreModules/core.module.js","0c0550e7032cdf4e45525fcbe43f991f"],["/coreModules/firebase-as-array.js","08e837f25d2448e3653dc6fe8550627e"],["/css/collaborator.css","1aca1276727537f75839c7f44d42f407"],["/css/style.css","eedb355bfa7a81e8a61e92bf2219bf94"],["/directives/checkGroupExistance.directive.js","919b9f887cf30a8a94f694b14bd0882e"],["/directives/checkUserID.directive.js","e9a702bf698aef81c21a10067e21cd92"],["/directives/compareTo.directive.js","c8e3ec67156469b69e95fd42260ee66a"],["/directives/dilogue1.tmpl.html","dbc3b48ff0818554f525d8516a8974e2"],["/directives/dilogue2.tmpl.html","4d7226dfc586372f8b976ee2cd9981c6"],["/directives/groupcardDirective.html","3fe8cf30a5fa37c2995a24ff1c0b91ef"],["/directives/groupcardDirective.js","b76ac95168cab1c84c8ab5c3501e3b22"],["/directives/subgroupcardDirective.html","50b0906f4fa790486786d52bccfb0501"],["/directives/subgroupcardDirective.js","291b401acc4ae9f0514637440429ec0d"],["/img/12452.svg","2c0c60cceba2e299d5352c2f3859d75e"],["/img/1add_quiz.svg","dc6d4f146405a081551533c23b99ad86"],["/img/1angular.png","cf2e89eb796a4db545b2d60f41e2f070"],["/img/1arrow.png","cca720dd209e8bdcd55aeb3706da306c"],["/img/1banda.svg","2783ff5a9f0f7160f02d994b7532b2fd"],["/img/1book.svg","9f62dc3e87f25a240d8029343d123ed7"],["/img/1calendar.svg","54b6caff62dfb30626619b5aba080ac1"],["/img/1chapter.svg","11bb0721df22f28b226eb1c4fd8faa25"],["/img/1dots.svg","3d3fd9e4e199070a748e3e30e470676d"],["/img/1dropdown.svg","711120a45748d852977df7cf40dff62a"],["/img/1ioniclogo.png","cf58a92c783b62c8caefdfb6e05869e3"],["/img/1questions.svg","b0cc18c7438722981e1d3d59542cbe6f"],["/img/1quiz_bank.svg","6a7f0c95c2c65f0c1f4cc74616c15f4e"],["/img/1quiz_schedule.svg","264fa6c67c1954a2bfd7cb6ad55ccee5"],["/img/1sami.svg","0cb820111d54bee9cbfa60886a919633"],["/img/1search.svg","e8a9a95520e7a3af221802c5f3697b66"],["/img/1swift.png","29efc3c8d9ef0daa5d7b190319b3b32e"],["/img/1topic.svg","b4fe93965bfddb6dafcce748fadd8853"],["/img/2.svg","2b27b9d23c31ed411271ecc858891c0d"],["/img/2sami.svg","2507bdf95dbe7cbbd2f8a05b31f6977d"],["/img/3sami.svg","7b15925fe4b707d7d22c58a2b9b82a74"],["/img/4sami.svg","5a8e778bf46115f34278035cc957eec0"],["/img/5sami.svg","a7fe19cbc57ccb84df669d014c89cf49"],["/img/6sami.svg","3ef59a9e671e18fb326f8a05d7f3386c"],["/img/ABCD.svg","2c0c60cceba2e299d5352c2f3859d75e"],["/img/PanacloudLogoForList.svg","96489f30202fd670e9f8dcf517cb82d0"],["/img/Untitled-3.png","1802b8612b856a6787a76ef3cc146c32"],["/img/Untitled-3.svg","00a05a0f8b24d5811dd054ba456718af"],["/img/Untitled-4.svg","0cb820111d54bee9cbfa60886a919633"],["/img/Untitled-4_06.png","ab4f2ed379673fb3ad4036cf6ee75e5b"],["/img/Untitled-6.svg","7b15925fe4b707d7d22c58a2b9b82a74"],["/img/account-box.svg","823ae699b6dcb2957ca04b85dee716e1"],["/img/add_quiz_2_.svg","dc6d4f146405a081551533c23b99ad86"],["/img/arrow-left.svg","20329df6e6a597d60f0a4e80f97f244a"],["/img/arrow.svg","8b094839b994c67bfaa085fef2698171"],["/img/backGroundImg.svg","343e1a71fef466af5c23dadb96a93e1d"],["/img/book.png","616f5122aed78d55e24cfdf1e96d8950"],["/img/card.jpg","0291b36b5ff63a10712bed735c257860"],["/img/carrot.svg","a6757055b218f01f2af98a94ed0817de"],["/img/check.png","d6e95efc29d0830be990fafcecc8fef5"],["/img/checkarrow.svg","e569cf0b2ec48043248401dbca8c7eba"],["/img/checkbox.svg","58f86f11269065887ed969b7b2f90a0c"],["/img/citibankLogo.svg","cee8b13e26f0906114784adbebb95098"],["/img/closeIcon.png","ab560bf9f90a7da79245300a071b702f"],["/img/comment.svg","4d3299de3d042868a01b5742e60ccb77"],["/img/correct.svg","66189608e9095e35d8e840d8dfd0f21e"],["/img/corrects.svg","26bd55a2815b84ffea2eeb77d9055991"],["/img/cross.svg","e5247d665a181c3fe593b0a20fae560f"],["/img/dd.jpg","575eaa645ebde6a51c1d5baaeed3bcd7"],["/img/delete.svg","a2f67aa31b50abf2b4ee20d0d23c9ff7"],["/img/email.svg","794896dfbb462449797be2443e4b14c0"],["/img/facebook.svg","6b28605271e4a2694b24fa2a8264c09e"],["/img/favico/favicon-32x32.png","dd13b97c4e4ca0d03105b41bd81ff76b"],["/img/favico/favicon-96x96.png","173da3e9f542384318edbc62892cb91b"],["/img/forGroupPage.svg","c3ccd3d17debf4af3ae7ec56c8b68f0b"],["/img/forGroupPage1.svg","1884904914006b8dfded551d282c87c4"],["/img/forGroupPage2.svg","4966321dbe5442367d9d8bd640f001ca"],["/img/geoLocation.svg","e04cfd9db975a89ed66b77559bcfd69a"],["/img/github-circle.svg","9247cf81e76053007d8e265df4735f27"],["/img/google.svg","06753fad7d4bfe8e764726851a53fa98"],["/img/habibBankLogo.svg","303d4464f20207f708d6b28c6b8932bf"],["/img/header_subheader.png","2331d7a2a391107ed7b5529320d1292d"],["/img/icon1.svg","f691a936306b76bbbc15a1e28956b790"],["/img/image.svg","9214a70cfed90035ccf89d6cab1b9c07"],["/img/info2.svg","461b8751d9d551c6dd59d298c23fa605"],["/img/infoB.svg","f9f0c149e15bf8548e0f463e62a9d072"],["/img/info_small_icon.png","0b700d9dacff9c105a525d7e1bb02ffc"],["/img/line.svg","642ccb153512e5cf0802e5f1c17cbef0"],["/img/location.svg","07033b41b660899ec31d84cb42388ed9"],["/img/location_point.svg","b8842ca28b558b7685ad806b3f3838df"],["/img/magnify.png","02f281555fe09b6727517c794e133322"],["/img/magnify.svg","8f811eb0d0db1b70df827b2c274e2d1d"],["/img/map-marker.svg","44db382c713a0801c166baa5e6a8f9a0"],["/img/menu.svg","9315eb23d7c22ebae099065a7baf4df6"],["/img/multiContact.png","b866bf583d941f3c9c14a1a8f21d3a40"],["/img/notification.svg","95dba9a70883a674d317a97e57b3d436"],["/img/notification1.svg","bff7b701db0ad21f001a33bd472c7347"],["/img/passfail.jpg","1511000dae30a09dc82c64dfed779585"],["/img/people_button.svg","c0c7eccd96565dd1a9069316b99caaad"],["/img/people_button_black.svg","c271280599d07790cc9e780f8b367b8a"],["/img/phone-in-talk.svg","f1065a63aae5ab1cbc290baa846c4f93"],["/img/pizzahut.jpg","06fac25d32425c12889870a9b421bf0e"],["/img/plus.svg","d704d513d1e1d6c8ddd66f11b3164de9"],["/img/quiz_schedule.svg","264fa6c67c1954a2bfd7cb6ad55ccee5"],["/img/ring.svg","d6b5f46207c32f0f2bae18a2bfc033a1"],["/img/sami.png","0e878d65d27722f004c626a5ac0c51e8"],["/img/sampleUserImg.svg","cc8c425edc508870db83ca899c0fb2ae"],["/img/search.svg","c28161b9900767053ff575a636bb53c2"],["/img/searchDarkGrey.svg","39354deccc16ee97a315c634be32577f"],["/img/security.svg","ff9b8051ae2aa3d9fed263960fd158f9"],["/img/sj.jpg","0d22dd15de53587c5ea7f50f6787b295"],["/img/sj1.jpg","3983f74b44b64c7e1fa072da49515caf"],["/img/subheader.png","c0b9574798a6aaa4f4780e7e3964721b"],["/img/switchCardListLogo.svg","4dba4eeadfd4d0aab5e460383ef959e6"],["/img/tcpana.png","af1f76a5eb5da9f4e03c1046ee852dfc"],["/img/up-arrow.png","6d9d0120f1e3f1303c78ecd9c79580ca"],["/img/userImg1.svg","0af919307b0aa22d3047828b147c4162"],["/img/userImg2.svg","626aa90c3a9c217f74da90868ffd5434"],["/img/userImg3.svg","0766f5f8b38ec1b3e34e459e8d954321"],["/img/userImg4.svg","3f26d0af79456868bf0570e400f7af31"],["/img/verified_user.svg","e3a4980699a6591ced5332111843c64e"],["/img/washedout.png","70b84b894d88b367d49d56a8cd808cca"],["/lib/collaborator/bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js","d47d6088e4454c5ee683f387a8e26b56"],["/lib/collaborator/clike/clike.js","771727137ad00aa9eea87d44ce2f7307"],["/lib/collaborator/codemirror/lib/codemirror.css","74a4f4791323898f03c4bea861202529"],["/lib/collaborator/codemirror/lib/codemirror.js","066d7e1b28fca97d227e8ab5c1f37166"],["/lib/collaborator/firepad/dist/firepad.css","9588182c2dd734c55f4a96718dd113d7"],["/lib/collaborator/firepad/dist/firepad.js","6f1b5306d6cfb14fba8a7702aa61dfc3"],["/lib/collaborator/swift/swift.js","c1eb7385cd9447e380e65fa03a4492d3"],["/minifyVersion/all.js","8ffd48159a86f1176008ee1c1b40c93b"],["/services/activityStreamService.js","3c59ebe145f369a06b4142423a521323"],["/services/auth.service.js","8f0cc8c99b2d23103bf8cb3d10c1c571"],["/services/chatService.js","c285a292a4b42e79a07cf64b8758b9d1"],["/services/checkin.service.js","49c08eef2a377ac0a57beff2a3132927"],["/services/confirmDialog.service.js","6afd2f0d0ebd4a0ea7fcb74d9ffa4ba7"],["/services/dataService.js","a3eb6f6d6504c36547dc091245f57df9"],["/services/firebase.service.js","dcc28d1e2779d5871b2fd16a8971c5ea"],["/services/group.firebase.service.js","003607f92438614d1356c120afbc4a16"],["/services/message.service.js","a0bca540da4299b32e449c60d21647fb"],["/services/serviceWorker.js","20fd9c762620ba822ccee7ea30956d44"],["/services/sound.service.js","3a0d611989bb3794518ce250070c0310"],["/services/subgroup.firebase.service.js","e7aab62c58bb97538f10a7139a308074"],["/services/user.firebase.service.js","0ce8d03fe3c0776dbfd3181d9705f410"],["/services/user.service.js","082f4c1c1af7307adfc4d887b951ba9a"],["/services/userHelper.firebase.js","69d4eb84ed30f3771972ee66ce94e46e"],["/services/userPresence.firebase.js","7eda466fc28181b83a91d6edec2b0842"],["/services/util.service.js","5712b50d53581ceb8407fa7513feca9b"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1-02' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, now) {
    now = now || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
      'sw-precache=' + now;

    return urlWithCacheBusting.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  var now = Date.now();

  event.waitUntil(
    caches.keys().then(function(allCacheNames) {
      return Promise.all(
        Object.keys(CurrentCacheNamesToAbsoluteUrl).filter(function(cacheName) {
          return allCacheNames.indexOf(cacheName) === -1;
        }).map(function(cacheName) {
          var urlWithCacheBusting = getCacheBustedUrl(CurrentCacheNamesToAbsoluteUrl[cacheName],
            now);

          return caches.open(cacheName).then(function(cache) {
            var request = new Request(urlWithCacheBusting, {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName], response);
              }

              console.error('Request for %s returned a response with status %d, so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          });
        })
      ).then(function() {
        return Promise.all(
          allCacheNames.filter(function(cacheName) {
            return cacheName.indexOf(CacheNamePrefix) === 0 &&
                   !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '/';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html') &&
        /* eslint-disable quotes, comma-spacing */
        isPathWhitelisted([], event.request.url)) {
        /* eslint-enable quotes, comma-spacing */
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // Rely on the fact that each cache we manage should only have one entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              if (response) {
                return response;
              }
              // If for some reason the response was deleted from the cache,
              // raise and exception and fall back to the fetch() triggered in the catch().
              throw Error('The cache ' + cacheName + ' is empty.');
            });
          });
        }).catch(function(e) {
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});




