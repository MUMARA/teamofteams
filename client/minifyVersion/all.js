/**
 * Created by ZiaKhan on 16/12/14.
 */

// Invoke 'strict' JavaScript mode
'use strict';

angular.module('core', [
    'ngAudio',
    'ngAnimate',
    'ngAria',
    'ngMdIcons',
    'ngMaterial',
    'firebase',
    'ngStorage',
    'ngGeolocation',
    'ngMessages',
    'ng-mfb',
    'ui.router',
    'angular-img-cropper',
    'md.data.table',
    'ui-leaflet',
    'angular.filter',
    'ngFileSaver',
    'truncate',
    'ngSanitize'
  ]).filter('groupUsers', function() {
      return function(users, groupID) {
        var filteredUsers = [];
        users.forEach(function(user) {
          if (user.groupID == groupID) {
            var userNew = findWithAttr(filteredUsers, 'fullName', user.fullName) == -1;
            if (userNew) {
              filteredUsers.push(user);
            }
          }
        });
        return filteredUsers;
      };

      function findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i][attr] === value) {
            return i;
          }
        }
        return -1;
      }
    })
  .filter('trustUrl', ['$sce', function($sce) {
    return function(url) {
      /*var temp;
       $.get(url).success(function(data){
       temp = 'data:image/jpeg;base64' + data;
       });

       //var temp = webkitURL.createObjectURL(url)*/
      return url
    };
  }])
  .filter('emptyString', [
    function() {
      return function(input, param) {
        if (!param) return input

        var ret = [];
        if (!angular.isDefined(param)) param = true;


        if (param) {
          angular.forEach(input, function(v) {
            if (angular.isDefined(v.comment) && v.comment) {
              v.comment = v.comment.replace(/^\s*/g, '');
              ret.push(v);
            }

          });
        }
        return ret;
      };
    }
  ])
  .filter('millSecondsToTimeString', [function() {
    return function(millseconds) {
      var seconds = Math.floor(millseconds / 1000);
      var days = Math.floor(seconds / 86400);
      var hours = Math.floor((seconds % 86400) / 3600);
      var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
      var timeString = '';
      if (days > 0) timeString += (days > 1) ? (days + " days ") : (days + " day ");
      if (hours > 0) timeString += (hours > 1) ? (hours + " hours ") : (hours + " hour ");
      if (minutes >= 0) timeString += (minutes > 1) ? (minutes + " minutes ") : (minutes + " minute ");
      return timeString;
    }
  }])
  .filter('glt', [function() {
    return function(items, field, maxvalue, minvalue) {
      if (maxvalue && minvalue) {
        var filteredItems = []
        angular.forEach(items, function(item) {
          if (item[field] >= maxvalue && item[field] <= minvalue) {
            filteredItems.push(item);
          }
        });
        return filteredItems;
      } else if (maxvalue) {
        var filteredItems = []
        angular.forEach(items, function(item) {
          if (item[field] >= maxvalue) {
            filteredItems.push(item);
          }
        });
        return filteredItems;
      } else {
        return items
      }

    }
  }])
  .filter('multilineFilter', ['$sce', function($sce) {
    return function(text) {
      if (text !== undefined) return $sce.trustAsHtml(text.replace(/\n/g, '<br />'));
    }
  }]);

/*! Firebase.getAsArray - v0.1.0 - 2014-04-21
* Copyright (c) 2014 Kato
* MIT LICENSE */

(function(exports) {

  exports.getAsArray = function(ref, eventCallback) {
    return new ReadOnlySynchronizedArray(ref, eventCallback).getList();
  };

  function ReadOnlySynchronizedArray(ref, eventCallback) {
    this.list = [];
    this.subs = []; // used to track event listeners for dispose()
    this.ref = ref;
    this.eventCallback = eventCallback;
    this._wrapList();
    this._initListeners();
  }

  ReadOnlySynchronizedArray.prototype = {
    getList: function() {
      return this.list;
    },

    add: function(data, customKey) {
      if(customKey){
        var ref = this.ref.child(customKey);
        if (arguments.length > 0) {
          ref.set(parseForJson(data), this._handleErrors.bind(this, customKey));
        }
        return ref;
      }
      else {
        var key = this.ref.push().key();
        var ref = this.ref.child(key);
        if (arguments.length > 0) {
          ref.set(parseForJson(data), this._handleErrors.bind(this, key));
        }
        return ref;
      }
    },

    set: function(key, newValue) {
      this.ref.child(key).set(parseForJson(newValue), this._handleErrors.bind(this, key));
    },

    update: function(key, newValue) {
      this.ref.child(key).update(parseForJson(newValue), this._handleErrors.bind(this, key));
    },

    setPriority: function(key, newPriority) {
      this.ref.child(key).setPriority(newPriority);
    },

    remove: function(key) {
      this.ref.child(key).remove(this._handleErrors.bind(null, key));
    },

    posByKey: function(key) {
      return findKeyPos(this.list, key);
    },

    placeRecord: function(key, prevId) {
      if( prevId === null ) {
        return 0;
      }
      else {
        var i = this.posByKey(prevId);
        if( i === -1 ) {
          return this.list.length;
        }
        else {
          return i+1;
        }
      }
    },

    getRecord: function(key) {
      var i = this.posByKey(key);
      if( i === -1 ) return null;
      return this.list[i];
    },

    dispose: function() {
      var ref = this.ref;
      this.subs.forEach(function(s) {
        ref.off(s[0], s[1]);
      });
      this.subs = [];
    },

    _serverAdd: function(snap, prevId) {
      var data = parseVal(snap.key(), snap.val());
      this._moveTo(snap.key(), data, prevId);
      this._handleEvent('child_added', snap.key(), data);
    },

    _serverRemove: function(snap) {
      var pos = this.posByKey(snap.key());
      if( pos !== -1 ) {
        this.list.splice(pos, 1);
        this._handleEvent('child_removed', snap.key(), this.list[pos]);
      }
    },

    _serverChange: function(snap) {
      var pos = this.posByKey(snap.key());
      if( pos !== -1 ) {
        this.list[pos] = applyToBase(this.list[pos], parseVal(snap.key(), snap.val()));
        this._handleEvent('child_changed', snap.key(), this.list[pos]);
      }
    },

    _serverMove: function(snap, prevId) {
      var id = snap.key();
      var oldPos = this.posByKey(id);
      if( oldPos !== -1 ) {
        var data = this.list[oldPos];
        this.list.splice(oldPos, 1);
        this._moveTo(id, data, prevId);
        this._handleEvent('child_moved', snap.key(), data);
      }
    },

    _moveTo: function(id, data, prevId) {
      var pos = this.placeRecord(id, prevId);
      this.list.splice(pos, 0, data);
    },

    _handleErrors: function(key, err) {
      if( err ) {
        this._handleEvent('error', null, key);
        console.error(err);
      }
    },

    _handleEvent: function(eventType, recordId, data) {
      // console.log(eventType, recordId);
      this.eventCallback && this.eventCallback(eventType, recordId, data);
    },

    _wrapList: function() {
      this.list.$indexOf = this.posByKey.bind(this);
      this.list.$add = this.add.bind(this);
      this.list.$remove = this.remove.bind(this);
      this.list.$set = this.set.bind(this);
      this.list.$update = this.update.bind(this);
      this.list.$move = this.setPriority.bind(this);
      this.list.$rawData = function(key) { return parseForJson(this.getRecord(key)) }.bind(this);
      this.list.$off = this.dispose.bind(this);
    },

    _initListeners: function() {
      this._monit('child_added', this._serverAdd);
      this._monit('child_removed', this._serverRemove);
      this._monit('child_changed', this._serverChange);
      this._monit('child_moved', this._serverMove);
    },

    _monit: function(event, method) {
      this.subs.push([event, this.ref.on(event, method.bind(this))]);
    }
  };

  function applyToBase(base, data) {
    // do not replace the reference to objects contained in the data
    // instead, just update their child values
    if( isObject(base) && isObject(data) ) {
      var key;
      for(key in base) {
        if( key !== '$id' && base.hasOwnProperty(key) && !data.hasOwnProperty(key) ) {
          delete base[key];
        }
      }
      for(key in data) {
        if( data.hasOwnProperty(key) ) {
          base[key] = data[key];
        }
      }
      return base;
    }
    else {
      return data;
    }
  }

  function isObject(x) {
    return typeof(x) === 'object' && x !== null;
  }

  function findKeyPos(list, key) {
    for(var i = 0, len = list.length; i < len; i++) {
      if( list[i].$id === key ) {
        return i;
      }
    }
    return -1;
  }

  function parseForJson(data) {
    if( data && typeof(data) === 'object' ) {
      delete data['$id'];
      if( data.hasOwnProperty('.value') ) {
        data = data['.value'];
      }
    }
    if( data === undefined ) {
      data = null;
    }
    return data;
  }

  function parseVal(id, data) {
    if( typeof(data) !== 'object' || !data ) {
      data = { '.value': data };
    }
    data['$id'] = id;
    return data;
  }
})(typeof(window)==='undefined'? exports : window.Firebase);
(function() {
    'use strict';
    angular
        .module('app.user', ['core'])
        .factory('userCompService', ['$state', '$interval', 'userService', '$location', 'authService', '$http', '$q', 'appConfig', '$firebaseObject', 'firebaseService', 'userFirebaseService', '$firebaseArray',
            function($state, $interval, userService, $location, authService, $http, $q, appConfig, $firebaseObject, firebaseService, userFirebaseService, $firebaseArray) {
                var FlattendGroupDataByUser = (function() {
                    var _cb, self, pending = true;
                    var $loadedDefer, _count = 0;
                    var flattenedsubGroupsByuser = {};

                    window.temp = {};

                    function FlattendGroupDataByUser(userID) {

                        self = this;

                        self.data = {
                            get flattenedsubGroupsByuser() {
                                return flattenedsubGroupsByuser
                            }
                        };
                        pending = true;
                        self.refs = {
                            flattendGroup: ''
                        };

                        self.init(userID);

                    };

                    function setData(data, containerRef) {
                        var temp2;
                        //self.counter.outer = Object.keys(data).length
                        self.counter.loopDepth = Object.keys(data).length;
                        angular.forEach(data, function(el, i, a, b) {

                            var temp2 = i

                            self.counter.loopDepth--
                                self.counter.total += Object.keys(el).length

                            angular.forEach(el, function(el2, i2) {
                                var names = temp2.split('_')
                                var tempUserRef = firebaseService.getRefMain().child('users').child(i2)
                                var $tempUserRef = $firebaseObject(tempUserRef).$loaded()
                                var tempUserCheckinStatus = firebaseService.getRefMain().child('subgroup-check-in-current').child(names[0]).child(names[1]).child(i2);
                                var $tempUserCheckinStatus = $firebaseObject(tempUserCheckinStatus).$loaded();
                                $q.all([$tempUserRef, $tempUserCheckinStatus]).then(function(arr) {
                                    var _el2 = el2;
                                    var _temp2 = temp2;
                                    var _i2 = i2;
                                    //userCash[_i2] = _el2;
                                    angular.extend(_el2, arr[0], arr[1]);
                                    containerRef[_temp2 + '_' + _i2] = _el2;
                                    containerRef[_temp2 + '_' + _i2].show = true

                                    containerRef[_temp2 + '_' + _i2].groupID = names[0]
                                    containerRef[_temp2 + '_' + _i2].subgroupID = names[1]
                                    window.temp[_temp2 + '_' + _i2] = _el2

                                    self.counter.count++;
                                    if (self.counter.count == self.counter.total && !self.counter.loopDepth) {
                                        $loadedDefer.resolve(self.data.flattenedsubGroupsByuser);
                                        self.counter.count = 0;
                                        self.counter.total = 0;
                                    }
                                    tempUserRef.on('child_changed', function(snapshotChanged) {
                                        containerRef[_temp2 + '_' + _i2][snapshotChanged.key()] = snapshotChanged.val();
                                        window.temp[_temp2 + '_' + _i2][snapshotChanged.key()] = snapshotChanged.val();
                                    })
                                    tempUserCheckinStatus.on('child_changed', function(snapshotChangedstatus) {
                                        containerRef[_temp2 + '_' + _i2][snapshotChangedstatus.key()] = snapshotChangedstatus.val();
                                        window.temp[_temp2 + '_' + _i2][snapshotChangedstatus.key()] = snapshotChangedstatus.val();

                                    })
                                })

                            })
                        })

                    }

                    FlattendGroupDataByUser.prototype = {

                        'init': function(userID) {
                            flattenedsubGroupsByuser = {};
                            self.counter = {
                                total: 0,
                                loopDepth: 0,
                                count: 0
                            };

                            self.refs.flattendGroup = firebaseService.getRefFlattendGroups().child(userID)
                            self.refs.flattendGroup.once('value', self.flattendGroupHandler)

                        },
                        'flattendGroupHandler': function(snapshot) {
                            // //debugger;
                            //
                            //
                            // if (snapshot.val() && Object.keys(snapshot.val()).length) {
                            //     self.data.groupSubgroupData = snapshot.val()
                            //     setData(snapshot.val(), flattenedsubGroupsByuser);
                            // } else {
                            //     // console.log('no data')
                            // }


                        },

                        $loaded: function() {
                            $loadedDefer = $q.defer()

                            return $loadedDefer.promise;
                        }
                    }
                    return FlattendGroupDataByUser;

                })()



                return {
                    InitFlatData: FlattendGroupDataByUser,

                    'openCreateGroupPage': function() {

                        $location.path('/user/' + userService.getCurrentUser().userID + '/create-group');


                    },
                    'openJoinGroupPage': function() {
                        // $location.path('/user/joingroup')
                        $location.path('/user/' + userService.getCurrentUser().userID + '/join-group');
                        //$state.go('user.join-group');

                    }

                }

            }
        ])


})();

/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.activity', ['core']).controller('ActivityController', ['groupService', 'dataService', 'userService', '$stateParams', ActivityController]);

    function ActivityController(groupService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        }
        function init(){
            groupService.setActivePanel('activity');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.users = dataService.getUserData();         //load users
        }
        init();

    } // ActivityController
})();

/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.report', ['core']).controller('ReportController', ['firebaseService', 'groupService', 'dataService', 'userService', '$stateParams', ReportController]);

    function ReportController(firebaseService, groupService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        };
        this.showReportData = function (user) {
            this.report = [];
            that.showParams = false;
            this.count = -1;
            that.reportParam = {
                fullName: user.fullName,
                groupsubgroupTitle: user.groupsubgroupTitle,
            };
            firebaseService.getRefsubgroupCheckinRecords().child(user.groupID).child(user.subgroupID).child(user.id).on('child_added', function(snapshot){
                var fullDate = new Date(snapshot.val().timestamp);
                var newDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                if (snapshot.val().message == 'Checked-in') {
                    that.report.push({
                        checkin: snapshot.val().timestamp,
                        checkindate: newDate,
                        checkout: 0
                    });
                    that.count++;
                } else if (snapshot.val().message == 'Checked-out') {
                    that.report[that.count].checkout = snapshot.val().timestamp;
                    that.report[that.count].checkoutdate = newDate;
                }
            });
        };
        function init(){
            groupService.setActivePanel('report');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.showParams = true;
            that.report = [];
            that.reportParam = {};
            that.users = dataService.getUserData();         //load users
        }
        init();

    } //ReportController
})();

/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.chat', ['core']).controller('ChatController', ['messageService', 'groupService', 'chatService', 'userService', '$mdBottomSheet', '$mdDialog', '$stateParams', '$state', '$sanitize', ChatController]);

    function ChatController(messageService, groupService, chatService, userService, $mdBottomSheet, $mdDialog, $stateParams, $state, $sanitize) {
        var that = this;
        var user = userService.getCurrentUser();
        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        }
        this.showNewChannel = function(ev) {
            if (that.subgroupID) {
                $state.go('user.create-teams-channels', {groupID: that.groupID, teamID: that.subgroupID});
            } else {
                $state.go('user.create-channels', {groupID: that.groupID});
            }
        };
        this.gotoChannel = function(channel){
            if (that.subgroupID) {
                $state.go('user.group.subgroup-chat', {channelID : channel.$id, channelTitle: channel.title});
            } else {
                $state.go('user.group.chat', {channelID : channel.$id, channelTitle: channel.title});
            }
        };
        this.viewChannelMessages = function(channelID) {
            if (that.subgroupID) {
                that.messagesArray = chatService.getTeamChannelMessagesArray(that.groupID, that.subgroupID, channelID);
            } else {
                that.messagesArray = chatService.getChannelMessagesArray(that.groupID, channelID);
            }
        };
        this.ScrollToMessage = function() {
            var element = document.getElementById('messagebox');
            element.scrollTop = element.scrollHeight - element.clientHeight;
        };
        this.sendMsgUpKey = function (event) {
            if (event.keyCode == 13 && !event.shiftKey) {
                if (that.activeChannelID && that.text) {
                    that.SendMsg();
                    event.preventDefault();
                }
            }
        };
        this.SendMsg = function() {
            if (that.subgroupID) {
                chatService.TeamSendMessages(that.groupID, that.subgroupID, that.activeChannelID, user, that.text).then(function() {
                    that.text.msg = "";
                    that.ScrollToMessage();
                }, function(reason) {
                    messageService.showFailure(reason);
                });
            } else {
                chatService.SendMessages(that.groupID, that.activeChannelID, user, that.text).then(function() {
                    that.text.msg = "";
                    that.ScrollToMessage();
                }, function(reason) {
                    messageService.showFailure(reason);
                });
            }

        };
        this.filterchatters = function(chatterID) {
            var sender = false;
            if (chatterID === user.userID) {
                sender = true;
            }
            return sender;
        };
        this.getUserProfile = function(userID) {
            var profileObj;
            if (that.profilesCacheObj[userID]) {
                profileObj = that.profilesCacheObj[userID];
            } else {
                profileObj = that.profilesCacheObj[userID] = chatService.getUserEmails(userID);
            }
            return profileObj;
        };
        this.showChannelBottomSheet = function(){
            that.channelBottomSheet = true;
        };
        this.createChannel = function () {
            if (that.subgroupID) {
                chatService.checkSubGroupChannelExists(that.groupID, that.subgroupID, that.channelTitle).then(function(exists){
                    if(exists){
                        onSuccessErrorChannelCreation('Channel already exists with the Name: ' + that.channelTitle);
                    } else {
                        chatService.createSubGroupChannel(that.groupID, that.subgroupID, that.channelTitle, user.userID, onSuccessErrorChannelCreation);
                    }
                });
            } else {
                chatService.checkGroupChannelExists(that.groupID, that.channelTitle).then(function(exists){
                    if(exists){
                        onSuccessErrorChannelCreation('Channel already exists with the Name: ' + that.channelTitle);
                    } else {
                        chatService.createGroupChannel(that.groupID, that.channelTitle, user.userID, onSuccessErrorChannelCreation);
                    }
                });
            }
        };
        function onSuccessErrorChannelCreation(err, channelID, channelTitle){
            if (that.messagesArray.length == 0) {
                var channel = {
                    $id: channelID,
                    title: channelTitle
                };
                that.gotoChannel(channel);
            }
            if (err) {
                messageService.showFailure(err);
            } else {
                messageService.showSuccess('Channel created Successfullly!');
            }
            that.channelTitle = null;
            that.channelBottomSheet = false;
        }
        function init(){
            groupService.setActivePanel('chat');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.activeTitle = 'Select Channel to Start Chat';
            that.activeChannelID = null;
            that.activeTeamChannelID = null;
            that.messagesArray = [];
            that.profilesCacheObj = {};
            that.text = { msg: "" };
            that.channelBottomSheet = false;
            that.channelTitle = null;
            that.activeChannelID = $stateParams.channelID;
            that.activeTitle = $stateParams.channelTitle;
            if (that.activeChannelID) {
                that.viewChannelMessages(that.activeChannelID);
            }
            that.ScrollToMessage();
            if (that.subgroupID) {
                chatService.getSubGroupChannel(that.groupID, that.subgroupID).$loaded().then(function(snapshot){
                    that.channels = snapshot;
                    if(!that.activeChannelID && that.channels.length > 0) {
                        that.gotoChannel(that.channels[0]); 
                    }
                });
            } else {
                chatService.getGroupChannel(that.groupID).$loaded().then(function(snapshot){
                    that.channels = snapshot;
                    if(!that.activeChannelID && that.channels.length > 0) {
                        that.gotoChannel(that.channels[0]); 
                    }
                });
            }
        }
        init();

    } // ChatController
})();


/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.manualattendace', ['core']).controller('ManualAttendaceController', ['groupService', 'checkinService', '$firebaseArray', 'messageService', 'dataService', 'userService', '$stateParams', ManualAttendaceController]);

    function ManualAttendaceController(groupService, checkinService, $firebaseArray, messageService, dataService, userService, $stateParams) {
        var that = this;
        var userCurrentCheckinRefBySubgroup;
        var user = userService.getCurrentUser();

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        }
        this.checkInMembershipNo = function(ev, user) {
            var keyCode = ev.which || ev.keyCode;
            console.log(keyCode)
            if (keyCode === 13) {
                if (user.length === 1) {
                    that.CheckInuser(user[0].groupID, user[0].subgroupID, user[0].id, user[0].type);
                } else {
                    messageService.fastFailure('User not found!');
                }
            }
        }
        this.CheckInuser = function(grId, sgrId, userID, type) {
            // Do not change status of self login user
            if (user.userID === userID) {
                messageService.showFailure('To change your status, please use toolbar!');
                dataService.setUserCheckInOut(grId, sgrId, userID, type)
                return;
            }
            that.processTeamAttendance = true;

            // check if user is already checked in
            $firebaseArray(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(userdata) {
                // console.log(userdata);
                // console.log(userdata[5]);
                // console.log(type)
                if (!type) {
                    // console.log(userdata)
                    if (userdata[5] && userdata[5].$value === 1) {
                        messageService.showFailure('User already checked in at : ' + userdata[0].$value + '/' + userdata[3].$value);
                        that.processTeamAttendance = false;
                        dataService.setUserCheckInOut(grId, sgrId, userID, true)
                        return;
                    }
                }
                // console.log('Note (on switch off condition), Checkin: ', !type, 'Checkout: ', type);
                // check in the user
                var groupObj = {groupId: grId, subgroupId: sgrId, userId: userID};
                checkinService.ChekinUpdateSatatus(groupObj, userID, type, function(result, msg){   //type is checkoutflag
                    if(result){
                        messageService.showSuccess(msg);
                    } else {
                        messageService.showFailure(msg)
                        dataService.setUserCheckInOut(grId, sgrId, userID, false)
                    }
                    that.processTeamAttendance = false;
                });
            });
        }
        function init(){
            groupService.setActivePanel('manualattendace');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.processTeamAttendance = false;
            that.checkinObj = {
                newStatus: {}
            };
            that.users = dataService.getUserData();         //load users
        }
        init();

    } // ActivityController
})();

/**
 * Created on 2/2/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport', ['core'])
		.factory('ProgressReportService', ['$q', 'activityStreamService', 'firebaseService', ProgressReportService]);
    function ProgressReportService($q, activityStreamService, firebaseService) {

		var dailyProgressReport = [];

        //crearting progress Report

        function createProgressReport(obj, Policy, checkoutFlag) {     //obj = {groupId: '', subgroupId: '',userId; '' }
            var deferred = $q.defer();
            //checking daily progress report is exists or not -- START --
            firebaseService.getRefMain().child('subgroup-progress-reports').child(obj.groupId).child(obj.subgroupId).child(obj.userId)
                .orderByChild('date').startAt(new Date().setHours(0, 0, 0, 0)).endAt(new Date().setHours(23, 59, 59, 0)).once('value', function(snapshot) {

                    if (snapshot.val() === null) { //if null then create daily report dummy
                        //cerating Dummy Report Object on Checkin....
                        var progressRprtObj = firebaseService.getRefMain().child('subgroup-progress-reports').child(obj.groupId)
                            .child(obj.subgroupId).child(obj.userId).push({
                                date: Firebase.ServerValue.TIMESTAMP,
                                //date: new Date().setHours(0,0,0,0),
                                questionID: Policy.latestProgressReportQuestionID,
                                policyID: Policy.policyID,
                                answers: ''
                        });

                        //for progress activity stream record -- START --
                        var type = 'progressReport';
                        var targetinfo = {id: progressRprtObj.key(), url: obj.groupId+'/'+obj.subgroupId, title: obj.groupId+'/'+obj.subgroupId, type: 'progressReport' };
                        var area = {type: 'progressReport-created'};
                        var group_id = obj.groupId+'/'+obj.subgroupId;
                        var memberuserID = obj.userId;
                        var _object = null;
                        //for group activity record
                        activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, _object);
                        //for progress activity stream record -- END --

                        deferred.resolve({ 'result': false, 'message': 'notSubmitted' });

                    } else {
                        for(var object in snapshot.val()) {
                            //console.log(snapshot.val()[obj])
                            if(snapshot.val()[object].answers === "" && checkoutFlag === true) {  //now checking if answers has given or not on checkout
                                //if not submited report then show msg
                                deferred.resolve({ 'result': false, 'message': 'notSubmitted' });
                            } else {
                                //if submited report then nuthing
                                deferred.resolve({ 'result': true, 'message': null });
                            }
                        }
                    }

                });

            return deferred.promise;
        } //createProgressReport

		//getting daily progress report
		function getReports(userArray, groupID, subgroupID) {
			if (subgroupID) {
				userArray.forEach(function(val, indx) {
					if (val.groupID == groupID && val.subgroupID == subgroupID) {
						getSubGroupReportFromFirebase(val, groupID, subgroupID, 1);
					}
				});
			} else {
				userArray.forEach(function(val, indx) {
					if (val.groupID == groupID) {
						getGroupReportFromFirebase(val, groupID, 1);
					}
				});
			}
		} //getReports
		function getReportQuestion(groupID, subgroupID, questionID, ObjectIndex) {
			firebaseService.getRefSubgroupPolicies().child(groupID).child(subgroupID).once('value', function(policyObj) {
				if (policyObj.val() && policyObj.val().hasPolicy === true) {
					firebaseService.getRefPolicies().child(groupID).child(policyObj.val().policyID).child('progressReportQuestions').child(questionID)
						.once('value', function(snapshot) {
							if (snapshot.val()) {
								//console.log('questions', snapshot.val().questions, snapshot.key(), snapshot.val().questions);
								//adding questions into dailyProgressReport object of user report
								dailyProgressReport.forEach(function(val, index) {
									if (val.reportID == ObjectIndex) {
										dailyProgressReport[index].questions = snapshot.val().questions;
									}
								});
							}
						});
				}
			});
		}//getReportQuestion
		function getSubGroupReportFromFirebase(user, groupID, subgroupID, limit) {
			firebaseService.getRefProgressReport().child(groupID).child(subgroupID).child(user.id).orderByChild("date").limitToLast(limit)
				.on("value", function(snapshot) {
					var _flag = false;
					// console.log('key', snapshot.key());
					// console.log('val', snapshot.val());

					if (dailyProgressReport.length > 0) {
						dailyProgressReport.forEach(function(val, index) {
							if (snapshot.val()) {
								for (var key in snapshot.val()) {
									// console.log(val.reportID, key)
									if (val.reportID === key) {
										//getReportQuestion(groupID, subgroupID, dailyProgressReport[index]['questionID'], null);
										dailyProgressReport[index]['answers'] = snapshot.val()[key]['answers'];
										_flag = true;
										break;
									}
								}
							}

							if (_flag) {
								return;
							}

							if (dailyProgressReport.length == index + 1) {
								if (snapshot.val()) {
									var obj = {};
									for (var key in snapshot.val()) {
										obj = snapshot.val()[key];
										obj['reportID'] = key;
										obj['userID'] = user.id;
										obj['fullName'] = user.fullName || '';
										obj['profileImage'] = user.profileImage || '';
										obj['groupID'] = user.groupID;
										obj['subgroupID'] = user.subgroupID;
										dailyProgressReport.push(obj);
										getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);
									}
								}
							}
						});
					} else {
						if (snapshot.val()) {
							var obj = {};
							for (var key in snapshot.val()) {
								// console.log('subkey', key)
								obj = snapshot.val()[key];
								obj['reportID'] = key;
								obj['userID'] = user.id;
								obj['fullName'] = user.fullName;
								obj['profileImage'] = user.profileImage;
								obj['groupID'] = user.groupID;
								obj['subgroupID'] = user.subgroupID;
								dailyProgressReport.push(obj);
								getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);
							}
						}
					}
				});
		} //getFromFirebase
		function getSubGroupDailyProgressReport(userArray, groupID, subgroupID) {
			dailyProgressReport = [];
			getReports(userArray, groupID, subgroupID);
			return dailyProgressReport;
		} //getDailyProgressReport
		function updateReport(report, cb) {
			//console.log('report', report)
			firebaseService.getRefProgressReport().child(report.groupID).child(report.subgroupID).child(report.userID).child(report.reportID).update({ 'answers': report.answers }, function(err) {
				if (err) {
					// console.log('err', err)
					cb(false);
				} else {

                    //for group activity stream record -- START --
                    var type = 'progressReport';
                    var targetinfo = { id: report.reportID, url: report.groupID + '/' + report.subgroupID, title: report.groupID + '/' + report.subgroupID, type: 'progressReport' };
                    var area = { type: 'progressReport-updated' };
                    var group_id = report.groupID + '/' + report.subgroupID;
                    var memberuserID = report.userID;
                    var _object = null;
                    //for group activity record
                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, _object);
                    //for group activity stream record -- END --

                    cb(true);
                }
			});
		} //updateReport
		function getGroupReports(userArray, groupID) {
			userArray.forEach(function(val, indx) {
				if (val.groupID == groupID) {
					getGroupReportFromFirebase(val, groupID, 1);
				}
			});
		}
		function getGroupReportByDateFromFirebase(user, groupID, subgroupID, startDate, endDate) {

			firebaseService.getRefProgressReport().child(groupID).child(subgroupID).child(user.id).orderByChild("date").startAt(startDate.setHours(0, 0, 0, 0)).endAt(endDate.setHours(23, 59, 59, 0))
				.on("value", function(snapshot) {
					if (snapshot.val()) {

						var _flag = false;
						// console.log('key', snapshot.key());
						// console.log('val', snapshot.val());

						if (dailyProgressReport.length > 0) {
							dailyProgressReport.forEach(function(val, index) {
								if (snapshot.val()) {
									for (var key in snapshot.val()) {
										// console.log(val.reportID, key)
										if (val.reportID === key) {
											//getReportQuestion(groupID, subgroupID, dailyProgressReport[index]['questionID'], null);
											dailyProgressReport[index]['answers'] = snapshot.val()[key]['answers'];
											_flag = true;
											break;
										}
									}
								}

								if (_flag) {
									return;
								}

								if (dailyProgressReport.length == index + 1) {
									if (snapshot.val()) {
										var obj = {};
										for (var key in snapshot.val()) {
											obj = snapshot.val()[key];
											obj['reportID'] = key;
											obj['userID'] = user.id;
											obj['fullName'] = user.fullName;
											obj['profileImage'] = user.profileImage;
											obj['groupID'] = user.groupID;
											obj['subgroupID'] = user.subgroupID;
											dailyProgressReport.push(obj);
											getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);
										}
									}
								}
							});
						} else {
							if (snapshot.val()) {
								var obj = {};
								for (var key in snapshot.val()) {
									obj = snapshot.val()[key];
									obj['reportID'] = key;
									obj['userID'] = user.id;
									obj['fullName'] = user.fullName;
									obj['profileImage'] = user.profileImage;
									obj['groupID'] = user.groupID;
									obj['subgroupID'] = user.subgroupID;
									dailyProgressReport.push(obj);
									getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);
								}
							}
						}
					}
				});
		}

		function getGroupReportFromFirebase(user, groupID, limit) {
            firebaseService.getRefDailyProgressReport().child(user.id).child(groupID).orderByChild("date").limitToLast(limit)
				.on("value", function(snapshot) {
					var _flag = false;

					if (dailyProgressReport.length > 0) {

						dailyProgressReport.forEach(function(val, index) {
							if (snapshot.val()) {
								for (var k in snapshot.val()) {
									for (var key in snapshot.val()[k]) {
										// console.log('Obj', snapshot.val()[k][key], key);
										if (val.reportID == key) {
											dailyProgressReport[index]['answers'] = snapshot.val()[k][key]['answers'];
											_flag = true;
											break;
										}
									}

								}
							}

							if (_flag) {
								return
							}

							if (dailyProgressReport.length == index + 1) {
								if (snapshot.val()) {
									var obj = {};
									for (var k in snapshot.val()) {
										for (var key in snapshot.val()[k]) {
											obj = snapshot.val()[k][key];
											obj['reportID'] = key;
											obj['userID'] = user.id;
											obj['fullName'] = user.fullName;
											obj['profileImage'] = user.profileImage;
											obj['groupID'] = user.groupID;
											obj['subgroupID'] = k;
											dailyProgressReport.push(obj);
											getReportQuestion(user.groupID, k, snapshot.val()[k][key]['questionID'], key);
										}
									}
								}
							}
						});
					} else {
						if (snapshot.val()) {
							var obj = {};
							for (var k in snapshot.val()) {
								for (var key in snapshot.val()[k]) {
									obj = snapshot.val()[k][key];
									obj['reportID'] = key;
									obj['userID'] = user.id;
									obj['fullName'] = user.fullName;
									obj['profileImage'] = user.profileImage;
									obj['groupID'] = user.groupID;
									obj['subgroupID'] = k;
									dailyProgressReport.push(obj);
									getReportQuestion(user.groupID, k, snapshot.val()[k][key]['questionID'], key);
								}
							}
						}
					}
				});
		}
		function getGroupDailyProgressReport(userArray, groupID) {
			dailyProgressReport = [];
			getReports(userArray, groupID);
			return dailyProgressReport;
		} //getDailyProgressReport

		function getSingleSubGroupReport(user, groupID, subgroupID) {
			dailyProgressReport = [];
			getSubGroupReportFromFirebase(user, groupID, subgroupID, 1);
			return dailyProgressReport;

		} //getSingleSubGroupReport

		function getGroupReportByDates(userArray, groupID, startDate, endDate) {
			//console.log(userArray);
			dailyProgressReport = [];
			userArray.forEach(function(val, indx) {
				//	console.log(val)
				if (val.groupID == groupID) {
					getGroupReportByDateFromFirebase(val, groupID, val.subgroupID, startDate, endDate);
				}
			});
			return dailyProgressReport;
		}
        return {
			getSubGroupDailyProgressReport: getSubGroupDailyProgressReport,
			updateReport: updateReport,
			getGroupDailyProgressReport: getGroupDailyProgressReport,
			getSingleSubGroupReport: getSingleSubGroupReport,
            getGroupReportByDates: getGroupReportByDates,
            createProgressReport: createProgressReport
        }
    }; //ProgressReportService
})();

/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport').controller('ProgressReportController', ['firebaseService', '$state', 'messageService', '$timeout', 'groupService', 'ProgressReportService', 'dataService', 'userService', '$stateParams', ProgressReportController]);

    function ProgressReportController(firebaseService, $state, messageService, $timeout, groupService, ProgressReportService, dataService, userService, $stateParams) {
        var that = this;
        this.loadingData = false;
        this.showParam = false;
        this.setFocus = function(startDate , endDate) {
            that.showParam = !that.showParam
            that.loadingData = true;
             if(startDate && endDate) {
                 $timeout(function() {
                     that.dailyProgressReport = ProgressReportService.getGroupReportByDates(that.users, that.groupID, that.startDate ,that.endDate);
                     // that.showReportData();
                     that.loadingData = false;
                 	// console.log(that.startDate.setHours(0,0,0,0) , that.endDate.setHours(23,59,59,0));
                 }, 2000);
             }else{
                 //document.getElementById("UserSearch").focus();
                 that.loadingData = false;
             }

        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return '';
            }
        };
        this.returnGroupTitle = function(groupID) {
            firebaseService.getRefGroupsNames().child(groupID).child('title').once('value', function(snapshot) {
                that.grouptitle = snapshot.val();
            });
        };
        this.returnSubGroupTitle = function(groupID, subgroupID) {
            if (subgroupID) {
                firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).child('title').once('value', function(snapshot) {
                    that.subgrouptitle = snapshot.val();
                });
            } else {
                that.subgrouptitle = '';
            }
        };
        this.updatecheckinhours = function(value) {
            that.checkinHours = value;
        };
        this.update = function(report) {
            // console.log(report);
            ProgressReportService.updateReport(report, function(result) {
                if (result) {
                    messageService.showSuccess('Update Successfully!');
                    $state.go('user.group.subgroup-progressreport', {groupID: that.groupID, subgroupID: that.subgroupID, u: ''});
                } else {
                    messageService.showFailure('Update Failure!');
                }
            });
        };
        this.everyone = function(){
            that.activeUser = '';
        };
        this.showReportData = function () {
            that.attendancereport = [];
            that.count = -1;
            that.checkinHours = 0;
            // that.reportParam = {
            //     fullName: user.fullName,
            //     groupsubgroupTitle: user.groupsubgroupTitle,
            // };
            firebaseService.getRefsubgroupCheckinRecords()
                .child(that.groupID)
                .child(that.subgroupID)
                .child(that.activeUser)
                .orderByChild('timestamp')
                .startAt(new Date().setHours(0,0,0,0))
                .endAt(new Date().setHours(23,59,59,0))
                .on('child_added', function(snapshot){
                    var fullDate = new Date(snapshot.val().timestamp);
                    var newDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                    if (snapshot.val().message == 'Checked-in') {
                        that.attendancereport.push({
                            checkin: snapshot.val().timestamp,
                            checkindate: newDate,
                            location: snapshot.val()['identified-location-id'],
                            checkout: ''
                        });
                        that.count++;
                    } else if (snapshot.val().message == 'Checked-out') {
                        that.attendancereport[that.count].checkout = snapshot.val().timestamp;
                        that.attendancereport[that.count].checkoutdate = newDate;
                        that.attendancereport[that.count].checkoutlocation = snapshot.val()['identified-location-id'];
                    }
            });
        }
        function init() {
            groupService.setActivePanel('progressreport');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID || '';
            that.returnGroupTitle(that.groupID);
            that.returnSubGroupTitle(that.groupID, that.subgroupID);
            that.user = userService.getCurrentUser();
            that.users = dataService.getUserData();
            //that.activeUser = ($stateParams.u) ? that.user.userID : '';
            that.activeUser = that.user.userID;
            that.activeTitle = "Progress Report";

            if ($stateParams.u) {
                $timeout(function() {
                    that.users.forEach(function(val, index){
                        if(val.id === that.user.userID && val.groupID == that.groupID &&  val.subgroupID == that.subgroupID){
                            that.dailyProgressReport = ProgressReportService.getSingleSubGroupReport(val, that.groupID, that.subgroupID);
                        }
                    });
                }, 2000);
            } else {
                if ($stateParams.subgroupID) {
                    //sub group report
                    $timeout(function() {
                        that.dailyProgressReport = ProgressReportService.getSubGroupDailyProgressReport(that.users, that.groupID, that.subgroupID);
                        that.showReportData();
                         // $timeout(function() {
                         //     console.log('xxxx',that.dailyProgressReport);
                         // }, 5000);
                    }, 2000);
                } else {
                    that.dailyProgressReport = true;
                    //group report
                    // $timeout(function() {
                    //     that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);
                    //     that.activeUser = '';
                    // }, 2000);
                }

            }



        }
        init();

    } // ProgressReportController
})();

/**
 * Created on 2/2/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator', ['core'])
    .factory('CollaboratorService', ['$q', '$firebaseArray','$rootScope','firebaseService', CollaboratorService]);

  function CollaboratorService($q, $firebaseArray, $rootScope,firebaseService) {
    var currentGroup,currentSubGroup,subGroupUsers = [];
    var currentDocumentId ="";
    var firepadRef = firebaseService.getRefMain(), pushDocumentNode, firebaseDocumentId, filteredUsers = [];
    return {
      getCurrentDocumentId :getCurrentDocumentId,
      setCurrentDocumentId:setCurrentDocumentId,
      CreateDocument: CreateDocument,
      addAccessUser: addAccessUser,
      setCurrentTeam : setCurrentTeam,
      getinitGroupDocument : getinitGroupDocument,
      getinitSubGroupDocument: getinitSubGroupDocument,
      getGroupMembers:getGroupMembers,
      getSubGroupUsers:getSubGroupUsers
    }


    function getSubGroupUsers(users,subgroupID){
      users.forEach(function(user){
        if(user.subgroupID == subgroupID)
          subGroupUsers.push(user);
      })
      return subGroupUsers;
    }

    function getCurrentDocumentId() {
      return currentDocumentId;
    }

    function setCurrentDocumentId(documentId){
      currentDocumentId = documentId;
    }
    function setCurrentTeam(id,type) {
      if(type == "Group"){
        currentGroup = id;
      }
      else {
        currentSubGroup = id;
      }
    }

    var abc = '';

    function getinitGroupDocument(groupID, cb) {
      var val = "";
    //   firepadRef = new Firebase(ref)
      firepadRef.child("firepad-groups/"+groupID).limitToFirst(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }

    function getGroupMembers(groupID,subgroupID) {
      if(subgroupID){
        // firepadRef = new Firebase(ref).child("group-members/"+subgroupID+"/"+groupID);
        $firebaseArray(firepadRef.child("group-members/"+subgroupID+"/"+groupID)).$loaded().then(function(x){
           return x;
        });
      }
      else {
        // firepadRef = new Firebase(ref).child("group-members/"+groupID);
        $firebaseArray(firepadRef.child("group-members/"+groupID)).$loaded().then(function(x){
           return x;
         });
      }
    }


    function getinitSubGroupDocument(groupID,subgroupID,cb){
      var val = "";
    //   firepadRef = new Firebase(ref).child("firepad-subgroups/"+groupID+'/'+subgroupID);
      firepadRef.child("firepad-subgroups/"+groupID+'/'+subgroupID).limitToFirst(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }



    function addAccessUser(documentId, groupID, subgroupID, userID,access) {
    //   var firebaseLocalRef;
    //   firepadRef = new Firebase(ref);
      var updateDocument = {};
      if (subgroupID) {
        // firebaseLocalRef = new Firebase(ref).child('firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId);
          updateDocument['firepad-subgroups-rules/' + groupID + '/' + subgroupID + '/' + documentId + '/allUsers'] = true;
          updateDocument['firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId + '/' + userID] = access;
      }
      else {
        // firebaseLocalRef = new Firebase(ref).child('firepad-groups-access/' + groupID + '/' + documentId);
          updateDocument['firepad-groups-rules/' + groupID + '/' + documentId + '/allUsers'] = true;
          updateDocument['firepad-groups-access/' + groupID +  '/' + documentId + '/' + userID] = access;
      }
      firepadRef.update(updateDocument, function(error) {
        if (error) {
        }
      });
    }

    function CreateDocument(documentTitle, groupID, subgroupID,documentType,user) {
      var deferred = $q.defer();
      var firebaseObj = {};
      var firebaseLocalRef = firepadRef,pushDocumentNode,firebaseDocumentId;
      var updateDocument = {},
      createdBy = {
        firstName:user.firstName,
        userID:user.userID,
        lastName:user.lastName,
        imgUrl:$rootScope.userImg || ""

      };
        firebaseObj = {
          title: documentTitle,
          type: documentType,
          createdBy: createdBy,
          timestamp: Date.now()
      }
      if (subgroupID) {
        // firebaseLocalRef = new Firebase(ref);
        // firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID).push();
        firebaseDocumentId = pushDocumentNode.key();
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId] = firebaseObj;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId] = firebaseObj;
        updateDocument['firepad-subgroups-access/' + groupID + "/" + subgroupID + '/' + firebaseDocumentId + '/' + user.userID] = 1;
        updateDocument['firepad-subgroups-rules/' + groupID + "/" + subgroupID + '/' + firebaseDocumentId + '/allUsers'] = true;

      } else {
        // firebaseLocalRef = new Firebase(ref);
        // firepadRef = firebaseLocalRef.child("firepad-groups/" + groupID);
         pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + groupID).push();
        firebaseDocumentId = pushDocumentNode.key();
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId ] = firebaseObj;
        updateDocument["firepad-groups-documents/" + groupID + "/" + firebaseDocumentId ] = firebaseObj;
        updateDocument['firepad-groups-access/' + groupID + "/" + firebaseDocumentId + '/' + user.userID] = 1;
        updateDocument['firepad-groups-rules/' + groupID + "/" + firebaseDocumentId + '/allUsers'] = true;

      }
      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          deferred.reject(error);
        }
        else {
          deferred.resolve({status:"Updated Successfully",docId:firebaseDocumentId});
        }
      });
      return deferred.promise;
    }
  };
})();

/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  function findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i][attr] === value) {
            return i;
          }
        }
        return -1;
      }
  angular.module('app.collaborator')
    // .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .filter('collaboratorUsers', function() {
      return function(users, groupID) {
        var filteredUsers = [];
        users.forEach(function(user) {
          if (user.groupID == groupID) {
            var userNew = findWithAttr(filteredUsers, 'fullName', user.fullName) == -1;
            if (userNew) {
              filteredUsers.push(user);
            }
          }
        });
        return filteredUsers;
      };


    })


    .controller('CollaboratorController', ['firebaseService', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope', '$state', '$firebaseObject', '$rootScope', 'CollaboratorService', '$q','$document', collaboratorFunction]);


  function collaboratorFunction(firebaseService, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope, $state, $firebaseObject, $rootScope, CollaboratorService, $q,$document) {

    var globalRef = firebaseService.getRefMain();

    // componentHandler.upgradeAllRegistered();
    var firepadRef;
    var that = this;

    that.documentTypes = [{
      displayName: "Rich Text",
      codeMirrorName: "Rich Text"
    }, {
      displayName: "JavaScript",
      codeMirrorName: "text/javascript"
    }, {
      displayName: "Swift",
      codeMirrorName: "text/x-swift"
    }, {
      displayName: "Java",
      codeMirrorName: "text/x-java"
    }, {
      displayName: "C#",
      codeMirrorName: "text/x-csharp"
    }, ];
    that.documentType = "Rich Text";
    that.isNormal = true;
    that.mode = "Rich Text";
    var pushDocumentNode, firebaseDocumentId, firepad;
    that.ready = true;
    that.clicked = false;
    that.channelBottomSheet = false;
    that.default = true;
    that.document = "Create/Open Document";
    that.showLoader = false;
    that.admins = [];
    that.permissionObj = {};
    that.permissionMembers = {};
    that.allUsers;
    var editorExists = false;
    that.Editors = []

    init();
    $firebaseArray(firebaseService.getRefGroupMembers().child(that.groupID)).$loaded().then(function(data) {
      data.forEach(function(member) {
        if (member["membership-type"] == 1 || member["membership-type"] == 2) {
          that.admins.push(member);
          that.permissionMembers[member.$id] = true;
        }
      });
    });

    if (!that.subgroupID) {

      firebaseService.getRefUserGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(groups) {
        if (groups.val() && groups.val()['membership-type'] == 1) {
          that.isOwner = true;
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = "Group"
        } else if (groups.val() && groups.val()['membership-type'] == 2) {
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = "Group"
        } else if (groups.val() && groups.val()['membership-type'] == 3) {
          that.isMember = true;
        }
      });


    } else {
      firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(that.subgroupID).once('value', function(subgroups) {
        if (subgroups.val()['membership-type'] == 1) {
          that.isOwner = true;
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = that.adminOf || 'Subgroup';
        } else if (subgroups.val()['membership-type'] == 2) {
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = that.adminOf || 'Subgroup';
        } else if (subgroups.val()['membership-type'] == 3) {
          that.isMember = true;
        }
      });
    }

    function clearDiv() {
      var div = document.getElementById("firepad");
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
    }

    that.gotoDocument = function(openDoc) {
    //   firepadRef = new Firebase(ref);
      if (that.subgroupID) {
        $state.go("user.group.subgroup-collaborator", {
          groupID: that.groupID,
          subgroupID: that.subgroupID,
          docID: openDoc.$id
        });
        // that.allUsers = $firebaseObject(globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + "/allUsers")).$value;
        // console.log(globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + "/allUsers").toString());
      } else {
        $state.go("user.group.collaborator", {
          groupID: that.groupID,
          docID: openDoc.$id
        });
        // that.allUsers = $firebaseObject(globalRef.child("firepad-groups-rules/" + that.groupID + "/" + $stateParams.docID + "/allUsers"));
      }

      // that.allUsers.$loaded(function() {
      // });
    };


    function initiateFirepad(refArgument, arg) {
      var codeMirror = CodeMirror(document.getElementById('firepad'), {
        lineNumbers: that.mode == "Rich Text" ? false : true,
        mode: that.mode,
        lineWrapping: true
      });
      firepad = Firepad.fromCodeMirror(refArgument, codeMirror, {
        richTextShortcuts: that.isNormal,
        richTextToolbar: that.isNormal,
        // userId: null,
        defaultText: null
          /*'Welcome to firepad!'*/
      });
      firepad.on("ready", function() {
        that.ready = false;
        firepad.setUserId(that.user.userID);
        firepad.setUserColor("#ccccc");
        that.showLoader = false;
        if (arg) {
          that.document = $stateParams.docID;
        }
      })
    }


    that.toggleAllUser = function(val) {
    //   var firepadRef = new Firebase(ref);
      var obj;
      if (that.subgroupID) {
        obj = $firebaseObject(globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + "/allUsers"));
      } else {
        obj = $firebaseObject(globalRef.child("firepad-groups-rules/" + that.groupID + "/" + $stateParams.docID + "/allUsers"));
      }
      obj.$value = val;
      obj.$save();
    };

    that.checkboxClicked = function(userStatus, user) {
      if (userStatus) {
        user.id == that.createdBy.userID ? userStatus = 1 : userStatus = 2;
      } else {
        user.id == that.createdBy.userID ? userStatus = 1 : userStatus = null;
      }
      that.admins.forEach(function(admin) {
        if (admin.$id == user.id) {
          userStatus = 1
        }
      });
    //   firepadRef = new Firebase(ref);
      var updateDocument = {};
      if (that.subgroupID) {
        updateDocument["firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + '/' + user.id] = userStatus;
        globalRef.update(updateDocument, function(err) {
          if (err) {
          }
        })
      } else {
        updateDocument["firepad-groups-access/" + that.groupID + '/' + $stateParams.docID + '/' + user.id] = userStatus;
        globalRef.update(updateDocument, function(err) {
          if (err) {
          }
        })
      }
    };
    that.createDocument = function() {
    //   var firebaseLocalRef;
    //   var updateDocument = {};
      that.showLoader = true;
      that.createdBy = {
        firstName: that.user.firstName,
        lastName: that.user.lastName,
        userID: that.user.userID,
        imgUrl: $rootScope.userImg || ""
      };

      if (that.subgroupID) {
        CollaboratorService.CreateDocument(that.documentTitle, that.groupID, that.subgroupID, that.documentType, that.user)
          .then(function(response) {
            if (response.status) {
              $state.go("user.group.subgroup-collaborator", {
                groupID: that.groupID,
                subgroupID: that.subgroupID,
                docID: response.docId
              });
            }
          });
      } else {
        CollaboratorService.CreateDocument(that.documentTitle, that.groupID, that.subgroupID, that.documentType, that.user)
          .then(function(response) {
            if (response.status) {
              $state.go("user.group.collaborator", {
                groupID: that.groupID,
                docID: response.docId
              });
            }
          });
      }
    };

   function createClickEvent(node,type,callback){
    //    node.addEventListener(type, myFunc,true);
    //    function myFunc() {
    //        that.channelBottomSheet = false;
    //        document.body.removeEventListener('click', myFunc,true)
    //     }
    $('body').click(function(evt){
       if(evt.target.id == "channelBottomSheet")
          return;
          if(evt.target.id == "fabButton")
          return;
          if($(evt.target).closest('#fabButton').length)
          return;
       //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
       if($(evt.target).closest('#channelBottomSheet').length)
          return;
       console.log(evt.target);
        that.channelBottomSheet = false;
      //Do processing of click event here for every element except with id menu_content
    });
   }
     createClickEvent(document.body,'click');

    that.channelBottomSheetfunc = function() {
        // createClickEvent(document.body,'click');
      if (that.channelBottomSheet)
        that.channelBottomSheet = false;
      else
        that.channelBottomSheet = true;
    };
    that.export = function() {
      if (that.clicked) {
        that.clicked = false;
      } else {
        that.clicked = true;
        var content = firepad.getHtml();
        var data = new Blob([content], {
          type: 'html;charset=utf-8'
        });
        FileSaver.saveAs(data, 'data.html');
      }

    };

    that.filterTeams = function(player) {
      var teamIsNew = indexedTeams.indexOf(player.team) == -1;
      if (teamIsNew) {
        indexedTeams.push(player.team);
      }
      return teamIsNew;
    };


    function backdropPermission() {
      if (that.subgroupID) {
        globalRef.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
          that.backdrop = snapshot.exists();
          that.permissionObj[that.user.userID] = snapshot.exists();
        });
      } else {
        globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
          that.backdrop = snapshot.exists();
          that.permissionObj[that.user.userID] = snapshot.exists();
        });
      }

    }

    function init() {

      groupService.setActivePanel('collaborator');
      groupService.setSubgroupIDPanel($stateParams.subgroupID);
      that.subgroupID = $stateParams.subgroupID || '';
      that.currentDocument = $stateParams.docID;
      CollaboratorService.setCurrentDocumentId(that.currentDocument);
      that.groupID = $stateParams.groupID;
      that.user = userService.getCurrentUser();
      that.users = dataService.getUserData();
      that.activeTitle = "Collaborator";
      var localRef = globalRef;
      // that.groupMembers = CollaboratorService.getGroupMembers(that.groupID);
      if ($stateParams.docID) {
        if (that.subgroupID) {
          that.documents = $firebaseArray(globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID));
          localRef = globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID); //this will be the user created documents
          globalRef.child('firepad-subgroups-access/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).on('child_added', function(snapshot) {
            backdropPermission();
          });
          globalRef.child('firepad-subgroups-access/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).on('child_removed', function(snapshot) {
            backdropPermission();
            angular.element(document).find("firepad").blur();
          });
          globalRef.child('firepad-subgroups-rules/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).on('child_changed', function(snapshot) {
            that.backdrop = that.allUsers = snapshot.val();
            if(!that.allUsers){
              globalRef.child('firepad-subgroups-access/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).once('value', function(snapshot) {
              backdropPermission();
            });
            }
          });
        } else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
          localRef = globalRef.child("firepad-groups/" + that.groupID).child($stateParams.docID);
          globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID).on('child_added', function(snapshot) {
            backdropPermission();
          });
          globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID).on('child_removed', function(snapshot) {
            backdropPermission();
            angular.element(document).find("firepad").blur();
          });
          globalRef.child('firepad-groups-rules/' + that.groupID + '/' + $stateParams.docID).on('child_changed', function(snapshot) {
            that.backdrop = that.allUsers = snapshot.val();
            if(!that.allUsers){
                $firebaseObject(globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID)).$loaded(function(response){
                    console.log(response);
                    that.permissionObj = {};
                    response.forEach(function(element,item){
                        console.log("Element:", element + "," + item);
                        that.permissionObj[item] = true;

                    })
                })
            //   globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID).once('value', function(snapshot) {
            // //   backdropPermission();
            //     console.log(snapshot);
            // });
            }
            else {
                that.users.forEach(function(user) {
                    if (user.groupID == that.groupID) {
                        if (!that.permissionObj[user.id]) {
                            that.permissionObj[user.id] = true;
                        }
                    }
                });
            }

          });

        }
        localRef.once('value', function(snapshot) {
          that.document = snapshot.val().title;
          that.createdBy = snapshot.val().createdBy;
          that.mode = snapshot.val().type;
          that.isNormal = that.mode == "Rich Text" ? true : false;
          console.log("localRef",localRef.toString())
          initiateFirepad(localRef);
          permissions();
        });
        that.history = $firebaseArray(localRef.child("history").limitToLast(300));
      }

      localRef.child('history').on('child_added',function(snapshot){
        addEditor(snapshot.val());
      })
    }


function editTimestamp(user) {
  for (var i = 0; i < that.Editors.length; i++) {
    if(that.Editors[i].id == user.a){
      that.Editors[i].timestamp = user.t;
      // editorExists = false;
    }
  }
}
function addEditor(snapshot){
    angular.forEach(that.Editors,function(item){
      if(item.id == snapshot.a){
        editorExists = true;
        editTimestamp(snapshot);
      }
    })
  if(!editorExists){
    userService.getUserProfile(snapshot.a,function(user){
      angular.forEach(that.Editors,function(item){
        if(item.id == snapshot.a){
          editorExists = true;
          editTimestamp(snapshot);
        }
      })
      if(!editorExists){
        that.Editors.push({
          id: snapshot.a,
          timestamp: snapshot.t,
          name : user.firstName + " " + user.lastName,
          img: user['profile-image'] != undefined ? user['profile-image'] : ""
        })
      }
      })
  }
  else {
    editorExists = false;
  }
  console.log("that.Editors:", that.Editors);
}
// that.EditorDetails = function(userId) {
//    console.log(userId);
// }


    function userAccessToggles() {
         that.users.forEach(function(user) {
             if (user.groupID == that.groupID) {
                 if (!that.permissionObj[user.id]) {
                     that.permissionObj[user.id] = true;
                     }
              }
        });
    }

    function permissions() {

      var firepadRef = "";
      if (that.subgroupID) {
        firepadRef = globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID);
      } else {
        firepadRef = globalRef.child("firepad-groups-rules").child(that.groupID).child($stateParams.docID);
      }

      firepadRef.once('value', function(snapshot) {
        that.allUsers = snapshot.val().allUsers;
        if (!that.allUsers) {
        //   var firepadPermissions = new Firebase(ref);
          if (that.subgroupID) {
            globalRef.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
              that.backdrop = snapshot.exists();
            });
            $firebaseArray(globalRef.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID)).$loaded().then(function(data) {
              that.permission = data;
              that.permission.forEach(function(val) {
                that.permissionObj[val.$id] = true;
              });
            })
          } else {
            globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
              that.backdrop = snapshot.exists();
            })
            $firebaseArray(globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID)).$loaded().then(function(data) {
              that.permission = data;
              that.permission.forEach(function(val) {
                that.permissionObj[val.$id] = true;
              });
            })
          }

          //  if(user.$id == that.user.userID)
          //    that.backdrop = true;
          //})
          // that.backdrop = that.permission[that.user.userID];
        } else {
          that.backdrop = true;
          userAccessToggles();
        }
      })

    }
  }
})();

/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.membershipcard', ['core']).controller('MembershipcardController', ['$filter', '$timeout', 'firebaseService', 'groupService', 'dataService', 'userService', '$stateParams', MembershipcardController]);

    function MembershipcardController($filter, $timeout, firebaseService, groupService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        };
        this.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
        };
        this.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };
        this.showCardData = function (user) {
            that.showParams = false;
            that.barcodeLoader[user.id] = true;
            firebaseService.getRefUsers().child(user.id).once('value', function(snapshot1){
                firebaseService.getRefGroupMembers().child(that.groupID).child(user.id).once('value', function(snapshot2){
                    firebaseService.getRefGroupsNames().child(that.groupID).once('value', function(snapshot3){
                        that.cards.push({
                            userID: user.id,
                            firstName: snapshot1.val().firstName,
                            lastName: snapshot1.val().lastName,
                            profileImage: snapshot1.val()["profile-image"],
                            membershipNo: snapshot2.getPriority(),
                            groupTitle: snapshot3.val().title,
                            groupImgUrl: snapshot3.val().groupImgUrl
                        });
                        $timeout(function(){
                            that.barcodeLoader[user.id] = false;
                            JsBarcode("#barcode" + user.id,user.id,{format:"CODE128 B", height:30, width: 2});
                        },5000)
                    });
                });
            });
        };
        this.showCardAll = function (selectionusers, allusers) {
            console.log('user', selectionusers)
            console.log('user', allusers)
            if (selectionusers.length > 0) {
                selectionusers.forEach(function(val,inx){
                    console.log('user', inx)
                    that.showCardData(val);
                });
            } else {
                $filter('groupUsers')(allusers, that.groupID).forEach(function(val,inx){
                    console.log('user', val)
                    that.showCardData(val);
                });
            }

        };
        this.printCard = function() {
            var printContents = document.getElementById('cardDetail').innerHTML;
            var originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
        };
        this.downloadPDF = function() {
            var source = angular.element(document.getElementById('cardDetail'));
            // var source = $('#cardDetail');
            source.css("background-color","white");
            html2canvas(source, {
                onrendered: function(canvas) {
                    var image = Canvas2Image.convertToJPEG(canvas)
                    console.log(image.src)
                    angular.element(document.getElementById('output')).append(canvas)
                    var pdf = new jsPDF('p', 'pt', 'letter');
                    pdf.addImage( image.src, 'JPEG',-20,-5);
                    pdf.save('membershipcard.pdf');
                }
            });
        };
        function init(){
            groupService.setActivePanel('membershipcard');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.showParams = true;
            that.report = [];
            that.users = dataService.getUserData();
            that.cards = [];
            that.selectedUser = [];
            that.barcodeLoader = {};
        }
        init();

    } //MembershipcardController
})();

(function() {
    'use strict';

    angular.module('app.user', ['core'])
        .controller('UserController', ['dataService', '$q', '$state', '$location', 'checkinService', '$rootScope', 'subgroupFirebaseService', '$firebaseArray', "firebaseService", 'userService', 'authService', '$timeout', '$firebaseObject', 'userPresenceService', '$sce', UserController]);

    function UserController(dataService, $q, $state, $location, checkinService, $rootScope, subgroupFirebaseService, $firebaseArray, firebaseService, userService, authService, $timeout, $firebaseObject, userPresenceService, $sce) {
        //$rootScope.fl= 'hello'
        var $scope = this;
        var that = this;
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
                // return moment.duration(-timestamp, "day").humanize(true);
            } else {
                return ''
            }
        }
        //window.userScope = this;
        this.pageUserId = userService.getCurrentUser();
        this.createGroup = function() {
            // $location.path('/user/:userID/create-group');
            $state.go('user.create-group', {userID: userService.getCurrentUser().userID})
        }
        var userData;
        this.time= new Date();
        this.groupMembers;
        this.onlineGroupMembers = [];
        this.offlineGroupMembers = [];

        // if($location.path.indexOf(this.pageUserId) == -1) {
        //     $location.path('/user/'+this.pageUserId+'/')
        // }
        // else {
        // console.log(this.pageUserId.userID);
        // $location.path('#/user/'+this.pageUserId.userID+'/')
        // }


        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        $scope.openCreateGroupPage = function() {
            userCompService.openCreateGroupPage();
        };
        $scope.openJoinGroupPage = function() {
            userCompService.openJoinGroupPage();
        };

        //$scope.userMemData = new userCompService.InitFlatData($scope.pageUserId.userID);
        //$scope.userMemData.$loaded().then(function(data) {

        //console.log(data)
        //debugger;
        //})

        window.fData = $scope.userMemData

        var profileImgRef = {};

        function profileImgRefCb(snapshot) {
            var self = this;
            if (snapshot.key() == 'logo-image') {
                $timeout(function() {
                    $scope.userObj[self.ind].userImg = $sce.trustAsResourceUrl(snapshot.val())
                        //getUserObj()
                })
            }

        }
        var groupDataUbind = {};
        var userDataUbind = {};
        var userObjUbind;
        this.userObj = [];


        that.users = []
        that.users = dataService.getUserData();


        // function getUserObj() {
        //     var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.pageUserId.userID))
        //         .$loaded()
        //         .then(function(data) {
        //             userObjUbind = data.$watch(function() {
        //                 getUserObj()
        //             });
        //             $scope.userObj = data;
        //             data.forEach(function(el, i) {
        //                 var j = i;
        //                 $firebaseObject(firebaseService.getRefGroups().child(el.$id))
        //                     .$loaded()
        //                     .then(function(groupData) {
        //                         groupDataUbind[j] = groupData.$watch(function() {
        //                             $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""
        //                             $scope.userObj[j].membersCount = groupData['members-count'] ? groupData['members-count'] : ""
        //                             $scope.userObj[j].membersOnline = groupData['members-checked-in'] ? groupData['members-checked-in'].count : ""
        //                             $scope.userObj[j].membersPercentage = Math.round((($scope.userObj[j].membersOnline / $scope.userObj[j].membersCount) * 100)).toString() ;
        //                             if(!angular.isNumber($scope.userObj[j].membersPercentage)) {
        //                                 $scope.userObj[j].membersPercentage = 0
        //                             }
        //                         });
        //                         $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""
        //                         $scope.userObj[j].membersCount = groupData['members-count'] ? groupData['members-count'] : ""
        //                         $scope.userObj[j].membersOnline = groupData['members-checked-in'] ? groupData['members-checked-in'].count : ""
        //                         $scope.userObj[j].membersPercentage = Math.round((($scope.userObj[j].membersOnline / $scope.userObj[j].membersCount) * 100)).toString() ;
        //                         // if(!angular.isNumber($scope.userObj[j].membersPercentage)) {
        //                         //     $scope.userObj[j].membersPercentage = 0
        //                         // }
        //                         if (groupData['group-owner-id']) {
        //                             //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
        //                             $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
        //                                 .$loaded()
        //                                 .then(function(img) {

        //                                     $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value);
        //                                     userDataUbind[j] = img.$watch(function(dataVal) {

        //                                         $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value)
        //                                     })
        //                                 })
        //                         }
        //                     }, function(e) {
        //                         console.log(e)
        //                     });
        //             });

        //         })
        //         .catch(function() {});
        // }

        // getUserObj();
        this.groups = []
        this.groups = dataService.getUserGroups();
        // this.GetGroupsData = function(groupsData) {
        //     // var defer = $q.defer()
        //     // var groups = []
        //     that.groups = []
        //     groupsData.forEach(function(val, index) {
        //         // console.log(val.$id);
        //         $firebaseObject(firebaseService.getRefGroups().child(val.$id)).$loaded().then(function(groupData) {
        //             // console.log(groupData);
        //             that.groups.push(groupData);
        //         })
        //         // if (groupsData.length == (index + 1)) {
        //            // defer.resolve(groups);
        //         // }
        //     })
        //     // return defer.promise;
        // }
        // $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.pageUserId.userID)).$loaded().then(function(groupsData) {
        //     // console.log(groupsData);
        //     that.GetGroupsData(groupsData)/*.then(function(groupsData){
        //         that.groups = []
        //         that.groups = groupsData;
        //     })*/
        //     groupsData.$watch(function(){
        //         that.GetGroupsData(groupsData)
        //     })
        // })

        this.showGroupDetails = function(key) {
            //console.log(key)
            var getGroupMembers = $firebaseObject(firebaseService.getRefGroupMembers().child(key));
            getGroupMembers.$loaded()
                .then(function(data) {
                    var x = Object.keys(data);
                    $scope.groupMembers = x;
                    $scope.groupMembers.splice(0, 3);
                    // console.log($scope.groupMembers);
                    x.forEach(function(el, i) {
                        if ((el != '$$conf') && (el != '$id') && (el != '$priority')) {
                            var z = $firebaseObject(firebaseService.getRefMain().child('users-presence').child(el));
                            z.$loaded().then(function(data) {
                                    //console.log(data)
                                    if (z.presence) {
                                        console.log('online');
                                        $scope.onlineGroupMembers.push(data)
                                    } else {
                                        // console.log('offline');
                                        $scope.offlineGroupMembers.push(data)
                                    }
                                })
                                .catch(function(err) {
                                    console.log(err)
                                })
                        }
                        // console.log(el+' '+i)

                    })
                })

        };
        this.changeShow1 = function(key, prop, flag, index, that) {
            var ctx = {
                self: that,
                key: key,
                prop: prop,
                flag: flag,
                index: index
            };

            function bound() {
                var dom = $('#gCard' + this.index);
                angular.element(dom).scope().flags = {};
                angular.element(dom).scope().flags[flag] = true;
            }

            var x = bound.bind(ctx);
            $timeout(x, 2000);
            this.selectValue = key;
            this.noShow = !this.noShow;
            return prop;
        };
        this.changeShow2 = function(key, prop) {
            this.selectValue = key;
            console.log("hello");
            this.noShow = !this.noShow;
        };
        this.changeShow3 = function(key, prop) {
            this.selectValue = key;
        };
        this.deleteAll = function() {
            $scope.groupMembers = [];
            $scope.onlineGroupMembers = [];
            $scope.offlineGroupMembers = [];
            // console.log($scope.groupMembers + $scope.onlineGroupMembers + $scope.offlineGroupMembers)
        };


        $rootScope.searchFn = function(option, flag) {

            angular.forEach($scope.userMemData.data.flattenedsubGroupsByuser, function(el, key) {
                if (flag == 1) {

                    if (option == 'any') {
                        el.show = true;

                    } else {

                        (el.groupID + '_' + el.subgroupID) == option ? el.show = true : el.show = false
                    }

                } else {

                    var str = el.firstName + el.lastName;
                    var reg = new RegExp('^' + option, 'i');
                    reg.test(str) ? el.show = true : el.show = false;

                }
            });
        }
    }

})();
/*
 */

/**
 * Created by sj on 6/6/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.group', ['core'])
        .factory('groupService', ['userService', '$location', 'authService', '$http', '$q', 'appConfig', '$firebaseObject', 'firebaseService', 'userFirebaseService', function(userService, $location, authService, $http, $q, appConfig, $firebaseObject, firebaseService, userFirebaseService) {

            var $scope = this;
            var panel = { active: '', subgroupID: ''};
            return {
                'getPanelInfo': function(){
                        return panel;
                },
                'setActivePanel': function(pname){
                        panel.active = pname;
                },
                'setSubgroupIDPanel': function(subgroupID){
                        panel.subgroupID = subgroupID;
                },
                'openCreateSubGroupPage': function() {

                    $location.path('/user/group/create-subgroup');

                },
                'openJoinGroupPage': function() {

                    $location.path('/user/joinGroup');

                },
                'canActivate': function() {
                    return authService.resolveUserPage();
                },
                'getOwnerImg': function(groupID){
                    $firebaseObject(firebaseService.getRefGroups().child(groupID))
                        .$loaded()
                        .then(function(groupData) {
                            if (groupData['group-owner-id']) {
                                $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']))
                                    .$loaded()
                                    .then(function(userData) {
                                        return userData;
                                    });
                            }
                        });
                },
                'uploadPicture': function(file) {
                    var defer = $q.defer();
                    var reader = new FileReader();
                    reader.onload = function() {

                        var data = new FormData();
                        data.append('userID', userService.getCurrentUser().userID);
                        data.append('token', userService.getCurrentUser().token);

                        var blobBin = atob(reader.result.split(',')[1]);
                        var array = [];
                        for (var i = 0; i < blobBin.length; i++) {
                            array.push(blobBin.charCodeAt(i));
                        }

                        var fileBlob = new Blob([new Uint8Array(array)], {
                            type: 'image/png'
                        });
                        data.append("source", fileBlob, file.name);
                        defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                            withCredentials: true,
                            headers: {
                                'Content-Type': undefined
                            },
                            transformRequest: angular.identity
                        }));

                    };
                    reader.readAsDataURL(file);
                    return defer.promise;

                },
                'userObj': function(pageUserId) {
                    return $firebaseObject(firebaseService.getRefUserGroupMemberships().child(pageUserId.userID));
                    //var userData = userFirebaseService.getUserMembershipsSyncObj(pageUserId.userID);
                    /* objUser.$loaded()
                     .then(function(data) {
                     console.log(data)
                     /!*objUser.$bindTo($scope, "user");

                     $scope.groups = userData.groupArray;
                     $scope.activities = userData.userActivityStream;*!/
                     })
                     .catch(function(error) {
                     console.error("Error:", error);
                     soundService.playFail();
                     });*/
                }

            };


        }]);

})();

(function() {
    'use strict';

    angular
        .module('app.group')
        .controller('GroupController', ['activityStreamService', 'firebaseService', 'userService', 'joinGroupService', 'groupService', '$firebaseArray', '$stateParams', '$state','$rootScope','CollaboratorService', GroupController]);

    function GroupController(activityStreamService, firebaseService, userService, joinGroupService, groupService, $firebaseArray, $stateParams, $state,$rootScope,CollaboratorService) {
        var that = this;
        //adminof subgroup checkin member
        this.openSetting = function () {
            if (that.adminOf === 'Group') {
                $state.go('user.edit-group', {groupID: that.groupID});
            } else if (that.adminOf === 'Subgroup') {
                $state.go('user.create-subgroup', {groupID: that.groupID});
            }
        };

        this.sendRequest = function () {
            joinGroupService.joinGroupRequest(that.reqObj, function(){
                $state.go('user.dashboard', {userID: that.user.userID});
            });
        }

        this.showPanel = function(pname, subgroupID) {
            if(pname === 'report') {
                groupService.setActivePanel('report');
            }
            if(pname === 'activity') {
                groupService.setActivePanel('activity');
            }
            if (pname === 'chat') {
                groupService.setActivePanel('chat');
            }
            if (pname === 'manualattendace') {
                groupService.setActivePanel('manualattendace');
            }
            if(pname === 'progressreport') {
                groupService.setActivePanel('progressreport');
            }
            // firepad tab condition
            if(pname === 'collaborator') {
              groupService.setActivePanel('collaborator');
            }
            if(pname === 'membershipcard') {
              groupService.setActivePanel('membershipcard');
            }
            that.panel.subgroupID = subgroupID;
            if (that.panel.subgroupID) {
              if(that.panel.active == 'collaborator'){
                CollaboratorService.getinitSubGroupDocument(that.groupID, that.panel.subgroupID, function(docId) {
                    console.log('in showPanel')
                    $state.go('user.group.subgroup-' + (that.panel.active || 'activity'), { groupID: that.groupID, subgroupID: that.panel.subgroupID, docID: docId });
                })
              }
              else {
                    $state.go('user.group.subgroup-' + (that.panel.active || 'activity'), { groupID: that.groupID, subgroupID: that.panel.subgroupID});
              }

            } else {
              if(that.panel.active == 'collaborator'){
                CollaboratorService.getinitGroupDocument(that.groupID, function(docId) {
                    console.log('in - showPanel')
                    $state.go('user.group.' + (that.panel.active || 'activity'), { groupID: that.groupID, docID: docId });
                });
              }
              else {
                    if(that.panel.active == 'progressreport') {
                        $state.go('user.group.' + 'activity', { groupID: that.groupID});
                    } else {
                        $state.go('user.group.' + (that.panel.active || 'activity'), { groupID: that.groupID});
                    }
              }
            }
        };

        init();

        function init() {
            console.log('watch 1: ', JSON.stringify( activityStreamService.getSubgroupNamesAndMemberships() ) ) ;
            that.isOwner = false;
            that.isMember = false;
            that.isAdmin = false;
            that.user = userService.getCurrentUser();
            that.panel = groupService.getPanelInfo();
            that.adminOf = false;
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID ? $stateParams.subgroupID : that.panel.subgroupID;
            that.group = false;
            that.subgroups = [];
            that.errorMsg = false;
            that.reqObj = {
                groupID: that.groupID,
                message: "Please add me in your Team.",
                membershipNo: ""
            };
            if (that.subgroupID) {
                firebaseService.getRefSubGroupsNames().child(that.groupID).child(that.subgroupID).once('value', function(subg){
                    if (subg.val()) {
                        firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(that.subgroupID).once('value', function(subgrp){
                            if (subgrp.val() && subgrp.val()['membership-type'] > 0) {
                                checkGroup();
                            } else {
                                that.reqObj.subgroupID = subg.key();
                                that.reqObj.subgrouptitle = (subg.val() && subg.val().title) ? subg.val().title : false;
                                loadGroup(function() {
                                    that.errorMsg = "You have to be Member of Team before access";
                                });
                            }
                        });
                    } else {
                        that.errorMsg = "Requested Team not found!";
                    }
                });
            } else {
                checkGroup();
            }
        }
        function loadGroup (cb) {
            firebaseService.getRefGroupsNames().child(that.groupID).once('value', function(grp){
                if (grp.val()) {
                    that.group = {};
                    that.group.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                    that.reqObj.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                    that.group.addresstitle = (grp.val() && grp.val()['address-title']) ? grp.val()['address-title'] : false;
                    that.group.groupImgUrl = (grp.val() && grp.val().groupImgUrl) ? grp.val().groupImgUrl : false;
                    that.group.ownerImgUrl = (grp.val() && grp.val().ownerImgUrl) ? grp.val().ownerImgUrl : false;
                    cb();
                } else {
                    that.errorMsg = "Requested Team of Team not found!";
                }
            });
        }
        function checkGroup() {
            if (that.groupID) {
                loadGroup(function() {
                    firebaseService.getRefUserGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(groups) {
                        if (groups.val() && groups.val()['membership-type'] == 1) {
                            that.isOwner = true;
                            that.isAdmin = true;
                            that.isMember = true;
                            that.adminOf = "Group";
                        } else if (groups.val() && groups.val()['membership-type'] == 2) {
                            that.isAdmin = true;
                            that.isMember = true;
                            that.adminOf = "Group";
                        } else if (groups.val() && groups.val()['membership-type'] == 3) {
                            that.isMember = true;
                        }
                        if (!that.isMember) {
                            that.errorMsg = "You have to be Member of Team before access";
                        } else {
                            if (that.isMember) {
                                firebaseService.getRefGroups().child(that.groupID).child('members-checked-in').on('value', function(groupinfo) {
                                    that.group.onlinemember = (groupinfo.val() && groupinfo.val().count) ? groupinfo.val().count : 0;
                                });
                                firebaseService.getRefGroups().child(that.groupID).child('members-count').on('value', function(groupinfo) {
                                    that.group.members = groupinfo.val() ? groupinfo.val() : 0;
                                });
                            }
                            firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(subgroups) {
                                for (var subgroup in subgroups.val()) {
                                    if (subgroups.val()[subgroup]['membership-type'] == 1) {
                                        that.isOwner = true;
                                        that.isAdmin = true;
                                        that.isMember = true;
                                        that.adminOf = that.adminOf || 'Subgroup';
                                    } else if (subgroups.val()[subgroup]['membership-type'] == 2) {
                                        that.isAdmin = true;
                                        that.isMember = true;
                                        that.adminOf = that.adminOf || 'Subgroup';
                                    } else if (subgroups.val()[subgroup]['membership-type'] == 3) {
                                        that.isMember = true;
                                    }
                                    if (that.isMember) {
                                        firebaseService.getRefSubGroups().child(that.groupID).child(subgroup).on('value', function(subgroupData) {
                                            var subgroup = subgroupData.val();
                                            subgroup['$id'] = subgroupData.key();
                                            if (that.subgroups.length > 0) {
                                                for (var i = 0; i <= that.subgroups.length; i++) {
                                                    if (that.subgroups[i].$id === subgroupData.key()) {
                                                        that.subgroups[i] = subgroup;
                                                        return false;
                                                    }
                                                    if (i + 1 == that.subgroups.length) {
                                                        that.subgroups.push(subgroup);
                                                        subgroupChildRemovedEvent(subgroup.$id);
                                                    }
                                                } //for loop
                                                // that.subgroups.forEach(function(subgrp, indx) {
                                                //         if (subgrp.$id === subgroupData.key()) {
                                                //             subgrp = subgroup;
                                                //         }
                                                //         if (that.subgroups.length === (indx + 1)) {
                                                //             that.subgroups.push(subgroup);
                                                //         }
                                                //     });
                                            } else {
                                                that.subgroups.push(subgroup);
                                                subgroupChildRemovedEvent(subgroup.$id);
                                            }
                                        });
                                    }
                                }
                                // that.subgroups = $firebaseArray(firebaseService.getRefSubGroups().child(that.groupID));
                            });
                        }
                    });
                });
            }
        } //checkGroup
        function subgroupChildRemovedEvent(subgroup) {
            firebaseService.getRefSubGroups().child(that.groupID).child(subgroup).off('value');
            firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(subgroup).on('child_removed', function(Oldsnapshot) {
                console.log('watch 2: ', JSON.stringify( activityStreamService.getSubgroupNamesAndMemberships() ) ) ;
                that.subgroups.forEach(function(v) {
                    if (v.$id == subgroup) {
                        that.subgroups.splice(v, 1);
                    }
                });
            });
        } //subgroupChildRemovedEvent
    }
})();

/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.home', [])
        .controller('HomeController', HomeController);

    HomeController.$inject = ['authService', 'userService', "$state"];

    function HomeController(authService, userService, $state) {

    }
})();

(function() {
    'use strict';

    angular
        .module('app.navLoginbar', ['ngMdIcons', 'core'])
        .controller('NavLoginbarController', NavLoginbarController);

    NavLoginbarController.$inject = ['authService'];

    function NavLoginbarController(authService) {
        this.showmenu = false;
        //console.log('test')
        /*this.canActivate = function(){
            return authService.resolveUserPage();
        }*/
    }

})();

/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.navToolbar', ['core'])
        .factory('navToolbarService', ['$q', 'authService', "$location", "messageService", 'userService', '$firebaseObject', 'firebaseService', 'checkinService',
            function($q, authService, $location, messageService, userService, $firebaseObject, firebaseService, checkinService) {

                return {}
            }
        ]);

})();

(function() {
    'use strict';

    angular.module('app.navToolbar')
    //Filter Array in reverse
    .filter('reverse', function() {
      return function(items) {
        return items.slice().reverse();
      };
    })

    .controller('NavToolbarController', ['activityStreamService','ProgressReportService', '$mdSidenav', '$mdDialog', '$mdMedia','$interval','$q','$rootScope', 'soundService', 'messageService', '$timeout', '$firebaseArray', 'navToolbarService', 'authService', '$firebaseObject', 'firebaseService', 'userService', '$state',  '$location', 'checkinService',
        function(activityStreamService, ProgressReportService, $mdSidenav, $mdDialog, $mdMedia, $interval, $q, $rootScope, soundService, messageService, $timeout, $firebaseArray, navToolbarService, authService, $firebaseObject, firebaseService, userService, $state, $location, checkinService) {
            /*private variables*/
            // alert('inside controller');

            var self = this;
            self.displayNotificationBox = false;
            var userID = userService.getCurrentUser().userID;
            self.myUserId = userID;
            this.notifications = [];
           //filter Array in reverse

            /*VM properties*/

            this.checkinObj = {
                newStatus: {}
            };
            this.checkout = false;
            this.showUrlObj = {};
            this.switchMsg = false;
            this.userImgClickCard = false;
            this.groups = {};
            this.ListGroupSubGroup = [];
            this.subgroups = [];
            this.filteredGroups = null;
            this.groupObj1 = null;
            this.currentLocation = {};
            //this.userObj2;
            this.switchCheckIn = false;
            this.isProgressReport = false;
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;     //Firebase TimeStamp

            /*VM function ref*/
            this.logout = logout;
            this.PersonalSetting = PersonalSetting;
            this.showSubGroup = showSubGroup;
            this.shiftToUserPage = shiftToUserPage;
            //this.doChange = doChange;
            this.updateStatus = updateStatus;

            //if report not submitted show switchMsg
            this.isDailyProgessSubmit = false;
            this.todayDate = Date.now();

            //this.logout = logout;
            this.queryGroups = queryGroups;
            this.quizStart = quizStart;

            this.progressReport = function() {
                $mdSidenav('right').toggle().then(function() {
                    //self.openNav = !self.openNav;
                });
            };
            //#document.onkey
            this.count = function(e){
              console.log(document);
              console.log(e);
            };
                // alert(this.test)
            this.setFocus = function() {
                document.getElementById("#GroupSearch").focus();
            };

            function quizStart() {
                // console.log('done')
                // $location.path('/user/' + userService.getCurrentUser().userID + '/quiz')
                $state.go('user.quiz', {userID: userService.getCurrentUser().userID});
            }

            //moment.js
            this.returnMoment = function (timestamp) {
                if (timestamp) {
                    return moment().to(timestamp);
                } else {
                    return '';
                }
            };

            //this.userObj = $firebaseObject(firebaseService.getRefUsers().child(userID))

            $firebaseObject(firebaseService.getRefUsers().child(userID))
                .$loaded().then(function(data) {
                    //debugger;
                    $rootScope.userImg = data['profile-image'];
                    // console.log(data)
                })
                .catch(function(error) {
                    console.error("Error:", error);
                    soundService.playFail('Error occurred.');
            });

            // $firebaseObject(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(snapshot) {
            //     if (snapshot.type == 1 && snapshot.groupID && snapshot.subgroupID) {
            //         self.checkout = true;
            //         self.switchCheckIn = true;
            //         self.showUrlObj.userID = userID;
            //         self.showUrlObj.groupID = snapshot.groupID;
            //         self.showUrlObj.subgroupID = snapshot.subgroupID;
            //     }
            // }, function(e) {
            //     console.log(e)
            // });

        //using multipath -- START --

            self.subGroupHasPolicy = false;
            self.subGroupPolicy = {};
            function checkingHasPolicy(groupID, subgroupID, cb) {
                firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).once('value', function(snapshot) {
                    self.subGroupHasPolicy = (snapshot.val() && snapshot.val().hasPolicy) ? snapshot.val().hasPolicy : false;
                    // console.log('subGroupHasPolicy', self.subGroupHasPolicy);

                    if(self.subGroupHasPolicy) {
                        firebaseService.getRefPolicies().child(groupID).child(snapshot.val().policyID).once('value', function(policy){
                            self.subGroupPolicy = policy.val();
                            cb(true);
                            // console.log('policy key', policy.key());
                            // console.log('policy val', policy.val());
                        }); //getting policy
                    } else {//self.subGroupHasPolicy if true
                        cb(false);
                    }
                });
            } //subgroupHasPolicy


            //using multipath -- END --


            checkinService.getRefSubgroupCheckinCurrentByUser().child(userID).on('value', function(snapshot, prevChildKey) {
                // console.log(snapshot.val());
                // console.log(snapshot.val().type);
                if (snapshot.val() && snapshot.val().type == 2) {
                    self.checkout = false;
                    self.switchCheckIn = false;
                    self.showUrlObj.userID = '';
                    self.showUrlObj.groupID = '';
                    self.showUrlObj.subgroupID = '';
                    // self.showUrlObj.recordref = '';
                } else if (snapshot.val() && snapshot.val().type == 1) {
                    self.checkout = true;
                    self.switchCheckIn = true;
                    self.showUrlObj.userID = userID;
                    self.showUrlObj.groupID = snapshot.val().groupID;
                    self.showUrlObj.subgroupID = snapshot.val().subgroupID;
                    firebaseService.getRefGroupsNames().child(self.showUrlObj.groupID).child('title').once('value', function(snapshot) {
                        self.showUrlObj.groupTitle = snapshot.val();
                    });
                    firebaseService.getRefSubGroupsNames().child(self.showUrlObj.groupID).child(self.showUrlObj.subgroupID).child('title').once('value', function(snapshot) {
                        self.showUrlObj.subgroupTitle = snapshot.val();
                    });
                    // self.showUrlObj.recordref = snapshot.val()['record-ref'];
                }
            });

            checkinService.getRefSubgroupCheckinCurrentByUser().child(userID).on('child_changed', function(snapshot, prevChildKey) {
                // console.log(snapshot.val());
                // console.log(snapshot.val().type);
                if (snapshot.val() && snapshot.val().type == 2) {
                    self.checkout = false;
                    self.switchCheckIn = false;
                    self.showUrlObj.userID = '';
                    self.showUrlObj.groupID = '';
                    self.showUrlObj.subgroupID = '';
                    // self.showUrlObj.recordref = '';
                } else if (snapshot.val() && snapshot.val().type == 1) {
                    self.checkout = true;
                    self.switchCheckIn = true;
                    self.showUrlObj.userID = userID;
                    self.showUrlObj.groupID = snapshot.val().groupID;
                    self.showUrlObj.subgroupID = snapshot.val().subgroupID;
                    // self.showUrlObj.recordref = snapshot.val()['record-ref'];
                }
            })

            self.groups = $firebaseArray(firebaseService.getRefUserSubGroupMemberships().child(userID));

            /* VM and Helper Functions*/
            // this.userLocation = {};
            this.groupLocation = {};
            this.CalculateDistance = function(lat1, lon1, lat2, lon2, unit) {
                //:::    unit = the unit you desire for results                               :::
                //:::           where: 'M' is statute miles (default)                         :::
                //:::                  'K' is kilometers                                      :::
                //:::                  'N' is nautical miles                                  :::
                var radlat1 = Math.PI * lat1 / 180;
                var radlat2 = Math.PI * lat2 / 180;
                var radlon1 = Math.PI * lon1 / 180;
                var radlon2 = Math.PI * lon2 / 180;
                var theta = lon1 - lon2;
                var radtheta = Math.PI * theta / 180;
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                dist = Math.acos(dist);
                dist = dist * 180 / Math.PI;
                dist = dist * 60 * 1.1515;
                if (unit == "K") {
                    dist = dist * 1.609344;
                }
                if (unit == "N") {
                    dist = dist * 0.8684;
                }
                return dist;
            };

            // //Show Dailogue Box for Daily Report Questions -- START --
            // var html = "<md-dialog aria-label=\"Daily Report\" ng-cloak> <form> <md-toolbar> <div class=\"md-toolbar-tools\"> <h2>Daily Progress Report</h2> <span flex></span> </div> </md-toolbar> <md-dialog-content> <div class=\"md-dialog-content\"> <h2>Questions List</h2> <p ng-repeat=\"(id, name) in questions\"> <strong>*</strong> {{name}} </p> <div layout=\"row\"> <md-input-container flex> <label>Please write...</label><textarea ng-model=\"reportText\"></textarea></md-input-container> </div> </div> </md-dialog-content> <md-dialog-actions layout=\"row\"> <span flex></span> <md-button ng-click=\"cancel('not useful')\"> Later </md-button> &nbsp; <md-button ng-click=\"report()\" style=\"margin-right:20px;\"> Submit </md-button> </md-dialog-actions> </form> </md-dialog>";
            // self.showAdvanced = function(ev) {
            //     //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
            //     $mdDialog.show({
            //       controller: DailyReportController,
            //       // templateUrl: 'http://yahoo.com',
            //       template: html,
            //       //parent: angular.element(document.body),
            //       targetEvent: ev,
            //       locals: { questions: self.subGroupPolicy.dailyReportQuestions},
            //       clickOutsideToClose:false,
            //       //fullscreen: useFullScreen
            //     })
            //     .then(function(reportAnswer) {

            //         //save report in firebase
            //         firebaseService.getRefMain().child('daily-progress-report-by-users').child('user').child('group').child('subgroup').push({
            //             date: firebaseTimeStamp,
            //             answer: reportAnswer,
            //             questions: self.subGroupPolicy.dailyReportQuestions
            //         });

            //         alert(reportAnswer);
            //         self.reportAnswer = 'You said the information was "' + reportAnswer + '".';
            //     }, function() {
            //         // alert('Cancel - Later');
            //         $scope.status = 'You cancelled the dialog.';
            //     });
            // };

            // function DailyReportController($scope, $mdDialog, questions) {
            //   $scope.questions = questions;
            //   $scope.hide = function() {
            //     $mdDialog.hide();
            //   };
            //   $scope.cancel = function() {
            //     $mdDialog.cancel();
            //   };
            //   $scope.report = function() {
            //     $mdDialog.hide($scope.reportText);
            //   };
            // }
            // //Show Dailogue Box for Daily Report Questions -- END --

            function updateStatus(group, checkoutFlag, event) {
                var groupObj = {};
                self.checkinSending = true;
                if(group){
                    groupObj = {groupId: group.pId, subgroupId: group.subgroupId, userId: userID, subgroupTitle: group.subgroupTitle};
                } else {
                    groupObj = {
                        groupId: self.showUrlObj.groupID,
                        subgroupId: self.showUrlObj.subgroupID,
                        userId: self.showUrlObj.userID
                    };
                }
                checkinService.ChekinUpdateSatatus(groupObj, userID, checkoutFlag, function(result, msg, isSubmitted, groupObject) {
                    if(result){
                        self.checkinSending = false;
                        if (checkoutFlag) {
                            //when successfully checkout then add activity Stream
                            //for subgroup activity stream record -- START --
                            var type = 'subgroup';
                            var targetinfo = {id: groupObj.subgroupId, url: groupObj.groupId+'/'+groupObj.subgroupId, title: self.showUrlObj.subgroupTitle, type: 'subgroup-checkout' };
                            var area = {type: 'subgroup-checkout'};
                            var group_id = groupObj.groupId+'/'+groupObj.subgroupId;
                            var memberuserID = userID;
                            var _object = null;
                            //for group activity record
                            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, _object);
                            //for subgroup activity stream record -- END --

                            //showing toaster of checkout
                            messageService.showSuccess('Checkout Successfully!');

                            //checking is report is submitted or not.. if not then open side navbar for getting progress report
                            if(isSubmitted){
                                //if daily progress report is not submitted load progress Report side nav bar..
                                var userObj = { id: userID, groupID: groupObj.groupId, subgroupID: groupObj.subgroupId };
                                self.dailyProgressReport = ProgressReportService.getSingleSubGroupReport(userObj, groupObj.groupId, groupObj.subgroupId);

                                //open side nav bar for getting progress report
                                self.progressReportSideNav();

                                // self.switchCheckIn = true;
                                // self.switchMsg = true;
                                // self.isDailyProgessSubmit = true
                                // self.isDailyProgessgroupID = groupObject.groupId;
                                // self.isDailyProgesssubgroupID = groupObject.subgroupId;
                            }
                        } else {
                            //when successfully checkin successfully

                            self.checkinSending = false;

                            //add activity Stream
                            //for subgroup activity stream record -- START --
                            var _type = 'subgroup';
                            var _targetinfo = {id: group.subgroupId, url: group.pId+'/'+group.subgroupId, title: group.subgroupTitle, type: 'subgroup-checkin' };
                            var _area = {type: 'subgroup-checkin'};
                            var _group_id = group.pId+'/'+group.subgroupId;
                            var _memberuserID = userID;
                            var __object = null;
                            //for group activity record
                            activityStreamService.activityStream(_type, _targetinfo, _area, _group_id, _memberuserID, __object);
                            //for subgroup activity stream record -- END --

                            messageService.showSuccess('Checkin Successfully!');
                        } // else checkoutFlag
                    } else {
                        self.checkinSending = false;
                        messageService.showFailure(msg);
                    }
                }); // checkinService.ChekinUpdateSatatus
            }

            function updateStatus1(group, checkoutFlag, event) {
                // console.log('group', group)
                // console.log('checkoutFlag', checkoutFlag)
                self.checkinSending = true;

                 //getting Current Location
                checkinService.getCurrentLocation().then(function(location) {
                    // console.log('current location', location.coords);

                    if(location.coords) {
                        self.currentLocation = { lat: location.coords.latitude, lng: location.coords.longitude };

                        if(group) { //if group (on checkin)
                            checkinService.subgroupHasPolicy(group.pId, group.subgroupId, function(hasPolicy, Policy) {
                                if(hasPolicy){ //if has policy
                                    // console.log('hasPolicy', true)
                                    checkinPolicy(function(){
                                        updateHelper(group, false, event, function(bool){
                                            if(bool) {
                                                chekinSwitch(group, false);
                                                messageService.showSuccess('Checkin Successfully!');
                                            } else {
                                                messageService.showFailure('Please contact to your administrator');
                                            }
                                        });
                                    });
                                } else {    //if no policy
                                    // console.log('hasPolicy', false)
                                    updateHelper(group, false, event, function(bool){
                                        if(bool){
                                            chekinSwitch(group, false);
                                            messageService.showSuccess('Checkin Successfully!');
                                        } else {
                                            messageService.showFailure('Please contact to your administrator');
                                        }
                                    });
                                }
                            })
                            // checkingHasPolicy(group.pId, group.subgroupId, function(result) {
                            //     if(hasPolicy){ //if has policy
                            //         // console.log('hasPolicy', true)
                            //         checkinPolicy(function(){
                            //             updateHelper(group, false, event, function(bool){
                            //                 if(bool) {
                            //                     chekinSwitch(group, false);
                            //                     messageService.showSuccess('Checkin Successfully!');
                            //                 } else {
                            //                     messageService.showFailure('Please contact to your administrator');
                            //                 }
                            //             });
                            //         });
                            //     } else {    //if no policy
                            //         // console.log('hasPolicy', false)
                            //         updateHelper(group, false, event, function(bool){
                            //             if(bool){
                            //                 chekinSwitch(group, false);
                            //                 messageService.showSuccess('Checkin Successfully!');
                            //             } else {
                            //                 messageService.showFailure('Please contact to your administrator');
                            //             }
                            //         });
                            //     }
                            // }); // checkingHasPolicy
                        } else {    //if no group (on checkout)
                            // console.log('Checkout', true)
                            updateHelper(false, true, event, function(bool){
                                if(bool){
                                    self.showAdvanced(event); //show dailogue box to take progress report
                                    //chekinSwitch(false, true);    //checkinswitch(group, checkoutFlag)
                                    messageService.showSuccess('Checkout Successfully!');
                                    self.subGroupHasPolicy = false; self.subGroupPolicy = {};
                                 } else {
                                    messageService.showFailure('Please contact to your administrator');
                                }
                            }); // update data on firebase

                        } //else group

                    } else { //if not location.coords
                        chekinSwitch(false, true);
                        self.switchCheckIn = false;
                        messageService.showFailure('Please allow your location (not getting current location)!');
                        return false;
                    }
                }); //checkinService.getCurrentLocation()
            } // updateStatus
            this.laterReport = function(){
                self.checkout = false;
                self.checkinSending = false;
                self.switchMsg = false;
                self.isDailyProgessSubmit = false;
                self.switchCheckIn = false;
            };
            this.submitReport = function(){
                //self.showUrlObj.userID
                //self.showUrlObj.groupID
                //self.showUrlObj.subgroupID
                //$location
                self.switchCheckIn = false;
                self.switchMsg = false;
                self.isDailyProgessSubmit = false;
                $state.go('user.group.subgroup-progressreport', {groupID: self.isDailyProgessgroupID, subgroupID: self.isDailyProgesssubgroupID, u: true});
            };
            function checkinPolicy(callback) {
                if(self.subGroupPolicy.locationBased) {  //checking if location Based

                    //checking distance (RADIUS)
                    var distance = self.CalculateDistance(self.subGroupPolicy.location.lat, self.subGroupPolicy.location.lng, self.currentLocation.lat, self.currentLocation.lng, 'K');
                    // console.log('distance:' + distance);
                    // console.log('distance in meter:' + distance * 1000);

                    if ((distance * 1000) > self.subGroupPolicy.location.radius) {  //checking lcoation radius
                        chekinSwitch(false, true);
                        self.switchCheckIn = false;
                        messageService.showFailure('Current Location does not near to the Team Location');
                        return false;
                    } else { // if within radius

                        checkinTimeBased(function(d) {  //policy has also timeBased
                            if(d) {
                                callback();     //if result true (checkin allow)
                            }
                        }); //checking if time based
                    } //if within radius

                } else if(self.subGroupPolicy.timeBased) { //policy has timeBased
                    checkinTimeBased(function(d) {
                        if(d) {
                            callback();      //if result true (checkin allow)
                        }
                    }); //checking if time based
                } else {    //checking others like if dailyReport
                    callback();      //result true (checkin allow) (might be only dailyReport has checked)
                }
            } //checkinLocationBased
            function checkinTimeBased(callback) {
                var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                //if timeBased true
                if(self.subGroupPolicy.timeBased) {
                    var today = new Date();
                    var Schduleday = days[today.getDay()];

                    //(self.subGroupPolicy.schedule[Schduleday] && self.subGroupPolicy.schedule[Schduleday][today.getHours()]) ?  console.log('t') : console.log('f');
                    if(self.subGroupPolicy.schedule[Schduleday] && self.subGroupPolicy.schedule[Schduleday][today.getHours()]) {
                        //if allow then checkin
                        callback(true);
                    } else {   //checking allow in days with hours
                        chekinSwitch(false, true);
                        self.switchCheckIn = false;
                        messageService.showFailure('You Don\'t have to permission to checkin at this day/hour');
                        return false;
                    }

                } else {//timeBased false
                    callback(true);    //if not timebased then return true....
                }
            } //checkinTimeBased
            function chekinSwitch(group, checkoutFlag){
                var grId = group && group.pId || self.showUrlObj.groupID;
                var sgrId = group && group.subgroupId || self.showUrlObj.subgroupID;
                if (!checkoutFlag) {
                    // console.log('on checkin -- checkoutflag false')
                    self.showUrlObj.userID = userID;
                    self.showUrlObj.groupID = grId;
                    self.showUrlObj.subgroupID = sgrId;
                    self.checkout = true;
                    self.checkinSending = false;
                } else {
                    // console.log('on checkout -- checkoutflag true')
                    self.checkout = false;
                    self.checkinSending = false;
                    self.switchMsg = false;
                    // console.log('switchCheckIn', self.switchCheckIn)
                }
            }
            function updateHelper(group, checkoutFlag, event, cb) {
                var groupObj = {};

                if(group) { //on checkin
                    groupObj = {
                        groupId: group.pId,
                        subgroupId: group.subgroupId,
                        userId: userID
                    }
                } else {    //on checkout
                    groupObj = {
                        groupId: self.showUrlObj.groupID,
                        subgroupId: self.showUrlObj.subgroupID,
                        userId: self.showUrlObj.userID
                    };
                }

                // //checking daily progress report is exists or not -- START --
                // firebaseService.getRefMain().child('daily-progress-report-by-users').child('user').child('group').child('subgroup').orderByChild('date')
                // .startAt(new Date().setHours(0,0,0,0)).endAt(new Date().setHours(23,59,59,0)).once('value', function(snapshot){
                //     console.log(snapshot.val());
                //     if(snapshot.val() == null){
                //         //if null then show alert for add daily progress report
                //         self.showAdvanced(event); //show dailogue box for getting progress report
                //         //add/updatcde in firebase...
                //         checkinService.saveFirebaseCheckInOut(groupObj, checkoutFlag, cb);
                //         //updateFirebase(groupObj, checkoutFlag, cb);
                //     } else {
                //         //add/update in firebase...
                //         //updateFirebase(groupObj, checkoutFlag, cb);
                //         checkinService.saveFirebaseCheckInOut(groupObj, checkoutFlag, cb);
                //     }
                // });
                // //checking daily progress report is exists or not -- END --

                //add/update in firebase...
                checkinService.saveFirebaseCheckInOut(groupObj, checkoutFlag, self.currentLocation, cb);
                //updateFirebase(groupObj, checkoutFlag, cb);

            } //updateHelper
            function updateStatusHelper(groupID, subgroupID, userID, checkoutFlag) {
                checkinService.getCurrentLocation().then(function(location) {
                    if (location) {
                        self.checkinObj.newStatus.location = {
                            lat: location.coords.latitude,
                            lon: location.coords.longitude
                        };
                    } else {
                        self.checkinObj.newStatus.location = {
                            lat: 0,
                            lon: 0
                        };
                    }

                    checkinService.updateUserStatusBySubGroup(groupID, subgroupID, userID, self.checkinObj.newStatus, self.definedSubGroupLocations, null)
                        .then(function(res) {
                            $timeout(function() {
                                self.checkinObj.newStatus.message = '';
                                self.checkinSending = false;
                                if (!checkoutFlag) {
                                    self.showUrlObj.userID = userID;
                                    self.showUrlObj.groupID = groupID;
                                    self.showUrlObj.subgroupID = subgroupID;
                                    self.checkout = true;
                                } else {
                                    self.checkout = false;
                                    self.switchCheckIn = false;
                                    self.switchMsg = false;
                                }
                            });

                            messageService.showSuccess(res);
                        }, function(reason) {
                            self.checkinSending = false;
                            messageService.showFailure(reason);
                        });
                }, function(err) {
                    messageService.showFailure(err.error.message);
                    self.checkinSending = false;
                });
            }
            //update firebase on checkin or checkout
            function updateFirebase(groupObj, checkoutFlag, cb) { //on checkout checkoutFlag is true, on checkin checkoutFlag is false

                var multipath = {};
                var dated = Date.now();
                var ref = firebaseService.getRefMain();         //firebase main reference
                var refGroup = firebaseService.getRefGroups();  //firebase groups reference

                //generate key
                var newPostRef = firebaseService.getRefsubgroupCheckinRecords().child(groupObj.groupId).child(groupObj.subgroupId).child(groupObj.userId).push();
                var newPostKey = newPostRef.key();

                var checkinMessage = (checkoutFlag) ? "Checked-out" : "Checked-in";
                var statusType = (checkoutFlag) ? 2 : 1;

                multipath["subgroup-check-in-records/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId+"/"+newPostKey] = {
                "identified-location-id": "Other",
                "location": {
                    "lat": self.currentLocation.lat,
                    "lon": self.currentLocation.lng
                },
                "message": checkinMessage,
                "source-device-type": 1,
                "source-type": 1,
                "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
                }
                multipath["subgroup-check-in-current-by-user/"+groupObj.userId] = {
                    "groupID": groupObj.groupId,
                    "source-device-type": 1,
                    "source-type": 1,
                    "subgroupID": groupObj.subgroupId,
                    "timestamp": dated,
                    "type": statusType
                }
                multipath["subgroup-check-in-current/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId] = {
                    "identified-location-id": "Other",
                    "location": {
                        "lat": self.currentLocation.lat,
                        "lon": self.currentLocation.lng
                    },
                    "message": checkinMessage,
                    "record-ref": newPostKey,
                    "source-device-type": 1,
                    "source-type": 1,
                    "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                    "timestamp": dated,
                    "type": statusType
                }
                //multipath["groups/"+groupObj.groupId+"/members-checked-in-count"] = 0;
                refGroup.child(groupObj.groupId).child('members-checked-in').child('count').once('value', function(snapshot){
                    multipath["groups/"+groupObj.groupId+"/members-checked-in/count"] = (checkoutFlag) ? (snapshot.val() - 1) : (snapshot.val() + 1);
                    ref.update(multipath, function(err){
                        if(err) {
                            console.log('err', err);
                            cb(false);
                        }
                        //calling callbAck....
                         cb(true);
                    }); //ref update
                }); //getting and update members-checked-in count
            } //updateFirebase
            function logout() {
                authService.logout();
            }
            function shiftToUserPage() {
                // $location.path('/user/' + userService.getCurrentUser().userID)
                $state.go('user.dashboard', { userID: userService.getCurrentUser().userID });
            }
            this.checkTeamAvailable = function () {
                if (self.groups.length === 0) {
                    messageService.showFailure('Currently you are not a member of any Team!');
                    self.switchCheckIn = false;
                    return
                }
            };
            this.checkinClick = function(event) {
                self.displayNotificationBox = false;
                if (self.checkinSending) {
                    self.switchCheckIn = !self.switchCheckIn;
                    return;
                }
                if (self.groups.length === 0) {
                    return;
                }
                if (!self.switchMsg) {
                    if (self.checkout) {
                        updateStatus(false, true, event);
                        //self.updateStatus(self.showUrlObj.group, true)
                        return;
                    }
                }
                self.switchMsg = !self.switchMsg;
                self.ListGroupSubGroup = [];
                self.groups.forEach(function(group, groupId) {
                    var tmp = {
                        group: group.$id,
                        groupTitle: checkinService.getGroupTitle(group.$id),
                        subGroups: []
                    }
                    for (var i in group) {
                        if (['$priority', '$id'].indexOf(i) == -1 && typeof group[i] === 'object') {
                            checkinService.getSubGroupTitleCb(group.$id, i, function(title){
                                var temp = {};
                                temp.pId = group.$id; // group Name == pId
                                temp.subgroupId = i;
                                temp.subgroupTitle = title
                                temp.data = group[i];
                                tmp.subGroups.push(temp);
                            })
                        }
                    }
                    self.ListGroupSubGroup.push(tmp);
                });
            };
            function showSubGroup(group, pId) {
                self.subgroups = [];
                for (var i in group) {
                    if (['$priority', '$id'].indexOf(i) == -1 && typeof group[i] === 'object') {
                        var temp = {};
                        temp.pId = group.$id; // group Name == pId
                        temp.subgroupId = i;
                        temp.data = group[i];
                        self.subgroups.push(temp);
                    }
                }
            }
            function queryGroups() {
                if (self.search) {
                    var filteredGroupsNamesRef = firebaseService.getRefUserSubGroupMemberships().child(userID)
                        .orderByKey()
                        .startAt(self.search)
                        .endAt(self.search + '~');

                    self.filteredGroups = Firebase.getAsArray(filteredGroupsNamesRef);
                    self.groupObj1 = self.filteredGroups;
                    // console.log(self.filteredGroups);
                    // console.log(self.groupObj1);


                } else {
                    // self.filteredGroups = [];
                    self.filteredGroups = Firebase.getAsArray(firebaseService.getRefUserSubGroupMemberships().child(userID));
                }

                return;
                // self.filteredGroups;
                // self.groupObj1;
            }
            function PersonalSetting() {
                // $location.path('/user/' + userID + '/personalSettings')
                $state.go('user.personal-settings', {userID: userService.getCurrentUser().userID})
            }

            this.progressReportSideNav = function(){
            //side nav bar for daily progress report
              $mdSidenav('right').toggle().then(function(){
              });
            };

            this.updateProgressReport = function() {
                //console.log(self.dailyProgressReport[0]);
                ProgressReportService.updateReport(self.dailyProgressReport[0], function(result) {
                    if (result) {
                        messageService.showSuccess('Progress Report Updated!');
                        self.progressReportSideNav();
                    } else {
                        messageService.showFailure('Progress Report Update Failure!');
                    }
                });
            };

            // ## Notification -- START

            //getting notifications
            activityStreamService.init();
            this.notifications = activityStreamService.getActivities();

            //   enable/disable notificaiton box and also on click will set seen notfication
            self.showNotification = function() {
                self.displayNotificationBox = !self.displayNotificationBox;
                if (!self.displayNotificationBox) {

                    //has seen activities..... update timestamp of seen
                    activityStreamService.activityHasSeen();
                }
            };

            // ## Notification -- END

        } //NavToolbarController
    ]);
})();

/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.signin', ['core'])
        .factory('singInService', ['$state', '$q', 'authService', "$location", "messageService", function($state, $q, authService, $location, messageService) {

            return {
                'login': function(user, location) {

                    var defer = $q.defer();
                    authService.login(user, function(data) {
                        messageService.showSuccess('Login successful');
                        //firebaseService.addUpdateHandler();
                        // $location.path(location + data.user.userID);
                        $state.go('user.dashboard', {userID: data.user.userID})
                        defer.resolve()
                    }, function(data) {
                        if (data) {
                            if (data.statusCode == 0) {
                                messageService.showFailure(data.statusDesc);
                            } else {
                                messageService.showFailure('Network Error Please Submit Again');
                            }
                        } else {
                            messageService.showFailure('Network Error Please Submit Again');
                        }
                        defer.reject(data)
                    });
                    return defer.promise;


                }
            }
        }]);

})();

/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.signin')
        .controller('SigninController', SigninController);

    SigninController.$inject = ["singInService", '$mdToast', 'authService'];

    function SigninController(singInService, $mdToast, authService) {
        /*Private Variables*/
        var that = this;
        var pageToRoutAfterLoginSuccess = "/";
        /* VM variables*/
        this.user = {
            email: "",
            password: ""
        };
        this.submitting = false;

        /*VM functions*/
        this.login = loginFn;


        /*private functions*/

        function loginFn(form) {
            that.submitting = true;
            singInService.login(form.user, pageToRoutAfterLoginSuccess)
                .then(function(data) {
                    that.submitting = false;
                })
                .catch(function() {
                    that.submitting = false;
                });

        }
        /*this.canActivate = function(){
            return authService.resolveUserPage();
        }*/

    }

})();

/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.sign-up', ['core'])
        .factory('signUpService', ['$q', 'authService', "$location", "messageService", function($q, authService, $location, messageService) {

            return {
                'signup': function(user, location) {
                    var defer = $q.defer();
                    authService.signup(user, function(data, firebaseData) {
                            if (data.statusCode == 1) {
                                messageService.showSuccess('Email has been sent please verify.');
                                $location.path(location);
                            } else {
                                messageService.showFailure(data.statusDesc);
                                defer.reject();
                            }
                        },
                        function() {
                            messageService.showFailure('Network Error Please Submit Again.');
                        });
                    return defer.promise;


                }
            }
        }]);

})();

/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.sign-up')
        .controller('SignUpController', SignUpController);

    SignUpController.$inject = ['signUpService', 'authService'];

    function SignUpController(signUpService, authService) {
        //

        /*private properties*/
        var that = this;
        var routeToRedirectAfterSuccess = '/signin';
        this.process = false;

        /*VM properties*/
        this.user = {
            email: "",
            userID: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: ""
        };
        /*VM function*/
        this.signup = signup;

        /*function declarations*/
        function signup() {

            that.process = true;
            that.user.userID = that.user.userID.toLowerCase();
            that.user.userID = that.user.userID.replace(/[^a-zA-Z0-9]/g, '');

            signUpService.signup(that.user, routeToRedirectAfterSuccess)
                .then(function() {
                    that.process = false;
                    // console.log('Success')
                })
                .catch(function() {
                    that.process = false;
                    // console.log('failed')
                })
        };
        /*this.canActivate = function(){
            return authService.resolveUserPage();
        }
*/
    }

})();

/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.forgot', ['core'])
        .factory('forgotService', ['$q', 'authService', "$location", "messageService", function($q, authService, $location, messageService) {

            return {
                'forgotPassword': function(user) {
                    var defer = $q.defer();
                    authService.forgotPassword(user)
                        .then(function(res) {
                            messageService.showSuccess(res);
                            defer.resolve();
                        }, function(reason) {
                            defer.reject();
                            messageService.showFailure(reason);
                        });
                    return defer.promise;


                }
            }
        }]);

})();

/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.forgot')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ["forgotService", "$state"];

    function ForgotController(forgotService, $state) {

        /*private properties*/
        var that = this;

        /*VM functions*/
        this.forgotPassword = forgotPassword;

        this.submitting = false;

        /*VM properties*/
        this.user = {
            email: ''
        };

        /*function declarations*/
        //sends email address to get password via that email address
        function forgotPassword() {
            that.submitting = true;
            forgotService.forgotPassword(that.user)
                .then(function(res) {
                    $state.go("signin");
                    that.submitting = false;

                }, function(reason) {
                    that.submitting = false;
                });
        }
    }

})();

/**
 * Created by Shahzad on 5/23/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.createGroup', ['core', 'ngMdIcons'])
        .factory('createGroupService', ['userFirebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', '$rootScope','CollaboratorService',
            function(userFirebaseService, $location, soundService, userService, messageService, $q, $http, appConfig, $rootScope,CollaboratorService) {

                var pageUserId = userService.getCurrentUser().userID;
                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'createGroup': function(groupInfo, formDataFlag, form) {
                        groupInfo.groupID = groupInfo.groupID.toLowerCase();
                        groupInfo.groupID = groupInfo.groupID.replace(/[^a-z0-9]/g, '');
                        userFirebaseService.asyncCreateGroup(pageUserId, groupInfo, this.userData(pageUserId), formDataFlag)
                            .then(function(response) {
                                form.$submitted = false;

                                $rootScope.newImg = null
                                var unlistedMembersArray = response.unlistedMembersArray;
                                if (unlistedMembersArray.length > 0) {

                                    messageService.showSuccess("Team of Teams creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                } else {
                                    messageService.showSuccess("Team of Teams creation Successful");
                                    console.log("this User is from createSubGroupService:",userService.getCurrentUser());
                                    CollaboratorService.CreateDocument("Team Information",groupInfo.groupID,"",'Rich Text',userService.getCurrentUser())
                                    .then(function(response){
                                      CollaboratorService.addAccessUser(response.docId,groupInfo.groupID,"",pageUserId,1);
                                    });
                                }
                                $location.path('/user/' + pageUserId);
                            }, function(group) {
                                form.$submitted = false;
                                $rootScope.newImg = null;
                                messageService.showFailure("Team of Teams not created, " + " already exists");
                            })
                    },
                    'cancelGroupCreation': function(userId) {
                        //console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + pageUserId)
                    },
                    'uploadPicture': function(file, groupID) {
                        var defer = $q.defer();
                        var reader = new FileReader();
                        reader.onload = function() {

                            var blobBin = atob(reader.result.split(',')[1]);
                            var array = [];
                            for (var i = 0; i < blobBin.length; i++) {
                                array.push(blobBin.charCodeAt(i));
                            }
                            var fileBlob = new Blob([new Uint8Array(array)], {
                                type: 'image/png'
                            });


                            var data = new FormData();
                            data.append('userID', pageUserId);
                            data.append('token', userService.getCurrentUser().token);
                            data.append("source", fileBlob, file.name);

                            defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity
                            }));

                        };
                        reader.readAsDataURL(file);
                        return defer.promise;

                    },

                    'getGroupImgFromServer': function() {
                        var defer = $q.defer();
                        $http({
                                url: appConfig.apiBaseUrl + '/api/profilepicture/mmm',
                                method: "GET",
                                params: {
                                    token: userService.getCurrentUser().token
                                }
                            })
                            .then(function(data) {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    defer.resolve(reader.result)
                                };
                                reader.readAsDataURL(data.data.profilePicture);

                            })
                            .catch(function(err) {
                                defer.reject(err)
                            });

                        return defer.promise;

                    }

                };

                function Uint8ToString(u8a) {
                    var CHUNK_SZ = 0x8000;
                    var c = [];
                    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
                    }

                    return c.join("");

                }
            }
        ])

})();

(function() {
        'use strict';
        angular
            .module('app.createGroup')
            .controller('CreateGroupController', ['messageService', '$http', '$rootScope', 'firebaseService', '$firebaseObject', '$location', 'createGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', 'appConfig', '$q', CreateGroupController]);

        function CreateGroupController(messageService, $http, $rootScope, firebaseService, $firebaseObject, $location, createGroupService, userService, authService, $timeout, utilService, $mdDialog, appConfig, $q) {


            $rootScope.newImg = '';

            /*private variables*/

            var that = this;
            var user = userService.getCurrentUser();
            this.user = user;
            var fileUrl;
            var ownerImg;
            $firebaseObject(firebaseService.getRefUsers().child(userService.getCurrentUser().userID).child('profile-image'))
                .$loaded()
                .then(function(img) {
                    ownerImg = img.$value
                })


            /*VM functions*/
            this.groupPath = '';
            this.queryUsers = queryUsers;
            this.answer = answer;
            this.hide = hide;


            /*VM properties*/
            this.filteredUsers = [];
            this.group = {
                groupID: "",
                title: "",
                desc: "",
                members: "",
                membersArray: [],
                signupMode: "2",
                address: '',
                phone: ''
            };
            this.group.timeZone = getTiemZoneOffset()

            //query for users names list
            function queryUsers(val) {
                if (val) {
                    var filteredUsersRef = firebaseService.getRefUsers()
                        .orderByKey()
                        .startAt(val)
                        .endAt(val + '~');

                    that.filteredUsers = Firebase.getAsArray(filteredUsersRef);
                } else {
                    that.filteredUsers = [];
                }
            }

            //cancels create group modal
            function hide() {
                createGroupService.cancelGroupCreation();
            }



            this.saveFile = function(file, type, groupID) {
                var defer = $q.defer();

                var xhr = new XMLHttpRequest();
                xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + "&file_type=" + type);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var response = JSON.parse(xhr.responseText);
                            defer.resolve(upload_file(file, response.signed_request, response.url));
                        } else {
                            defer.reject(alert("Could not get signed URL."))
                        }
                    }
                };
                xhr.send();
                return defer.promise;
            };

            function upload_file(file, signed_request, url) {

                var defer = $q.defer();
                var xhr = new XMLHttpRequest();
                xhr.open("PUT", signed_request);
                xhr.setRequestHeader('x-amz-acl', 'public-read');
                xhr.onload = function(data) {
                    //alert(xhr.responseText);
                    if (xhr.status === 200) {
                        messageService.showSuccess('Picture uploaded....');
                        that.group.imgLogoUrl = url + '?random=' + new Date();
                        defer.resolve(url);

                    }
                };
                xhr.onerror = function(error) {
                    defer.reject(messageService.showSuccess("Could not upload file."));
                };
                xhr.send(file);
                return defer.promise;
            }


            function answer(groupForm) {
                var allowedDomain = {};
                var fromDataFlag;
                 groupForm.$submitted = true;
                //return if form has invalid model.
                if (groupForm.$invalid) {
                    return;
                }
                that.group.ownerImgUrl = ownerImg || 'https://s3-us-west-2.amazonaws.com/defaultimgs/user.png';
                that.group.members = that.group.membersArray.join();
                if (that.group.domain) {
                    that.group.allowedDomain = {};

                    var temp = that.group.domain.split(',');
                    temp.forEach(function(el, i) {
                        that.group.allowedDomain[i] = el;
                    })

                }
                if ($rootScope.newImg) {
                    var x = utilService.base64ToBlob($rootScope.newImg);
                    var temp = $rootScope.newImg.split(',')[0];
                    var mimeType = temp.split(':')[1].split(';')[0];
                    that.saveFile(x, mimeType, that.group.groupID).then(function(data) {
                            createGroupService.createGroup(that.group, fromDataFlag, groupForm);

                            // collaborator variable to identity that a New group has been created
                            $rootScope.groupIDCollaborator = that.group.groupID;

                            //$location.path('/user/' + user.userID);
                        })
                        .catch(function() {
                            groupForm.$submitted = false;
                            return messageService.showSuccess('picture upload failed')
                        });
                } else {
                    fromDataFlag = false;
                    createGroupService.createGroup(that.group, fromDataFlag, groupForm);
                    //$location.path('/user/' + user.userID);
                }

            }




            this.selectFile = function(_this) {
                var file = _this.files[0];
                //console.log(file.name);

            };

            this.signupModeDisabled = function(val) {
                return val === '3'
            };

            //Cropper Code start
            this.showAdvanced = function(ev) {
                $rootScope.tmpImg = $rootScope.newImg;
                $rootScope.newImg = '';
                $mdDialog.show({
                    controller: "DialogController as ctrl",
                    templateUrl: 'directives/dilogue1.tmpl.html',
                    targetEvent: ev,
                    escapeToClose: false
                }).then(function(picture) {
                    $rootScope.newImg = picture;
                    // console.log("this is image" + picture)
                }, function(err) {
                    // console.log(err)

                })

            };


            //Cropper Code End

            this.canActivate = function() {
                return authService.resolveUserPage();
            }


        }

        function getTiemZoneOffset() {
            return ' +' + (new Date().getTimezoneOffset() / 60) * -1 + ':' + '00';
        }

        function DialogController($mdDialog) {
            // Start Image Crop
                this.cropper = {};
                this.cropper.sourceImage = null;
                this.cropper.croppedImage   = null;
                this.bounds = {};
                this.bounds.left = 0;
                this.bounds.right = 0;
                this.bounds.top = 0;
                this.bounds.bottom = 0;
                $rootScope.newImg = this.cropper.croppedImage
            // End Image Crop
            this.my = {
                model: {
                    img: ''
                }
            };
            this.hide = function(picture) {
                //console.log(picture)
                $mdDialog.hide(picture);
            };


        }
    }

)();

/**
 * Created by Shahzad on 5/23/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.editGroup', ['core', 'ngMdIcons'])
        .factory('editGroupService', ['activityStreamService', '$timeout', '$rootScope', 'userFirebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', 'firebaseService', '$firebaseObject', '$stateParams',
            function(activityStreamService, $timeout, $rootScope, userFirebaseService, $location, soundService, userService, messageService, $q, $http, appConfig, firebaseService, $firebaseObject, $stateParams) {

                var pageUserId = userService.getCurrentUser().userID;

                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },

                    'editGroup': function(groupInfo, groupRef, form, cb) {
                        var groupNameRef = $firebaseObject(firebaseService.getRefGroupsNames().child(groupInfo.$id));
                        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                        var dataToSet = {
                            title: groupInfo.title,
                            desc: groupInfo.desc,
                            'address-title': groupInfo['address-title'],
                            address: groupInfo.address,
                            phone: groupInfo.phone,
                            timeZone: groupInfo.timeZone,
                            timestamp: firebaseTimeStamp

                        };
                        //var $groupRef = $firebaseObject(firebaseService.getRefGroups().child(groupInfo.groupID || groupInfo.$id));
                        angular.extend(groupRef, dataToSet);
                        groupRef['logo-image'].url = groupInfo['logo-image'].url;
                        groupRef.$save().then(function(response) {
                            //console.log(groupNameRef);
                            groupNameRef['address-title'] = groupInfo['address-title'];
                            groupNameRef.title = groupInfo.title;
                            groupNameRef.groupImgUrl = groupInfo['logo-image'].url;
                            groupNameRef.$save()
                                .then(function() {
                                    $timeout(function() {
                                        form.$submitted = false;
                                    });
                                    $rootScope.newImg = null;

                                    //for group activity stream record -- START --
                                    var type = 'group';
                                    var targetinfo = {id: groupInfo.$id, url: groupInfo.$id, title: groupInfo.title, type: 'group' };
                                    var area = {type: 'group-updated'};
                                    var group_id = groupInfo.$id;
                                    var memberuserID = null;
                                    //for group activity record
                                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                    //for group activity stream record -- END --

                                    cb();
                                    messageService.showSuccess('Team of Teams Edited Successfully');
                                    // CollaboratorService.CreateDocument("Team of Teams Information",groupInfo.groupID,)
                                }, function(group) {
                                    cb();
                                    messageService.showFailure("Team of Teams not edited");
                                });

                        }, function(group) {
                            $timeout(function() {
                                form.$submitted = false;
                            });
                            cb();
                            messageService.showFailure("Team of Teams not edited");
                        });
                    },

                    'cancelGroupCreation': function(groupID) {
                        //console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/group/' + groupID);
                    }
                };

                function Uint8ToString(u8a) {
                    var CHUNK_SZ = 0x8000;
                    var c = [];
                    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
                    }

                    return c.join("");

                }
            }
        ])

})();

(function() {
    'use strict';
    angular
        .module('app.editGroup')
        .controller('EditGroupController', ['messageService', '$http', '$rootScope', 'firebaseService', '$state', '$location', 'editGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', 'appConfig', '$q', '$firebaseObject', '$stateParams', EditGroupController]);

    function EditGroupController(messageService, $http, $rootScope, firebaseService, $state, $location, editGroupService, userService, authService, $timeout, utilService, $mdDialog, appConfig, $q, $firebaseObject, $stateParams) {


        $rootScope.croppedImage = {};
        //debugger;
        /*private variables*/
        var that = this;
        var user = userService.getCurrentUser();
        var groupId = $stateParams.groupID;
        this.groupId = groupId;
        $rootScope.newImg = '';
        /*VM functions*/
        this.groupPath = '';
        this.queryUsers = queryUsers;
        this.answer = answer;
        this.hide = hide;
        this.submitProgress = false;



        /*VM properties*/
        this.filteredUsers = [];
        var groupObj = $firebaseObject(firebaseService.getRefGroups().child(groupId));
        groupObj.$loaded().then(function(data) {
            $timeout(function() {

            //     console.log(data);
                that.group = data;
            //  that.group.privacy = 2;


                //debugger
            })


        })

        this.openCreateSubGroupPage = function() {
            // $location.path('/user/group/' + groupId + '/create-subgroup');
            $state.go('user.create-subgroup', {groupID: groupId})
        }
        this.openUserSettingPage = function() {
            // $location.path('/user/group/' + groupId + '/user-setting');
            $state.go('user.user-setting', {groupID: groupId})
        };
        this.subgroupPage = function() {
            // $location.path('user/group/' + groupId + '/subgroup');
            $state.go('user.subgroup', {groupID: groupId})
        }

        this.openGeoFencingPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.geo-fencing', {groupID: groupId})
        }
        this.openPolicyPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.policy', {groupID: groupId})
        }

        //query for users names list
        function queryUsers(val) {
            if (val) {
                var filteredUsersRef = firebaseService.getRefUsers()
                    .orderByKey()
                    .startAt(val)
                    .endAt(val + '~');

                that.filteredUsers = Firebase.getAsArray(filteredUsersRef);
            } else {
                that.filteredUsers = [];
            }
        }

        //cancels create group modal
        function hide() {
            editGroupService.cancelGroupCreation(groupId);


        }
        var fileUrl;

        this.saveFile = function(file, type, groupID) {
            var defer = $q.defer();

            var xhr = new XMLHttpRequest();

            //xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?file_name="+ groupID + "." + type.split('/')[1]+ "&file_type=" + type);
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + "&file_type=" + type);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(alert("Could not get signed URL."))
                    }
                }
            };
            xhr.send();
            return defer.promise;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function(data) {
                //alert(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded ....')
                    that.group['logo-image'].url = url || '';
                        //debugger
                    defer.resolve(url)
                }
            };
            xhr.onerror = function(error) {
                defer.reject(alert("Could not upload file."));
            };
            xhr.send(file);
            return defer.promise;
        }
        //answers create group modal and sends back some data modal.
        function answer(groupForm) {
            that.submitProgress = true;
            var fromDataFlag;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                return;
                that.submitProgress = false;
            }
            //that.group.members = that.group.membersArray.join();
            if (that.group.domain) {
                var temp = that.group.domain.split(',');
                that.group.domain = temp
            }
            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, that.group.$id).then(function(data) {
                    editGroupService.editGroup(that.group, groupObj, groupForm, function(){
                        that.submitProgress = false;
                    })
                })
                .catch(function() {
                    groupForm.$submitted = false;
                    that.submitProgress = false;
                    return messageService.showFailure('picture upload failed')
                });


                //console.log(x);

            } else {

                editGroupService.editGroup(that.group, groupObj, groupForm, function(){
                    that.submitProgress = false;
                })

            }


        }

        /*haseeb works*/

        this.getTiemZoneOffset = function() {
            return new Date().getTimezoneOffset().toString()
        }


        this.signupModeDisabled = function(val) {
            return val === '3'
        }

        //Cropper Code start
        this.showAdvanced = function(ev) {
            $rootScope.tmpImg = $rootScope.newImg;
            $rootScope.newImg = '';
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue1.tmpl.html',
                targetEvent: ev,
                escapeToClose: false
            }).then(function(picture) {
                $rootScope.newImg = picture;
                // console.log("this is image" + picture)
            }, function(err) {
                // console.log(err)

            })

        };


        //Cropper Code End

        /*this.canActivate  = function(){
            return authService.resolveUserPage();
        }*/



    }

})();

/**
 * Created by sj on 6/10/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.createSubGroup', ['core', 'ngMdIcons'])
        .factory('createSubGroupService', ['activityStreamService', '$firebaseArray', '$rootScope', 'groupFirebaseService', '$firebaseObject', 'firebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', 'CollaboratorService',
            function(activityStreamService, $firebaseArray, $rootScope, groupFirebaseService, $firebaseObject, firebaseService, $location, soundService, userService, messageService, $q, $http, appConfig, CollaboratorService) {
                var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                var groupAdminUsers = [];

                return {

                    'createSubGroup': function(userID, group, SubgroupInfo, subgroupList, formDataFlag, groupID, cb) {
                        //var pageUserId = userService.getCurrentUser().userID;
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.toLowerCase();
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.replace(/[^a-z0-9]/g, '');
                        groupFirebaseService.asyncCreateSubgroup(userID, group, SubgroupInfo, subgroupList, formDataFlag)
                            .then(function(response) {
                                // //form.$submitted = !form.$submitted
                                // // console.log("Group Creation Successful");
                                // var unlistedMembersArray = response.unlistedMembersArray;
                                // if (unlistedMembersArray.length > 0) {
                                //
                                //     messageService.showSuccess("Team creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                // } else {
                                //     // $location.path('/' + groupID);

                                //for group activity stream record -- START --
                                var type = 'subgroup';
                                var targetinfo = { id: SubgroupInfo.subgroupID, url: group.$id + '/' + SubgroupInfo.subgroupID, title: SubgroupInfo.title, type: 'subgroup' };
                                var area = { type: 'subgroup-created' };
                                var group_id = group.$id + '/' + SubgroupInfo.subgroupID;
                                var memberuserID = null;
                                //for group activity record
                                activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                //for group activity stream record -- END --
                                cb();
                                messageService.showSuccess("Team creation Successful...");
                                // console.log(JSON.stringify());
                                // console.log("this User is from createSubGroupService:", userService.getCurrentUser());
                                CollaboratorService.CreateDocument("Team of Teams Information", group.$id, SubgroupInfo.subgroupID, 'Rich Text', userService.getCurrentUser())
                                    .then(function(response) {
                                        CollaboratorService.addAccessUser(response.docId, group.$id, SubgroupInfo.subgroupID, userService.getCurrentUser().userID, 1);
                                    });
                                $rootScope.newImg = null;
                                // }
                            }, function(group) {
                                // form.$submitted = !form.$submitted
                                messageService.showFailure("Team not created, " + SubgroupInfo.groupID + " already exists");
                            });
                    },
                    'cancelSubGroupCreation': function(userId) {
                        console.log("SubGroup Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID);
                    },
                    'uploadPicture': function(file, groupID) {
                        var defer = $q.defer();
                        var reader = new FileReader();
                        reader.onload = function() {

                            var blobBin = atob(reader.result.split(',')[1]);
                            var array = [];
                            for (var i = 0; i < blobBin.length; i++) {
                                array.push(blobBin.charCodeAt(i));
                            }
                            var fileBlob = new Blob([new Uint8Array(array)], {
                                type: 'image/png'
                            });


                            var data = new FormData();
                            data.append('userID', pageUserId);
                            //data.append('token', $sessionStorage.loggedInUser.token);
                            data.append('token', userService.getCurrentUser().token);
                            data.append("source", fileBlob, file.name);

                            defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity
                            }));

                        };
                        reader.readAsDataURL(file);
                        return defer.promise;

                    },

                    'getGroupImgFromServer': function() {
                        var defer = $q.defer();
                        $http({
                            url: appConfig.apiBaseUrl + '/api/profilepicture/mmm',
                            method: "GET",
                            params: {
                                token: userService.getCurrentUser().token
                            }
                        })
                            .then(function(data) {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    defer.resolve(reader.result);
                                };
                                reader.readAsDataURL(data.data.profilePicture);

                            })
                            .catch(function(err) {
                                defer.reject(err);
                            });

                        return defer.promise;

                    },
                    // 'editSubgroup': function(subgroupInfo, subgroupRef, groupID, groupForm) {
                    'editSubgroup': function(subgroupInfo, subgroupRef, groupID, cb) {
                        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                        //  var dataToSet = ;
                        var dataToSet = {
                            title: subgroupInfo.title,
                            desc: (subgroupInfo.desc ? subgroupInfo.desc : ''),
                            timestamp: firebaseTimeStamp
                        };
                        if (subgroupRef) {
                            // var $subgroupRef = firebaseService.getRefSubGroups().child(groupID).child(subgroupInfo.$id);
                            angular.extend(subgroupRef, dataToSet);

                            subgroupRef.$save().then(function(response) {
                                //var subgroupNames_ = firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupInfo.$id);
                                ///subgroupNames_.set(subgroupInfo.title, function(error) { console.log(error); });

                                var subgroupNameRef = $firebaseObject(firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupInfo.$id));
                                subgroupNameRef.title = subgroupRef.title;
                                subgroupNameRef.subgroupImgUrl = subgroupInfo.imgLogoUrl || '';
                                //subgroupNameRef.ownerImgUrl = $rootScope.userImg || '';
                                subgroupNameRef.$save()
                                    .then(function() {
                                        cb();
                                        //groupForm.$submitted = false;
                                        //$rootScope.newImg = null;

                                        //update subgroup-policy
                                        firebaseService.getRefSubgroupPolicies().child(groupID).child(subgroupInfo.$id).update( { 'subgroup-title': subgroupRef.title } );

                                        //for group activity stream record -- START --
                                        var type = 'subgroup';
                                        var targetinfo = { id: subgroupInfo.$id, url: groupID + '/' + subgroupInfo.$id, title: subgroupInfo.title, type: 'subgroup' };
                                        var area = { type: 'subgroup-updated' };
                                        var group_id = groupID + '/' + subgroupInfo.$id;
                                        var memberuserID = null;
                                        //for group activity record
                                        activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                        //for group activity stream record -- END --

                                        messageService.showSuccess('Team Edited Successfully');

                                    }, function(group) {
                                        cb();
                                        messageService.showFailure("Team not edited");
                                    });
                            }, function(group) {
                                cb();
                                // groupForm.$submitted = false;
                                messageService.showFailure("Team not edited");
                            })
                        } else {
                            firebaseService.getRefSubGroups().child(groupID).child(subgroupInfo.$id).set({ title: subgroupInfo.title, timestamp: firebaseTimeStamp }, function(error) {
                                if (error) {
                                    messageService.showFailure("Team not created");
                                } else {
                                    messageService.showSuccess('Team Created Successfully');
                                }
                            });
                        }





                        /*                        $subgroupRef.update({
                         title: subgroupInfo.title,
                         desc: subgroupInfo.desc,
                         timestamp: firebaseTimeStamp,
                         'logo-image':{
                         url:subgroupInfo.imgLogoUrl, // pID is going to be changed with userID for single profile picture only
                         id: subgroupInfo.$id,
                         'bucket-name': 'test2pwow',
                         source: 1,// 1 = google cloud storage
                         mediaType: 'image/png' //image/jpeg
                         }

                         },function(error) {
                         if (error) {
                         console.log('Synchronization failed');
                         } else {
                         messageService.showSuccess("SubGroup creation Successful");
                         }
                         })*/
                    },

                    changeMemberRole: function(newType, member, groupID, subID) {
                        var defer, self, prevType,
                            errorHandler;

                        defer = $q.defer();
                        self = this;
                        prevType = member.membershipType;

                        errorHandler = function(err) {
                            defer.reject('Error occurred in accessing server.');
                        };


                        //update membership type in user memberships
                        this.asyncAddUserMembership(member.userSyncObj.$id, groupID, newType, subID)
                            .then(function() {
                                var userMem = {};
                                userMem[member.userSyncObj.$id] = {
                                    'membership-type': newType,
                                    timestamp: firebaseTimeStamp
                                };

                                //update membership type in Subgroup memberships
                                firebaseService.getRefSubGroupMembers().child(groupID).child(subID)
                                    .update(userMem, function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            defer.resolve();
                                        }
                                    });

                            }, errorHandler);



                        return defer.promise;
                    },
                    asyncAddUserMembership: function(userID, groupID, typeNum, subID) {
                        var deferred = $q.defer();
                        var timestampRef = firebaseService.getRefSubGroupMembers().child(groupID + '/' + subID + '/' + userID + '/timestamp');

                        timestampRef.once("value", function(snapshot) {
                            var timestamp = snapshot.val() || firebaseTimeStamp;
                            var userMem = {};

                            userMem[subID] = {
                                "membership-type": typeNum,
                                timestamp: timestamp
                            };

                            var userMemRef = firebaseService.getRefUserSubGroupMemberships().child(userID).child(groupID);
                            userMemRef.update(userMem, function(error) {
                                if (error) {
                                    deferred.reject();
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });

                        return deferred.promise;
                    },

                    getAdminUsers: function(groupid, subgroupid, cb) {
                        groupAdminUsers = [];
                        firebaseService.getRefSubGroupMembers().child(groupid + '/' + subgroupid).on('child_added', function(snapshot) {
                            firebaseService.getRefUsers().child(snapshot.key()).once('value', function(userData) {

                                if (snapshot.val()['membership-type'] == 1 || snapshot.val()['membership-type'] == 2) {
                                    // console.log(userData.val());
                                    // console.log(snapshot.val());
                                    groupAdminUsers.push(userData.val());
                                    cb(groupAdminUsers);
                                }

                            })
                        })
                        firebaseService.getRefSubGroupMembers().child(groupid + '/' + subgroupid).on('child_changed', function(snapshot) {
                            firebaseService.getRefUsers().child(snapshot.key()).once('value', function(userData) {
                                if (snapshot.val()['membership-type'] == 1 || snapshot.val()['membership-type'] == 2) {
                                    // console.log(userData.val());
                                    // console.log(snapshot.val());

                                    var _flag = false;
                                    groupAdminUsers.forEach(function(val, indx) {
                                        if (val.email == userData.val().email) {
                                            _flag = true;
                                        }
                                    }) //groupAdminUsers.forEach

                                    if (_flag) {
                                        cb(groupAdminUsers);
                                    } else {
                                        groupAdminUsers.push(userData.val());
                                        cb(groupAdminUsers);
                                    }
                                }

                            })
                        })
                    }, //groupAdminUsers

                    DeleteUserMemberShip: function(userID, groupID, subgroupID, submembers) {
                        // var deleteUserMemberShip = {};
                        // deleteUserMemberShip["user-subgroup-memberships/"+userID+"/"+groupID+"/"+subgroupID+"/"] = null;
                        // deleteUserMemberShip["subgroup-members/"+groupID+"/"+subgroupID+"/"+userID+"/"] = null;
                        // deleteUserMemberShip["subgroups/"+groupID+"/"+subgroupID+"/"] = {
                        //     "members-count": submembers-1
                        // };

                        // for(var x in deleteUserMemberShip){
                        //     console.log(x);
                        // }
                        // // Do a deep-path update
                        // firebaseService.getRefMain().update(deleteUserMemberShip, function(error) {
                        //     if (error) {
                        //         console.log("Error updating data:", error);
                        //     }
                        // });

                        firebaseService.getRefMain().child("user-subgroup-memberships/" + userID + "/" + groupID + "/" + subgroupID + "/").remove(function(err) {
                            // console.log(err);

                            firebaseService.getRefMain().child("subgroup-members/" + groupID + "/" + subgroupID + "/" + userID + "/").remove(function(err) {
                                // console.log(err);
                                if (!submembers) {
                                    firebaseService.getRefMain().child("subgroups/" + groupID + "/" + subgroupID + "/members-count").once('value', function(snapshot){
                                        submembers = snapshot.val();
                                        console.log('testest', submembers)
                                        firebaseService.getRefMain().child("subgroups/" + groupID + "/" + subgroupID + "/members-count").set(submembers - 1, function(err) {
                                            console.log(err);
                                        });
                                    });
                                } else {
                                    firebaseService.getRefMain().child("subgroups/" + groupID + "/" + subgroupID + "/members-count").set(submembers - 1, function(err) {
                                        // console.log(err);
                                    });
                                }



                            });
                        });



                    } //DeleteUserMemberShip
                };

                function Uint8ToString(u8a) {
                    var CHUNK_SZ = 0x8000;
                    var c = [];
                    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
                    }

                    return c.join("");

                }
            }
        ]);

})();

/**
 * Created by sj on 6/10/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.createSubGroup')
        .controller('CreateSubGroupController', ['activityStreamService', 'CollaboratorService', '$scope', 'policyService', '$firebaseArray', 'checkinService', 'subgroupFirebaseService', '$rootScope', 'messageService', '$firebaseObject', '$stateParams', 'groupFirebaseService', 'firebaseService', '$state', '$location', 'createSubGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', '$mdSidenav', '$mdUtil', '$q', 'appConfig', CreateSubGroupController])
        .controller("DialogController", ["$mdDialog", DialogController]);

    function CreateSubGroupController(activityStreamService, CollaboratorService, $scope, policyService, $firebaseArray, checkinService, subgroupFirebaseService, $rootScope, messageService, $firebaseObject, $stateParams, groupFirebaseService, firebaseService, $state, $location, createSubGroupService, userService, authService, $timeout, utilService, $mdDialog, $mdSidenav, $mdUtil, $q, appConfig) {


        $rootScope.croppedImage = {};
        //debugger;
        /*private variables*/
        var that = this;
        var user = userService.getCurrentUser();
        $rootScope.newImg = '';
        this.teamsettingpanel = false;
        var groupID = $stateParams.groupID;
        this.groupId = groupID;
        var groupData = subgroupFirebaseService.getFirebaseGroupObj(groupID);
        /*VM functions*/
        // this.searchUser = '';
        // this.processTeamAttendance =false;
        // this.showEditSubGroup = false;
        this.groupid = groupID;
        this.activeID = null;
        this.subgroupData = 0;
        this.answer = answer;
        this.hide = hide;
        this.saveFile = saveFile;
        this.upload_file = upload_file;
        this.selectedMemberArray = [];
        this.selectedAdminArray = [];
        this.membersArray = [];
        var SubgroupObj;
        this.selectedindex = undefined;
        this.selectedindex2 = 0;
        this.filterUser = filterUser;
        this.filterUser2 = filterUser2;
        this.submembers = 0;
        this.closeToggleAdmin = closeToggleAdmin;
        this.closeAdminToggler = closeAdminToggler;
        this.processingSave = false;
        this.becomeMember = [];
        this.becomeAdmin = [];
        this.memberss = {
            memberIDs: "",
            selectedUsersArray: []

        };

        this.adminSideNav = true;
        this.memberSideNav = true;

        that.groupAdmin = false;
        firebaseService.getRefUserGroupMemberships().child(user.userID).child(groupID).once('value', function (group) {
            if (group.val()['membership-type'] == 1) {
                that.groupAdmin = true;
            } else if (group.val()['membership-type'] == 2) {
                that.groupAdmin = true;
            }
        });


        this.ActiveSideNavBar = function (sideNav) {
            that.adminSideNav = true;
            that.memberSideNav = true;
            $mdSidenav(sideNav).toggle();

            /* if(sideNav === 'admin') {
                 that.adminSideNav = false;
                 that.memberSideNav = true;
             } else if(sideNav === 'member') {
                 that.adminSideNav = true;
                 that.memberSideNav = false;
             } else {
                 this.adminSideNav = true;
                 this.memberSideNav = true;
             }*/
        };

        this.createTeam = function () {
            that.subgroupData = {
                // subgroupID: "",
                // title: "",
                desc: "",
                members: "",
                membersArray: []
            };
            that.activeID = '';
            SubgroupObj = '';
            that.teamsettingpanel = true;
        };

        /*VM properties*/

        /*   this.Subgroup = {
         subgroupID: "",
         title: "",
         desc: "",
         members: "",
         membersArray: []

         };*/


        this.openUserSettingPage = function () {
            // $location.path('/user/group/' + groupID + '/user-setting');
            $state.go('user.user-setting', { groupID: groupID });
        };
        this.openEditGroup = function () {
            // $location.path('user/group/' + groupID + '/edit-group');
            $state.go('user.edit-group', { groupID: groupID })
        };
        this.openGeoFencingPage = function () {
            // $location.path('/user/group/' + groupID + '/geoFencing');
            $state.go('user.geo-fencing', { groupID: groupID })
        };
        this.subgroupPage = function () {
            // $location.path('user/group/' + this.groupid + '/subgroup');
            $state.go('user.subgroup', { groupID: groupID });
        };
        this.openPolicyPage = function () {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.policy', { groupID: groupID });
        };


        this.veiwSubgroup = function (subgroupData, index) {
            var once = true;

            // this.showEditSubGroup = true;
            // that.showTeamAttendace = false;
            that.selectedindex = index;
            that.activeID = subgroupData.$id;
            that.activeSubgroupTitle = subgroupData.title;

            //will become a member array, for use on Save button
            that.becomeMemmber = [];
            that.becomeAdmin = [];

            //load user Admins
            loadAdminUSers(this.groupid, that.activeID, function () {
                subgroupFirebaseService.getSubgroupSyncObjAsync(groupID, that.activeID, user.userID)
                    .then(function (syncObj) {
                        that.subgroupSyncObj = syncObj;
                        // console.log(syncObj);
                        //console.log(data === obj); // true
                        // $scope.subgroupSyncObj.subgroupSyncObj.$bindTo($scope, "subgroup");
                        that.submembers = that.subgroupSyncObj.membersSyncArray;
                        // $timeout(function() {
                        // $scope.subgroups = $scope.subgroupSyncObj.subgroupsSyncArray;
                        //$scope.pendingRequests = $scope.subgroupSyncObj.pendingMembershipSyncArray;
                        //$scope.activities = $scope.subgroupSyncObj.activitiesSyncArray;
                        //$scope.groupMembersSyncArray = $scope.subgroupSyncObj.groupMembersSyncArray;
                        SubgroupObj = $firebaseObject(firebaseService.getRefSubGroups().child(groupID).child(that.activeID));
                        // console.log(1)
                        // console.log(SubgroupObj)
                        SubgroupObj.$loaded().then(function (data) {
                            that.subgroupData = data;
                            //that.group.groupID = data.$id;
                            that.img = data['logo-image'] && data['logo-image'].url ? data['logo-image'].url : '';

                            if (once) {
                                that.teamsettingpanel = true;
                                once = false;
                            }

                            firebaseService.getRefMain().child('subgroup-policies').child(groupID).child(that.activeID).on('value', function (snaphot) {
                                that.subgroupPolicy = snaphot.val() ? snaphot.val()['policy-title'] : false;
                            });
                            // },50000)
                            // console.log(2)
                            // console.log(SubgroupObj)
                        });
                    });
            });
        };

        //cancels create group modal
        function hide() {
            /*   createGroupService.cancelGroupCreation();*/
            /* $mdDialog.cancel();*/
            $rootScope.newImg = null;
            // $location.path('/user/group/' + groupID);
            $state.go('user.group', { groupID: groupID });

        }


        this.showAdvanced = function (ev) {
            $rootScope.tmpImg = $rootScope.newImg;
            $rootScope.newImg = '';
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue2.tmpl.html',
                targetEvent: ev,
                escapeToClose: false
            }).then(function (picture) {
                $rootScope.newImg = picture;
                //console.log("this is image" + picture)
            }, function (err) {
                //console.log(err)

            });

        };


        groupFirebaseService.getGroupSyncObjAsync(groupID, user.userID)
            .then(function (syncObj) {
                $timeout(function () {

                    that.groupSyncObj = syncObj;
                    // that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                    that.group = that.groupSyncObj.groupSyncObj;
                    that.members = that.groupSyncObj.membersSyncArray;
                    that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                    that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                    that.activities = that.groupSyncObj.activitiesSyncArray;
                    // that.veiwSubgroup(that.subgroups[0])
                    // console.log(that.subgroups)
                });


            });

        this.assignMemberClick = function () {
            that.members.forEach(function (val, index) {
                //if is member
                if (that.submembers.length > 0) {
                    for (var i = 0; i < that.submembers.length; i++) {
                        that.members[index].isMember = false;
                        that.members[index].isAdmin = false;
                        if (val.userID === that.submembers[i].userID) {
                            that.members[index].isMember = true;
                            that.members[index].isAdmin = (that.members[index].membershipType == 1 || that.members[index].membershipType == 2) ? true : false;
                            break;
                        }
                    }
                }
                //if is admin member
                if (that.selectedAdminArray.length > 0) {
                    for (var i = 0; i < that.selectedAdminArray.length; i++) {
                        if (val.user.profile.email === that.selectedAdminArray[i].email) {
                            that.members[index].isAdmin = true;
                            break;
                        }
                    }
                }
            }); //that.members.forEach

            //if in becomeMember then show white class for arrow on sidenav
            if (that.becomeMember.length > 0) {
                that.becomeMember.forEach(function (val, i) {
                    for (var x = 0; x <= that.members.length; x++) {
                        if (that.members[x].userID == val.$id) {
                            that.members[x].isMember = true;
                            break;
                        }
                    }
                });
            }
        };

        this.afterSelectMember = function (id) {
            var _flag = false;
            that.members.forEach(function (val, index) {
                // console.log('that.members', val)
                if (_flag) {
                    return;
                }

                if (id === val.userID) {
                    //if is member
                    if (that.becomeMember.length > 0) {
                        for (var i = 0; i < that.becomeMember.length; i++) {
                            if (id == that.becomeMember[i].$id) {
                                that.members[index].isMember = true;
                                _flag = true;
                                break;
                            }
                        }
                    }
                }

            }); //that.members.forEach
        };

        this.afterSelectAdmin = function (email) {
            var _flag = false;
            that.members.forEach(function (val, index) {
                if (_flag) {
                    return false;
                }
                if (email == val.user.profile.email) {
                    //if is admin member
                    if (that.becomeAdmin.length > 0) {
                        for (var i = 0; i < that.becomeAdmin.length; i++) {
                            // console.log('that.becomeAdminmembers', that.becomeAdmin[i])
                            if (email === that.becomeAdmin[i].member.user.profile.email && email === val.user.profile.email) {
                                that.members[index].isAdmin = true;
                                _flag = true;
                                break;
                            }
                        }
                    }
                }
            }); //that.members.forEach
        };

        this.selectedMember = function (userObj, index) {
            var _flag = true;
            //if(that.memberss.length > 0) {
            that.becomeMember.forEach(function (val, i) {
                console.log(val);
                if (val == userObj) {

                    for (var x = 0; x <= that.members.length; x++) {
                        if (that.members[x].userID == val.$id) {
                            that.members[x].isMember = true;
                            break;
                        }
                    }

                    _flag = false;
                }
            });//checking if userobj is exists or not
            //}

            if (that.submembers.length > 0) {
                that.submembers.forEach(function (val, inx) {
                    if (val.userID == userObj.$id) {
                        _flag = false;
                    }
                });
            }

            if (_flag) {
                for (var x = 0; x <= that.members.length; x++) {
                    if (that.members[x].userID == userObj.$id) {
                        that.members[x].isMember = true;
                        //console.log(that.members[x]['user']['profile']['profile-image']);
                        userObj['profile-image'] = that.members[x]['user']['profile']['profile-image'] || '';
                        break;
                    }
                }

                that.becomeMember.push(userObj);
                that.memberss.selectedUsersArray.push(userObj.$id);
                that.memberss.memberIDs = that.memberss.selectedUsersArray.join();
                var membersArray = that.memberss.memberIDs.split(',');

                //after add in  becomeMember chnage arrow css
                that.afterSelectMember(userObj.$id);
            }
        };




        // this.checkingIsSelectedMember = function(mmbrid) {
        //     that.becomeMember.forEach(function(val,index){
        //         console.log('val', val.$id, mmbrid);
        //         if(mmbrid === val.$id){
        //             console.log('trrrrrrue');
        //             return true;
        //         }
        //     });
        //     return false;
        // };

        this.selectedMemberSave = function () {
            if (that.becomeMember.length > 0) {
                var membersIDarray = [];    //for policy
                that.becomeMember.forEach(function (userObj, index) {

                    var subgroupObj = angular.extend({}, that.subgroupSyncObj.subgroupSyncObj, {
                        groupID: groupID,
                        subgroupID: that.activeID
                    });

                    //for coluser checking
                    saveMemberToFirebase(user, subgroupObj, that.memberss.memberIDs, that.subgroupSyncObj.membersSyncArray, groupData);

                    //for activity Stream Array
                    //now checking is user is also exist in selectedAdminList then not publish activity stream by member
                    var _flag_notInBecomeAdminArray = true;
                    if (that.becomeAdmin.length > 0) {
                        that.becomeAdmin.forEach(function (val, index) {
                            if (val.member.user.profile == userObj.$id) {
                                _flag_notInBecomeAdminArray = false;
                            }
                        });
                    }
                    //publish activity Stream
                    if (_flag_notInBecomeAdminArray) {        //if not exists in becomeAdminArray then publish activity as member
                        userActivityStreamOnAddMemberOrAdmin(userObj, subgroupObj, true, false);
                    }
                    //for activity Stream Array

                    membersIDarray.push(userObj.$id);

                    //checking if team has policy then assigned policy to member
                    if (that.becomeMember.length == index + 1) {
                        policyService.assignTeamPolicyToMultipleMembers(membersIDarray, groupID, that.activeID, function (result, msg) {

                        });
                    }

                }); //that.becomeMember.forEach
            } //if
        }; //this.selectedMemberSave

        function saveMemberToFirebase(user, subgroupObj, memberIDs, membersSyncArray, groupData) {
            subgroupFirebaseService.asyncUpdateSubgroupMembers(user, subgroupObj, memberIDs, membersSyncArray, groupData)


                // .then(function(response) {
                //     // console.log("Adding Members Successful");
                //     var unlistedMembersArray = response.unlistedMembersArray,
                //         notificationString;
                //
                //     if (unlistedMembersArray.length && unlistedMembersArray.length === membersArray.length) {
                //         notificationString = 'Adding Members Failed ( ' + unlistedMembersArray.join(', ') + ' ).';
                //         messageService.showFailure(notificationString);
                //     } else if (unlistedMembersArray.length) {
                //         notificationString = 'Adding Members Successful, except ( ' + unlistedMembersArray.join(', ') + ' ).';
                //         messageService.showSuccess(notificationString);
                //     } else {
                //         notificationString = 'Adding Members Successful.';
                //         console.log("SubgroupObj",subgroupObj); //subgroupID
                //         console.log("groupObj",groupData); // $id
                //         var members = memberIDs.split(',');
                //         for (var i = 0; i < members.length; i++) {
                //           CollaboratorService.addAccessUser(CollaboratorService.getCurrentDocumentId(),groupData.$id,subgroupObj.subgroupID,members[i]);
                //         }
                //         messageService.showFailure(notificationString);
                //     }
                // }, function(reason) {
                //     messageService.showFailure(reason);
                // }); // subgroupFirebaseService.asyncUpdateSubgroupMembers

                .then(function (response) {
                    // console.log("Adding Members Successful");
                    var unlistedMembersArray = response.unlistedMembersArray,
                        notificationString;

                    if (unlistedMembersArray && that.membersArray && unlistedMembersArray.length === that.membersArray.length) {
                        // notificationString = 'Adding Members Failed ( ' + unlistedMembersArray.join(', ') + ' ).';
                        notificationString = 'AAdding Members Successful.';
                        messageService.showFailure(notificationString);
                    } else if (unlistedMembersArray.length) {
                        notificationString = 'Adding Members Successful, except ( ' + unlistedMembersArray.join(', ') + ' ).';
                        messageService.showSuccess(notificationString);
                    } else {
                        notificationString = 'Adding Members Successful.';
                        messageService.showFailure(notificationString);
                    }
                }, function (reason) {
                    messageService.showFailure(reason);
                }); // subgroupFirebaseService.asyncUpdateSubgroupMembers


        }

        this.selectedAdmin = function (newType, member) {
            var obj = { type: newType, member: member };
            var _flag = true;

            //if(that.memberss.length > 0) {
            that.becomeAdmin.forEach(function (val, i) {
                if (val.member == member) {
                    _flag = false;
                }
            }); //checking if admin is exists or not
            //}

            if (that.selectedAdminArray.length > 0) {
                that.selectedAdminArray.forEach(function (val, i) {
                    if (val == member.user.profile.email) {
                        _flag = false;
                    }
                });
            }

            if (_flag) {
                that.becomeAdmin.push(obj);

                //after add in  becomeMember chnage arrow css
                this.afterSelectAdmin(obj.member.user.profile.email);
            }
        };

        function OnCreateAddAdmin(subgroupid, cb) {
            //SUBGROUPS => members - count,

            var subgroupAdmin = { 'membership-type': 2, 'timestamp': Firebase.ServerValue.TIMESTAMP };
            var subgroupOwner = { 'membership-type': 1, 'timestamp': Firebase.ServerValue.TIMESTAMP };
            var membersLength = 0;
            var updateObject = {};

            var groupMembers = activityStreamService.getCurrentUserGroups();
            var gMembers = groupMembers[groupID]['users'];
            for (var member in gMembers) {
                if (user.userID !== member) {   // checking if this is not active user
                    if (gMembers[member]['membership-type'] === 1) {
                        for (var i = 0; i <= that.members.length; i++) {
                            if (that.members[i]["userID"] === member) {
                                updateObject['subgroup-members/' + groupID + '/' + subgroupid + '/' + member] = subgroupOwner;
                                updateObject['user-subgroup-memberships/' + member + '/' + groupID + '/' + subgroupid] = subgroupOwner;

                                membersLength++;
                                break;
                            }
                        }
                    } else if (gMembers[member]['membership-type'] === 2) {
                        for (var j = 0; j <= that.members.length; j++) {
                            if (that.members[j]["userID"] === member) {
                                updateObject['subgroup-members/' + groupID + '/' + subgroupid + '/' + member] = subgroupAdmin;
                                updateObject['user-subgroup-memberships/' + member + '/' + groupID + '/' + subgroupid] = subgroupAdmin;
                                membersLength++;
                                break;
                            }
                        }
                    }
                } // if not active user
            } // for in

            var ref = firebaseService.getRefMain();
            ref.update(updateObject, function (err) {
                if (!err) {
                    ref.child('subgroups').child(groupID).child(subgroupid).once('value', function (snapshot) {
                        var count = snapshot.val()['members-count'];
                        ref.child('subgroups').child(groupID).child(subgroupid).update({ 'members-count': count + membersLength });
                    });
                }
            });

            cb();

        } // OnCreateAddAdmin

        this.selectedAdminSave = function () {
            if (that.becomeAdmin.length > 0) {
                var membersIDarray = [];    //for policy
                that.becomeAdmin.forEach(function (val, index) {

                    var subgroupObj = angular.extend({}, that.subgroupSyncObj.subgroupSyncObj, {
                        groupID: groupID,
                        subgroupID: that.activeID
                    });

                    //for coluser checking
                    saveAdminToFirebase(val.type, val.member, groupID, that.activeID, subgroupObj);

                    membersIDarray.push(val.member.userID);
                    //checking if team has policy then assigned policy to member
                    if (that.becomeMember.length == index + 1) {
                        policyService.assignTeamPolicyToMultipleMembers(membersIDarray, groupID, that.activeID, function (result, msg) {

                        });
                    }
                }); //that.becomeMember.forEach
            } //if
        }; // selectedAdminSave

        function saveAdminToFirebase(newType, member, groupID, activeID, subgroupObj) {
            createSubGroupService.changeMemberRole(newType, member, groupID, activeID).then(function () {
                messageService.showSuccess("New Admin selected");
                //publish activity Stream
                $timeout(function () {
                    userActivityStreamOnAddMemberOrAdmin(member.user.profile, subgroupObj, false, true);
                }, 1000);
            }, function (reason) {
                messageService.showFailure(reason);
            });
        }

        function userActivityStreamOnAddMemberOrAdmin(userObj, subgroupObj, isMember, isAdmin) {
            var areaType;

            if (isMember) {
                areaType = 'subgroup-member-assigned';
            }

            if (isAdmin) {
                areaType = 'subgroup-admin-assigned';
            }

            //publish an activity stream record -- START --
            var type = 'subgroup';
            var targetinfo = { id: subgroupObj.$id, url: groupID + '/' + subgroupObj.$id, title: subgroupObj.title, type: 'subgroup' };
            var area = { type: areaType };
            var group_id = groupID + '/' + subgroupObj.$id;
            var memberuserID = userObj.$id;
            //for group activity record
            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
            //for group activity stream record -- END --

        } // userActivityStreamOnAddMemberOrAdmin

        this.deleteAdminMember = function (admin) {
            var adminMemberId = '';
            //    that.submembers.forEach(function(val,indx){
            //         if(val.userSyncObj.email == admin.userSyncObj.email && val.membershipType != 1){
            createSubGroupService.DeleteUserMemberShip(admin.userSyncObj.$id, groupID, that.activeID, that.submembers.length);

            console.log('watch', true)
            for (var i = 0; i < that.members.length; i++) {
                if (that.members[i].userID === admin.userID) {
                    console.log('watch', that.members[i]);
                    that.members[i].isAdmin = false;
                    that.members[i].isMember = false;
                    console.log('watch', that.members[i]);
                }
            }

            //publish an activity stream record -- START --
            var type = 'subgroup';
            var targetinfo = { id: that.activeID, url: groupID + '/' + that.activeID, title: that.activeSubgroupTitle, type: 'subgroup' };
            var area = { type: 'subgroup-admin-removed' };
            var group_id = groupID + '/' + that.activeID;
            var memberuserID = admin.userSyncObj.$id;
            //for group activity record
            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
            //for group activity stream record -- END --

            // }
            //    });  //that.submembers.forEach

            //    that.selectedAdminArray.forEach(function(val, indx){
            //         if(val.email == admin.email && val.membershipType != 1){
            //             that.selectedAdminArray.splice(indx, 1);
            //         }
            //    });

        };

        this.deleteMember = function (userID) {
            createSubGroupService.DeleteUserMemberShip(userID, groupID, that.activeID, that.submembers.length);

            //publish an activity stream record -- START --
            var type = 'subgroup';
            var targetinfo = { id: that.activeID, url: groupID + '/' + that.activeID, title: that.activeSubgroupTitle, type: 'subgroup' };
            var area = { type: 'subgroup-member-removed' };
            var group_id = groupID + '/' + that.activeID;
            var memberuserID = userID;
            //for group activity record
            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
            //for group activity stream record -- END --
        };

        function loadAdminUSers(groupid, subgroupid, cb) {
            createSubGroupService.getAdminUsers(groupid, subgroupid, function (data) {
                that.selectedAdminArray = data;
                cb();
            });
        }


        function filterUser(userID) {
            var disableItem = false;
            for (var i = 0; i < that.submembers.length; i++) {
                if (userID === that.submembers[i].userID) {
                    disableItem = true;
                } else if (that.membersArray.indexOf(userID) >= 0) {
                    disableItem = true;
                }
            }
            return disableItem;
        }

        function filterUser2(email) {
            // console.log(that.selectedAdminArray[0].email);
            var disableItem = false;
            if (that.selectedAdminArray && that.selectedAdminArray.length > 0) {
                for (var i = 0; i < that.selectedAdminArray.length; i++) {
                    if (email === that.selectedAdminArray[i].email) {
                        disableItem = true;
                    }

                }
            }
            return disableItem;
        }

        function answer(groupForm) {

            that.processingSave = true;
            var userObj = activityStreamService.getCurrentUserGroups();
            var memberType = userObj[this.groupId]['membership-type']

            var fromDataFlag;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                that.processingSave = false;
                return;
            }
            //if ($rootScope.croppedImage && $rootScope.croppedImage.src) {
            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, groupID, that.subgroupData.$id).then(function (data) {
                    // console.log('subgroup img  uploaded ' + data)
                    // console.log(3)
                    //console.log(SubgroupObj)

                    if (SubgroupObj) {
                        //edit team
                        SubgroupObj['logo-image'].url = data;
                        that.selectedMemberSave();
                        that.selectedAdminSave();
                        createSubGroupService.editSubgroup(that.subgroupData, SubgroupObj, groupID, function () {
                            that.processingSave = false;
                            that.teamsettingpanel = false;
                            that.selectedindex = undefined;
                        });
                    } else {
                        // create team
                        that.subgroupData.imgLogoUrl = data;
                        createSubGroupService.createSubGroup(user.userID, groupData, that.subgroupData, that.subgroups, fromDataFlag, groupID, function () {
                            OnCreateAddAdmin(that.subgroupData.subgroupID, function () {
                                that.teamsettingpanel = false;
                                that.selectedindex = undefined;
                            });
                        });
                        that.processingSave = false;
                    } // else
                    // $rootScope.newImg=null;
                })
                    .catch(function (err) {
                        // return alert('picture upload failed' + err)
                        that.processingSave = false;
                        that.teamsettingpanel = false;

                        return messageService.showFailure('picture upload failed' + err);
                    });
                // console.log(x);
            } else {
                fromDataFlag = false;
                if (SubgroupObj) {
                    //edit team
                    that.selectedMemberSave();
                    that.selectedAdminSave();
                    createSubGroupService.editSubgroup(that.subgroupData, SubgroupObj, groupID, function () {
                        that.processingSave = false;
                        that.teamsettingpanel = false;
                        that.selectedindex = undefined;
                    });
                } else {
                    // create team
                    createSubGroupService.createSubGroup(user.userID, groupData, that.subgroupData, that.subgroups, fromDataFlag, groupID, function () {
                        console.log(that.subgroupData);
                        OnCreateAddAdmin(that.subgroupData.subgroupID, function () {
                            that.teamsettingpanel = false;
                            that.selectedindex = undefined;
                        });
                    });
                    that.processingSave = false;
                } // else
            }
        }

        function saveFile(file, type, groupID, subgroupid) {
            var defer = $q.defer();
            //if(!that.group.groupID)return alert('Pleas provide group url firstt');
            //var groupID= that.group.groupID;
            var xhr = new XMLHttpRequest();

            //xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?file_name="+ groupID + '_' + that.subgroupData.$id + "." + type.split('/')[1]+ "&file_type=" + type);
            // console.log(groupID, subgroupid);
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savesubgroupprofilepicture?groupID=" + groupID + '&subgroupID=' + subgroupid + "&file_type=" + type);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {

                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(that.upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(essageService.showFailure("Could not get signed URL."));
                    }
                }
            };
            xhr.send();
            return defer.promise;
        }


        //Cropper Code start
        // this.showAdvanced = function(ev) {
        //     $rootScope.tmpImg = $rootScope.newImg;
        //     $rootScope.newImg = '';
        //     $mdDialog.show({
        //         controller: "DialogController",
        //         controllerAs: "ctrl",
        //         templateUrl: 'directives/dilogue1.tmpl.html',
        //         targetEvent: ev
        //     }).then(function(picture) {
        //         $rootScope.newImg = picture;
        //         // console.log("this is image" + picture)
        //     }, function(err) {
        //         //console.log(err)
        //
        //     })
        //
        // };


        //Cropper Code End

        this.canActivate = function () {
            return authService.resolveUserPage();
        };


        // side navigation

        this.toggleRight = buildToggler('right');
        this.toggleAdmin = AdminToggler('rights');

        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        // console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFn;
        }

        function AdminToggler(navID) {
            var debounceFnc = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        // console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFnc;
        }

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function (data) {
                // alert(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....');
                    // console.log(url);
                    //document.getElementById("preview").src = url;
                    // that.subgroupData.imgLogoUrl = url;
                    defer.resolve(url + '?random=' + new Date());
                    //document.getElementById("avatar_url").value = url;
                }
            };
            xhr.onerror = function (error) {
                defer.reject(messageService.showSuccess('Could not upload file.'));
            };
            xhr.send(file);
            return defer.promise;
        }

        that.OwnerRef = $firebaseObject(firebaseService.getRefGroups().child(groupID))
            .$loaded()
            .then(function (groupData) {

                if (groupData['group-owner-id']) {
                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                    that.picRef = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']) /*.child('profile-image')*/)
                        .$loaded()
                        .then(function (userData) {

                            that.userObj = userData;

                        });

                }
            });

        function closeAdminToggler() {
            $mdSidenav('rights').close()
                .then(function () {
                    // console.log("close LEFT is done");
                });
        }

        function closeToggleAdmin() {
            $mdSidenav('right').close()
                .then(function () {
                    // console.log("close LEFT is done");
                });
        }
    }

    function DialogController($mdDialog) {
        this.my = {
            model: {
                img: ''
            }
        };
        this.openFileSelect = function () {
            angular.element('#ImageUpload').click();
        };
        this.hide = function (picture) {
            // console.log("dialog box pic" + picture)
            $mdDialog.hide(picture);
        };
    }
})();

/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular.module('app.JoinGroup', ['core'])
        .factory('joinGroupService', ['activityStreamService', '$timeout', '$firebaseArray', 'userFirebaseService', '$location', 'soundService', 'userService', "messageService", 'firebaseService', '$q', 'authService',
            function(activityStreamService, $timeout, $firebaseArray, userFirebaseService, $location, soundService, userService, messageService, firebaseService, $q, authService) {
                var user = userService.getCurrentUser();
                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'canActivate': function() {
                        return authService.resolveUserPage();
                    },
                    'joinGroupRequest': function(groupInfo, cb) {
                        groupInfo.groupID = groupInfo.groupID.toLowerCase().replace(/[^a-z0-9]/g, '');
                            //userFirebaseService.asyncGroupJoiningRequest($sessionStorage.loggedInUser.userID, groupInfo.groupID, groupInfo.message)
                        userFirebaseService.asyncGroupJoiningRequest(userService.getCurrentUser().userID, groupInfo.groupID, groupInfo.message, groupInfo.subgroupID, groupInfo.subgrouptitle, groupInfo.membershipNo)
                            .then(function() {
                                //console.log("Group join request sent successfully");
                                if(groupInfo.subgroupID){
                                    //for group activity stream record -- START --
                                    var type = 'subgroup';
                                    var targetinfo = {id: groupInfo.subgroupID, url: groupInfo.subgroupID, title: groupInfo.subgrouptitle, type: 'subgroup' };
                                    var area = {type: 'subgroup-join'};
                                    var group_id = groupInfo.groupID +'/'+ groupInfo.subgroupID;
                                    var memberuser_id = user.userID;
                                    //for group activity record
                                    console.log('groupInfo.groupID groupInfo.subgroupID: ', groupInfo.groupID +'/'+ groupInfo.subgroupID);
                                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuser_id);
                                    //for group activity stream record -- END --

                                    cb();
                                    messageService.showSuccess("Team of Teams and Team joining request sent successfully");
                                } else{
                                    //for group activity stream record -- START --
                                    var _type = 'group';
                                    var _targetinfo = {id: groupInfo.groupID, url: groupInfo.groupID, title: groupInfo.grouptitle, type: 'group' };
                                    var _area = {type: 'group-join'};
                                    var _group_id = groupInfo.groupID;
                                    var _memberuser_id = user.userID;
                                    //for group activity record
                                    console.log('groupInfo.groupID: ', groupInfo.groupID);
                                    activityStreamService.activityStream(_type, _targetinfo, _area, _group_id, _memberuser_id);
                                    //for group activity stream record -- END --

                                    cb();
                                    messageService.showSuccess("Team of Teams joining request sent successfully");

                                }

                            }, function(reason) {
                                //console.log("Unable to send group joining request");
                                cb();
                                messageService.showFailure(reason);
                            })
                    },
                    'groupQuery': function() {

                        return firebaseService.getRefGroupsNames()
                            .orderByKey()
                            .startAt(val)
                            .endAt(val + '~');

                    },
                    'cancelGroupJoining': function() {
                        //console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)
                    }
                }
            }
        ]);

})();

(function() {
    'use strict';

    angular
        .module('app.JoinGroup')
        .controller('JoinGroupController', ['dataService', 'userService', 'joinGroupService', 'firebaseService', 'authService', '$firebaseObject', '$firebaseArray',
            function(dataService, userService, joinGroupService, firebaseService, authService, $firebaseObject, $firebaseArray) {
                // var $scope = this;
                //https://github.com/angular/material/issues/547#issuecomment65620808

                /*private variables*/
                var that = this;
                this.filteredGroups = [];
                this.loadingData = true;
                this.user = userService.getCurrentUser();

                // firebaseService.getRefGroups().on('child_added', function (snapshot) {
                //     that.filteredGroups.push(snapshot.val());
                // });
                /*listing groups*/
                // this.listgroup;
                //this.groupOne = $firebaseObject(firebaseService.getRefGroupsNames());
                // this.filteredGroups = dataService.getTotalGroups();
                $firebaseArray(firebaseService.getRefGroupsNames()).$loaded().then(function(data){
                    that.filteredGroups = data;
                    that.loadingData = false;
                });

                // $firebaseArray(firebaseService.getRefGroups()).$loaded().then(function(data){
                //     that.filteredGroups = data;
                //     that.loadingData = false;
                // });
                // this.groupOne.$loaded().then(function(data) {
                //     if (data) {
                //         //console.log(data);
                //     }

                // }).catch(function(err) {
                //     console.log(err);
                // });

                // $scope.clear = function() {
                //     if ($scope.listgroup == 0) {

                //         $scope.listgroup = $scope.groupOne;
                //     }
                //     console.log($scope.listgroup);
                // };

                // $scope.listgroup = this.groupOne;
                // console.log( $scope.listgroup);


                /*VM functions*/
                // $scope.queryGroups = queryGroups;
                this.answer = answer;
                this.hide = hide;

                /*VM properties*/
                this.message = {};
                this.membershipNo = [];
                this.group = {
                    groupID: "",
                    message: "Please add me in your Team.",
                    membershipNo: ""
                };



//                this.uImg = ['washedout.png', 'PanacloudLogoForList.svg', 'citibankLogo.svg', 'habibBankLogo.svg', 'washedout.png', 'PanacloudLogoForList.svg', 'citibankLogo.svg', 'habibBankLogo.svg', 'habibBankLogo.svg'];
/*
                function loadAllGroups() {
                    $scope.filteredGroups = Firebase.getAsArray(firebaseService.getRefGroupsNames().orderByKey());
                    // console.log($scope.filteredGroups)
                }

*/
                // loadAllGroups();



/*
                //query for groups names list
                function queryGroups() {
                    if ($scope.search) {
                        var filteredGroupsNamesRef = firebaseService.getRefGroupsNames()
                            .orderByKey()
                            .startAt($scope.search)
                            .endAt($scope.search + '~');

                        $scope.filteredGroups = Firebase.getAsArray(filteredGroupsNamesRef);
                        // console.log($scope.filteredGroups);
                        /*$scope.filteredGroups.forEach(function(el,i){

                                                                 var j = i
                                                                 $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                                                                     .$loaded()
                                                                     .then(function(groupData){
                                                                         $scope.filteredGroups[j].groupImg = groupData['logoimage']? groupData['logoimage'].url:""
                                                                         if(groupData['groupownerid']){
                                                                             $firebaseObject(firebaseService.getRefUsers().child(groupData['groupownerid']).child('profileimage'))
                                                                                 .$loaded()
                                                                                 .then(function(img){
                                                                                     $scope.filteredGroups[j].ownerImg = img.$value
                                                                                 })

                                                                         }
                                                                     });
                                                             })*/
/*                        $scope.filteredGroups.forEach(function(el, i) {
                            var j = i;
                            $firebaseObject(firebaseService.getRefGroupsNames().child(el.$id))
                                .$loaded().then(function(gNames) {
                                    // console.log($scope.filteredGroups[j]);
                                    // $scope.filteredGroups[j].groupImg = gNames.groupImgUrl;
                                    // $scope.filteredGroups[j].ownerImg = gNames.ownerImgUrl;
                                });
                        });

                    } else {
                        // $scope.filteredGroups = [];
                        loadAllGroups();
                    }

                    return $scope.filteredGroups;
                }

*/
                //cancels join/subscribe group modal
                function hide() {
                    joinGroupService.cancelGroupJoining();
                }

                //answers join/subscribe group modal and sends back some data modal.
                function answer(group) {
                    that.loadingData = true;
                    that.group.message = that.message[group.$id] || that.group.message;
                    that.group.membershipNo = that.membershipNo[group.$id] || that.group.membershipNo;
                    that.group.groupID = group.$id;
                    that.group.grouptitle = group.title;

                    joinGroupService.joinGroupRequest(that.group, function(){
                        that.loadingData = false;
                    });
                }

/*
                this.validator = function(form) {
                    if ((this.selectedItem && this.selectedItem.$id) && form.$valid) {
                        return false
                    } else {
                        return true;
                    }

                };

*/
                /*
                 this.canActivate = function () { // this function automatically gets called by newRouter  for  route Resolution  before controller creation
                     return joinGroupService.canActivate()
                 }
                 */
            }
        ]);
})();

/*
 * Created by Shahzad on 5/23/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.personalSettings', ['core'])
        .factory('personalSettingsService', ['soundService', '$location', 'userService',
            function(soundService, $location, userService) {

                return {

                    'cancelPersonalSettings': function(userId) {
                        //console.log("Personal Settings Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)

                    }
                }

            }
        ])

})();

<!--waste-->


(function() {
    'use strict';

    angular.module('app.personalSettings')
        .controller('PersonalSettingsController', ['activityStreamService', 'dataService', '$state', '$location', 'personalSettingsService', '$rootScope', '$mdDialog', '$firebaseArray', 'firebaseService', 'userService', 'utilService', '$q', 'appConfig', '$firebaseObject', '$http', 'authService', '$timeout', 'messageService',

            function(activityStreamService, dataService, $state, $location, personalSettingsService, $rootScope, $mdDialog, $firebaseArray, firebaseService, userService, utilService, $q, appConfig, $firebaseObject, $http, authService, $timeout, messageService) {

                /*Private Variables*/
                var that = this;
                var firstName, lastName;

                /*VM Properties*/
                this.showAdvanced = showAdvanced;
                this.answer = answer;
                this.hide = hide;
                this.loggedInUserData = userService.getCurrentUser();
                $rootScope.newImg = '';
                this.isProcessing = false;
                this.userData = $firebaseObject(firebaseService.getRefUsers().child(this.loggedInUserData.userID))
                this.userData.$loaded()
                    .then(function(data) {
                        firstName = data.firstName;
                        lastName = data.lastName;
                        // console.log(data)
                    })
                    .catch(function(err) {
                        console.log(err)
                    })

                /*VM Functions*/
                function answer(perSettingForm) {
                    if(Object.keys(perSettingForm.$error).length > 0) return;
                    that.isProcessing = true;
                    var uploadFile, editUser, changePassword, data1, data2, pFlag, eFlag, imgFlag;
                    var promiseArray = [];
                    /*  if (perSettingForm.$invalid) {
                          return;
                      }*/
                      perSettingForm.$submitted = true;
                    function saveDataToServer() {
                        if (that.userData.firstName != firstName || that.userData.lastName != lastName) {
                            data1 = {
                                userID: that.userData.$id,
                                token: userService.getCurrentUser().token,
                                firstName: that.userData['firstName'],
                                lastName: that.userData['lastName']
                            };
                            eFlag = true;
                            editUser = $http.post(appConfig.apiBaseUrl + '/api/edituser', data1);
                        }

                        if (that.userData.oldPassword && that.userData.newPassword && that.userData.oldPassword != that.userData.newPassword) {
                            data2 = {
                                userID: that.userData.$id,
                                password: that.userData.oldPassword,
                                newPassword: that.userData.newPassword
                            };
                            pFlag = true;
                            changePassword = $http.post(appConfig.apiBaseUrl + '/api/changepassword', data2);
                        } else {
                            if (that.userData.oldPassword && that.userData.newPassword && that.userData.oldPassword == that.userData.newPassword) {
                                if (perSettingForm.oldPassword.$pristine)
                                    perSettingForm.oldPassword.$pristine = true;
                                if (perSettingForm.oldPassword.$dirty) {
                                    perSettingForm.oldPassword.$dirty = false;
                                }
                                messageService.showFailure('Passwords are same!');
                            }

                        }

                        if ($rootScope.newImg) {
                            var x = utilService.base64ToBlob($rootScope.newImg);
                            var temp = $rootScope.newImg.split(',')[0];
                            var mimeType = temp.split(':')[1].split(';')[0];
                            imgFlag = true
                            uploadFile = saveFile(x, mimeType, userService.getCurrentUser().userID);

                        }
                        eFlag ? promiseArray.push(editUser) : promiseArray.push($q.when(false));
                        pFlag ? promiseArray.push(changePassword) : promiseArray.push($q.when(false));
                        imgFlag ? promiseArray.push(uploadFile) : promiseArray.push($q.when(false));

                        return $q.all(promiseArray)

                    }



                    saveDataToServer().then(function(data) {
                            if (data[2]) {
                                that.userData['profile-image'] = data[2]+'?random='+ Date.now();
                                updateOwnImgGroup(data[2]+'?random='+ Date.now())
                                // that.userData['profile-image'] = data[2];

                            }
                            delete that.userData.oldPassword;
                            delete that.userData.newPassword;
                            if (!that.userData['date-created']) that.userData['date-created'] = new Date().getTime();
                            that.userData['status'] = 0;

                            // console.log(that.userData)
                            that.userData.$save().then(function(data) {
                                // $location.path('/user/' + userService.getCurrentUser().userID)
                                $state.go('user.dashboard', {userID: userService.getCurrentUser().userID})
                                that.isProcessing = false;
                                perSettingForm.$submitted = false;
                                messageService.showSuccess('User profile updated')
                            }, function(err) {
                                that.isProcessing = false;
                                perSettingForm.$submitted = false;
                                messageService.showFailure('Error occurred updating user profile')
                                    //console.log('Error occurred updating user profile')
                            })

                        })
                        .catch(function() {
                            that.isProcessing = false;
                            perSettingForm.$submitted = false;
                            messageService.showFailure('Error occurred updating user profile')
                        });
                }

                function hide() {
                    personalSettingsService.cancelPersonalSettings()
                }
                /*
                                this.validateForm = function validateForm(form){
                                    if(form.$invalid){
                                        form._oldPassword.$invalid
                                    }
                                }
                */
                function saveFile(file, type, userID) {
                    var defer = $q.defer();
                    var xhr = new XMLHttpRequest();
                    //xhr.open("GET", appConfig.apiBaseUrl + "/api/saveuserprofilepicture?file_name=" + userID + "." + type.split('/')[1] + "&file_type=" + type);
                    xhr.open("GET", appConfig.apiBaseUrl + "/api/saveuserprofilepicture?userID=" + userID + "&file_type=" + type);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText);
                                defer.resolve(upload_file(file, response.signed_request, response.url));
                            } else {
                                defer.reject(alert("Could not get signed URL."))
                            }
                        }
                    };
                    xhr.send();
                    return defer.promise;
                }

                function upload_file(file, signed_request, url) {
                    var defer = $q.defer();
                    var xhr = new XMLHttpRequest();
                    xhr.open("PUT", signed_request);
                    xhr.setRequestHeader('x-amz-acl', 'public-read');
                    xhr.onload = function(data) {
                        // console.log(xhr.status);
                        // console.log(xhr.responseText);
                        if (xhr.status === 200) {
                            //console.log(url);
                            $rootScope.userImg = $rootScope.newImg;
                            messageService.showSuccess('Picture uploaded')
                                //document.getElementById("preview").src = url;
                                //that.group.imgLogoUrl = url;
                                // console.log(url);
                            defer.resolve(url)
                        }
                    };
                    xhr.onerror = function(error) {
                        defer.reject(console.log("Could not upload file."));
                    };
                    xhr.send(file);
                    return defer.promise;
                }

                function updateOwnImgGroup (imgurl) {
                    var defer = $q.defer();
                    var groups = dataService.getUserGroups();
                    groups.forEach(function(group, index){
                        if (group.ownerID === that.loggedInUserData.userID) {
                            firebaseService.getRefGroups().child(group.groupID).update({'owner-img-url' : imgurl})
                            firebaseService.getRefGroupsNames().child(group.groupID).update({'ownerImgUrl' : imgurl})

                        }
                    })
                    var subgroups = activityStreamService.getSubgroupNamesAndMemberships()
                    for (var group in subgroups) {
                        for (var subgroup in subgroups[group]) {
                            if(subgroups[group][subgroup] == 1) {
                                firebaseService.getRefSubGroups().child(group).child(subgroup).update({'owner-img-url' : imgurl})
                                firebaseService.getRefSubGroupsNames().child(group).child(subgroup).update({'ownerImgUrl' : imgurl})
                            }
                        }
                    }
                    console.dir(subgroups);
                    return defer.promise;
                }

                function showAdvanced(ev) {
                    $rootScope.tmpImg = $rootScope.newImg;
                    $rootScope.newImg = '';
                    $mdDialog.show({
                        controller: "DialogController as ctrl",
                        templateUrl: 'directives/dilogue1.tmpl.html',
                        targetEvent: ev,
                        escapeToClose: false
                    }).then(function(picture) {
                        $rootScope.newImg = picture;
                        //console.log("this is image" + picture)
                    }, function(err) {
                        //console.log(err)

                    })

                }
            }

        ]);
})();
<!--waste-->

 /**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.policy', ['core'])
        .factory('policyService', ['activityStreamService', 'firebaseService', '$q', "messageService",
        function(activityStreamService, firebaseService, $q, dataService, messageService) {

        	//Getting SubGroup Names of given GroupID -- START --
        	var subGroupNames = [];
    	    function setSubGroupNames(groupID) {
                subGroupNames = [];

                firebaseService.getRefSubgroupPolicies().child(groupID).on('child_added',function(subGroups, prevChildKey){
                    //after getting names checking subgroup has policy or nothing
                    subGroupNames.push({
                        subgroupID: subGroups.key(),
                        subgroupTitle: (subGroups.val()['subgroup-title']) ? subGroups.val()['subgroup-title'] : 'Subgroup Title',
                        hasPolicy: false,
                        policyID: (subGroups.val().policyID) ? subGroups.val().policyID : ''
                    });
                }); //getRefSubgroupPolicies (child_added)

                firebaseService.getRefSubgroupPolicies().child(groupID).on('child_changed', function(snapshot){
                        subGroupNames.forEach(function(value, index){
                            if(value.subgroupID == snapshot.key()){
                                subGroupNames[index]['policyID'] = snapshot.val().policyID;
                            }
                        });
                }); //getRefSubgroupPolicies (child_changed)

            } //setSubGroupNames
            function getSubGroupNames(groupID) {
            	setSubGroupNames(groupID);
            	return subGroupNames;
            }
            //Getting SubGroup Names of given GroupID -- END --


			//Getting Members of Given GroupID and SubGroupID -- START --
			var subGroupMembers = [];
			function setSubGroupMembers(groupID, subgroupID) {
                subGroupMembers = [];
                firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_added', function(subGroups, prevChildKey) {
                    // console.log(subGroups.key());
                    // console.log(subGroups.val());
                    subGroupMembers.push({groupID: groupID, subgroupID: subgroupID, userID: subGroups.key()});
                });
            }

            function getSubGroupMembers(groupID, subgroupID) {
            	setSubGroupMembers(groupID, subgroupID);
            	return subGroupMembers;
            }
			//Getting Members of Given GroupID and SubGroupID -- END --

			//Getting Policies by given GroupID --START --
			var groupPolicies = [];
			function setGroupPolicies(groupID) {
                groupPolicies = [];
                firebaseService.getRefPolicies().child(groupID).on('child_added', function(subGroups, prevChildKey) {
                    // console.log(subGroups.key());
                    // console.log(subGroups.val());
                    groupPolicies.push(subGroups.val());
                });
                // firebaseService.getRefPolicies().child(groupID).on('value', function(subGroups, prevChildKey) {
                //     for(var subgroup in subGroups.val()){
                //     	console.log(subGroups.val()[subgroup])
                //     	groupPolicies.push(subGroups.val()[subgroup]);
                //     }
                //     console.log('groupPolicies ',groupPolicies);
                // });
			}
			function getGroupPolicies(groupID) {
				setGroupPolicies(groupID);
				return groupPolicies;
			}
			//Getting Policies by given GroupID --END --

			//Save data in firebase using Multi-Path 	-- START --
			function answer(obj, groupID, selectedTeams, selectedTeamMembers, policyID, cb) {
                //var firebaseTimestamp = Firebase.ServerValue.TIMESTAMP;

				//refernce Object
                var refNodes = { ref: firebaseService.getRefMain(),
                                 policies: firebaseService.getRefPolicies()
                };

				var newPolicyKey = '';
                if(!policyID){
	                // Generate a new push ID for the new policy
	                var newPolicyRef = refNodes.policies.push();
	                newPolicyKey = newPolicyRef.key();
                } else {
                	//on Edit
                	newPolicyKey = policyID;
                }

                //set policyID
                obj.policyID = newPolicyKey;

                //Saving on firebase by using multi path update
                var multiPathUpdate = {};

                //add policy in policies node
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/defined-by"] = obj['defined-by'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/location"] = obj['location'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/locationBased"] = obj['locationBased'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/policyID"] = obj['policyID'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/progressReport"] = obj['progressReport'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/schedule"] = obj['schedule'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/timeBased"] = obj['timeBased'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/timestamp"] = obj['timestamp'];
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/title"] = obj['title'];

                //for daily progress questions
                if (obj['progressReport']) {
                    //if question has been changed then do this else nuthing just true isProgressReport....
                    if (obj['progressReportQuestions']) {
                        var newQuestionRef = refNodes.ref.child("policies").child(groupID).child(newPolicyKey).child('progressReportQuestions').push();
                        var newQuestionID = newQuestionRef.key();
                        multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/latestProgressReportQuestionID"] = newQuestionID;
                        multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/progressReportQuestions/"+newQuestionID] = obj['progressReportQuestions'];
                    } 
                }

                var subgroupPolicyActivity = {};

                if (selectedTeams && selectedTeams.length > 0) {
                    //getting subgroups which are selected....
                    selectedTeams.forEach(function(val, indx) {
                        //add property hasPolicy in subgroupNames..
                        multiPathUpdate["subgroup-policies/" + groupID + "/" + val.subgroupID + "/hasPolicy"] = true;
                        multiPathUpdate["subgroup-policies/" + groupID + "/" + val.subgroupID + "/policyID"] = newPolicyKey;
                        multiPathUpdate["subgroup-policies/" + groupID + "/" + val.subgroupID + "/policy-title"] = obj['title'];                    

                        //add policy id into subgroup node
                        multiPathUpdate["subgroups/"+groupID+"/"+val.subgroupID+"/policyID"] = newPolicyKey;

                        //for policy - group/subgroup activity record -- start --
                        subgroupPolicyActivity[val.subgroupID] = {
                            type: 'policy',
                            targetinfo: {id: newPolicyKey, url: groupID+'/'+newPolicyKey, title: obj["title"], type: 'policy' },
                            area: {type: 'policy-assigned-team'},
                            group_id: groupID+'/'+val.subgroupID,
                            memberuser_id: null,
                            object_is_Team: {   "type": 'subgroup',
                                                "id": val.subgroupID, //an index should be set on this
                                                "url": groupID+'/'+val.subgroupID,
                                                "displayName": val.subgroupTitle
                                            }
                        };
                        //for policy - group/subgroup activity record -- end --

                    }); //selectedTeams.forEach
                }

                //getting subgroup Members...
                for(var group in selectedTeamMembers) {
                    selectedTeamMembers[group].forEach(function(v, i){
                        //adding obj into user-policies userid -> groupid -> subgroupid node
                        multiPathUpdate["user-policies/"+v.userID+"/"+v.groupID+"/"+v.subgroupID] = {"hasPolicy": true, "policyID": newPolicyKey ,"title" : obj['title'] };
                    }); //selectedTeamMembers[group].forEach
                } //for selectedTeamMembers


               	//Multi-Path update Queery
                refNodes.ref.update(multiPathUpdate, function(err) {
                    if(err) {
                        console.log("Error updating Date:", err);
                    } else {
                        //for policy activity stream record -- START --
                        var type = 'policy';
                        var targetinfo = {id: newPolicyKey, url: groupID+'/'+newPolicyKey, title: obj["title"], type: 'policy' };
                        var area = {type: (policyID) ? 'policy-updated' : 'policy-created'};
                        var group_id = groupID;
                        var memberuserID = null;
                        var object = null;
                        activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, object);
                        //for policy activity record

                        //if selected subgroup then add in group/subgroup activity
                        if(subgroupPolicyActivity){
                            for(var _sbgrp in subgroupPolicyActivity){
                                console.log('_sbgrp', subgroupPolicyActivity[_sbgrp].object_is_Team);
                                activityStreamService.activityStream(
                                    subgroupPolicyActivity[_sbgrp].type,
                                    subgroupPolicyActivity[_sbgrp].targetinfo,
                                    subgroupPolicyActivity[_sbgrp].area,
                                    subgroupPolicyActivity[_sbgrp].group_id,
                                    subgroupPolicyActivity[_sbgrp].memberuser_id,
                                    subgroupPolicyActivity[_sbgrp].object_is_Team
                                );
                            } //for: subgroupPolicyActivity
                        } //if subgroupPolicyActivity
                        //for group activity stream record -- END --

                    	cb(newQuestionID);
                    }
                }); //ref.update
			} //answer

            //Step1 checking Subgroup has Policy
            function checkingTeamHasPolicy(groupID, subgroupID, cb){
                firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).once('value', function(snapshot){
                    if(snapshot.val() && snapshot.val().hasPolicy && snapshot.val().hasPolicy === true){
                        cb(snapshot.val().hasPolicy, snapshot.val().policyID);
                    } else {
                        cb(false, null);
                    }
                });

            } //checkingTeamHasPolicy
            //Step2 if has policy then assign policy to single member else nuthing
            function assignTeamPolicyToMember(memeberID, groupID, subgroupID, cb) {
                checkingTeamHasPolicy(groupID, subgroupID, function(hasPolicy, policyID) {
                    if(hasPolicy){
                        //set policy to member
                        firebaseService.getRefMain().child('user-policies').child(memeberID).child(groupID).child(subgroupID).set(policy.val(),function(err){
                            if(err){
                                cb(false, err);
                            }
                            cb(true, null);
                        });
                    } else {
                        cb(false, 'team has no policy'); //Policy has not assigned on given team (subgroup)
                    }
                });
            }//assignTeamPolicyToMember
            //Step2 if has policy then assign policy to multiple members else nuthing
            function assignTeamPolicyToMultipleMembers(memeberIDarray, groupID, subgroupID, cb) {
                checkingTeamHasPolicy(groupID, subgroupID, function(hasPolicy, policyID) {
                    if(hasPolicy){
                        var multiPathUpdate = {};
                        memeberIDarray.forEach(function(val, index){

                            multiPathUpdate["user-policies/"+val+"/"+groupID+"/"+subgroupID] = policyID;

                            if(memeberIDarray.length == index+1){
                                firebaseService.getRefMain().update(multiPathUpdate, function(err){
                                     if(err){
                                        cb(false, err);
                                    }
                                    cb(true, null);
                                });
                            }   //array length is equal to foreach index
                        }); //memeberIDarray.forEach
                    } else {
                        cb(false, 'team has no policy'); //Policy has not assigned on given team (subgroup)
                    }
                }); //checkingTeamHasPolicy
            }//assignTeamPolicyToMultipleMembers
            //if member assign into any team, if policy has exists on that team then also assigned to member -- START --


            return {
                getSubGroupNames: 	getSubGroupNames,
                getSubGroupMembers: getSubGroupMembers,
                getGroupPolicies: 	getGroupPolicies,
                answer: 			answer,
                assignTeamPolicyToMember: assignTeamPolicyToMember,
                assignTeamPolicyToMultipleMembers: assignTeamPolicyToMultipleMembers
            };
        }]);

})();

(function() {
    'use strict';

    angular.module('app.policy').controller('PolicyController', [
        '$mdSidenav',
        '$state',
        '$location',
        'messageService',
        '$mdDialog',
        'checkinService',
        'userService',
        '$stateParams',
        'groupFirebaseService',
        '$timeout',
        '$firebaseObject',
        'firebaseService',
        '$firebaseArray',
        "policyService",
        function($mdSidenav, $state, $location, messageService, $mdDialog, checkinService, userService, $stateParams, groupFirebaseService, $timeout, $firebaseObject, firebaseService, $firebaseArray, policyService) {

            this.showPanel = false;
            var that = this;
            this.showarrow = undefined;
            this.isLocationbased = false;
            this.isTimebased = false;
            that.selectedTeamNew = [];
            this.isProgressReport = false;
            this.isProcessing = false;
            that.fencing = true;
            this.center = {};
            this.markers = {
                mark: {}
            };
            this.paths = {
                c1: {}
            };
            this.defaults = {
                scrollWheelZoom: false
            };
            this.policyTitle = '';
            this.activePolicyId = false;

            var groupId = that.groupId = $stateParams.groupID;
            var SubgroupObj, userId = that.userId = userService.getCurrentUser().userID;
            var subgroupId = that.subgroupId = undefined;

            //checking is admin or not -- START
            that.groupAdmin = false;
            firebaseService.getRefUserGroupMemberships().child(that.userId).child(that.groupId).once('value', function(group) {
                if (group.val()['membership-type'] == 1) {
                    that.groupAdmin = true;
                } else if (group.val()['membership-type'] == 2) {
                    that.groupAdmin = true;
                }
            });
            //checking is admin or not -- END

            //Geo Fecning Default Location
            function defaultGeoLocation() {

                // for creating default geo fencing variables and define default lng, lat with marker
                setLocationMarker(67.04971699999999, 24.8131137);

                //getting user current location
                checkinService.getCurrentLocation().then(function(location) {
                    if (location) { //if location found
                        getLatLngByAddress(location.coords.latitude + ', ' + location.coords.longitude);
                    }
                }, function(err) {
                    //messageService.showFailure(err.error.message);
                });
            } //defaultGeoLocation

            //setting location and its marker
            function setLocationMarker(lng, lat) {
                that.center.lat = lat;
                that.center.lng = lng;
                that.center.zoom = 20;

                that.markers.mark.lat = lat;
                that.markers.mark.lng = lng;
                that.markers.mark.draggable = true;
                that.markers.mark.focus = true;
                that.markers.mark.message = '34C Stadium Lane 3, Karachi, Pakistan';

                that.paths.c1.type = 'circle';
                that.paths.c1.weight = 2;
                that.paths.c1.color = 'green';
                that.paths.c1.latlngs = that.center;
                that.paths.c1.radius = 20;
            } //setLocationMarker

            function updatepostion(lat, lng, msg) {
                that.paths.c1.latlngs = {
                    lat: lat,
                    lng: lng
                };
                that.markers.mark.lat = lat;
                that.markers.mark.lng = lng;
                that.markers.mark.focus = true;
                that.markers.mark.message = msg;
                that.center.lat = lat;
                that.center.lng = lng;
            }
            that.getLatLngByAddress = getLatLngByAddress;


            //on controller load...... START

            //Load Group Policies from given GroupID
            this.groupPolicies = [];
            this.groupPolicies = policyService.getGroupPolicies(that.groupId);

            //Load SubgroupNames from Given GroupID
            this.subGroupNames = [];
            this.subGroupNames = policyService.getSubGroupNames(that.groupId);

            // $timeout(function() {
            //     console.log('watch', that.subGroupNames);
            // }, 2000);
            

            //on controller load...... END



            this.openEditGroupPage = function() {
                $state.go('user.edit-group', {
                    groupID: groupId
                });
            };

            this.openCreateSubGroupPage = function() {
                $state.go('user.create-subgroup', {
                    groupID: groupId
                });
            };
            this.openUserSettingPage = function() {
                $state.go('user.user-setting', {
                    groupID: groupId
                });
            };
            this.openEditGroup = function() {
                $state.go('user.edit-group', {
                    groupID: groupId
                });
            };

            that.groupAdmin = false
            firebaseService.getRefUserGroupMemberships().child(userId).child(groupId).once('value', function(group) {
                if (group.val()['membership-type'] == 1) {
                    that.groupAdmin = true;
                } else if (group.val()['membership-type'] == 2) {
                    that.groupAdmin = true;
                }
            })

            this.showLocationBySubGroup = function(subgroupId, index, b) {

                $timeout(function() {
                    angular.element('#leafletmap').attr('height', '');
                    angular.element('#leafletmap').attr('width', '');
                }, 0)
                wrapperGeoLoacation(subgroupId)
            };

            groupFirebaseService.getGroupSyncObjAsync(groupId, userId)
                .then(function(syncObj) {
                    that.subgroups = syncObj.subgroupsSyncArray;
                });

            function wrapperGeoLoacation(sub) {
                if (sub) {
                    that.subgroupId = sub;
                }
                var _subgroupId = sub || subgroupId;

                checkinService.createCurrentRefsBySubgroup(groupId, _subgroupId, userId).then(function() {
                    that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations().$loaded().then(function(data) {
                        if (data.length > 0) {
                            updatepostion(data[0].location.lat, data[0].location.lon, data[0].title);
                            $timeout(function() {
                                updatepostion(data[0].location.lat, data[0].location.lon, data[0].title);
                            }, 500);
                        } else {
                            updatepostion(24.8131137, 67.04971699999999, '34C Stadium Lane 3, Karachi, Pakistan');
                            $timeout(function() {
                                updatepostion(24.8131137, 67.04971699999999, '34C Stadium Lane 3, Karachi, Pakistan');
                            }, 500);
                        }
                    });
                });
            }

            function getLatLngByAddress(newVal) {
                if (newVal) {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({
                        'address': newVal
                    }, function(results, status) {
                        var i = 0;
                        if (status == google.maps.GeocoderStatus.OK) {
                            var lat = results[0].geometry.location.lat() ? results[0].geometry.location.lat() : 0;
                            var lng = results[0].geometry.location.lng() ? results[0].geometry.location.lng() : 0;
                            updatepostion(lat, lng, results[0].formatted_address);
                            $timeout(function() {
                                updatepostion(lat, lng, results[0].formatted_address);
                            }, 500);
                        }
                    });
                }
            }
            that.setSubgroupLocation = setSubgroupLocation;

            //Save on Firebase.....
            function setSubgroupLocation() {
                that.isProcessing = true;
                var infoObj = {
                    groupID: that.groupId,
                    subgroupID: that.subgroupId,
                    userID: that.userId,
                    title: that.markers.mark.message,
                    location: {
                        lat: that.center.lat,
                        lng: that.center.lng,
                        radius: that.paths.c1.radius
                    }

                };

                checkinService.addLocationBySubgroup (that.groupId, that.subgroupId, that.userId, infoObj, false)
                    .then(function(res) {
                        that.isProcessing = false;
                        that.submitting = false;
                        that.fencing = true;
                        messageService.showSuccess(res);
                        $mdDialog.hide();
                    }, function(err) {
                        that.isProcessing = false;
                        that.submitting = false;
                        that.fencing = true;
                        messageService.showFailure(err);
                    });
            }


            function UserMemberShipFunc() {
                var userMemberships = checkinService.getFireAsObject(refUserMemberShip.child(userID));
                userMemberships.$loaded().then(function(data) {
                    var memberShipGroup = userMemberships[groupID][subgroupID];
                    that.isAdmin = memberShipGroup && (memberShipGroup['membership-type'] == 1 || memberShipGroup['membership-type'] == 2);
                });
            }


            //New Work POLICY

            this.subgroupSideNavBar = false;
            this.toggleSideNavBar = function(navID) {
                //that.subgroupSideNavBar = !that.subgroupSideNavBar;
                $mdSidenav(navID).toggle();
            };

            //scheduler for time base -- START --
            this.selectedTimesForAllow = {};
            this.day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            this.times = ['12AM', "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"];
            //this.item = false;
            this.schCalender = [];
            //this.background = "red";
            function loadSchaduler() {
                that.schCalender = [];
                var row = [];
                for (var i = 0; i < 7; i++) {
                    row = [];
                    for (var j = 0; j < 24; j++) {
                        row.push(false);
                    }
                    that.schCalender.push(row);
                }
            } //loadSchaduler

            //on click schedule (checkbox) click create object
            this.onScheduleClick = function(index, parentIndex) {
                that.schCalender[parentIndex][index] = !that.schCalender[parentIndex][index];
                // console.log(that.day[parentIndex], that.times[index], that.schCalender[parentIndex][index]);

                if (that.selectedTimesForAllow.hasOwnProperty(that.day[parentIndex])) {
                    that.selectedTimesForAllow[that.day[parentIndex]][index] = that.schCalender[parentIndex][index]
                    // that.selectedTimesForAllow[that.day[parentIndex]][(that.times[index].replace( /\D+/g, ''))] = that.schCalender[parentIndex][index]
                } else {
                    that.selectedTimesForAllow[that.day[parentIndex]] = {};
                    that.selectedTimesForAllow[that.day[parentIndex]][index] = that.schCalender[parentIndex][index]
                    // that.selectedTimesForAllow[that.day[parentIndex]][(that.times[index].replace( /\D+/g, ''))] = that.schCalender[parentIndex][index]
                }
                // console.log(that.selectedTimesForAllow);
            };
            //scheduler for time base -- END --


            //Selected SubGroup Members for Assigning Policies
            this.selectedTeamMembers = {};
            this.LoadSubGroupUsers = function(groupID, subgroupID) {
                that.selectedTeamMembers[subgroupID] = policyService.getSubGroupMembers(groupID, subgroupID);
                //that.selectedTeamMembers = policyService.getSubGroupMembers(that.groupId, 'hotemail');
            };
            //Selected SubGroup Members for Assigning Policies

            //Selected SubGroup for Assign Policies
            this.selectedTeams = [];
            this.selectedTeam = function(subgroup, onEditPolicy) {
                var _flag = true;
                that.selectedTeams.forEach(function(val, indx) {
                    if (val.subgroupID == subgroup.subgroupID) {
                        _flag = false;
                    }
                });
                if (_flag) {

                    //Add SubGroups  
                    that.selectedTeams.push(subgroup);

                    if (onEditPolicy) { //on click policy (edit mode)
                        //after add in local selected team array chnage hasPolicy true in firebase team array
                        that.subGroupNames.forEach(function(val, indx) {
                            // console.log(val)
                            if (val.subgroupID == subgroup.subgroupID && val.policyID == that.activePolicyId) {
                                that.subGroupNames[indx].hasPolicy = true;
                            }
                        });
                    } else {
                        //confrim prompt, checking policy is applied on selected subgroup or not... 
                        if (subgroup.policyID.length > 2) {  // if subgroup.policyID 
                            var doYouWant = confirm('Policy has already assigned on this team. Do you want to apply this policy?');
                            if (doYouWant) {
                                //after add in local selected team array chnage hasPolicy true in firebase team array
                                that.subGroupNames.forEach(function(val, indx) {
                                    if (val.subgroupID == subgroup.subgroupID) {
                                        that.subGroupNames[indx].hasPolicy = true;
                                        
                                        that.selectedTeamNew.push(that.subGroupNames[indx]);
                                        // console.log('for firebase selectedTeamNew: ', JSON.stringify(that.selectedTeamNew));
                                    }
                                }); // that.subGroupNames
                            } // doYouWant
                        } else {
                                //after add in local selected team array chnage hasPolicy true in firebase team array
                                that.subGroupNames.forEach(function(val, indx) {
                                    if (val.subgroupID == subgroup.subgroupID) {
                                        that.subGroupNames[indx].hasPolicy = true;

                                        if (that.selectedTeamNew) { // checkin if not undefined
                                            that.selectedTeamNew.push(that.subGroupNames[indx]);
                                        } else {    // if undefined
                                            that.selectedTeamNew = [];
                                            that.selectedTeamNew.push(that.subGroupNames[indx]);
                                        }    
                                        // console.log('for firebase selectedTeamNew: ', JSON.stringify(that.selectedTeamNew));
                                    }
                                }); // that.subGroupNames
                        }

                    }

                    //Load SubGropMemebrs
                    that.LoadSubGroupUsers(that.groupId, subgroup.subgroupID);
                } //_flag
            }; //selectedTeam
            //Selected SubGroup for Assign Policies

            //on create policy
            this.newPolicy = function(saved) {
                //load initial page
                init();

                //chnage subgroup names hasPolicy false onload
                subGroupNamesPolicyFalse();

                //On New/Create Policy Show Panel
                that.showPanel = true;

                if (saved) {
                    that.showPanel = false;
                    this.showarrow = undefined;
                } else {
                    that.showPanel = true;
                    this.showarrow = undefined;
                }
            };//this.newPolicy

            this.selectedPolicy = function(policy, index) {
                that.selectedTeamNew = [];                      //for assign policy on subgroup, create a array when click from policy.html and then send to firebase
                that.showarrow = index;
                that.activePolicyId = policy.policyID;          //set active PolicyID
                that.policyTitle = policy.title;                //show title
                that.isLocationbased = policy.locationBased;    //show if locationBased is True

                that.isTimebased = policy.timeBased;            //show if timebased is true
                that.selectedTimesForAllow = {};

                that.isProgressReport = policy.progressReport;
                that.progressReportQuestions = {};
                that.showPanel = true;

                //Clear calender .. (run scheduler)
                loadSchaduler();

                if (that.isLocationbased) {
                    getLatLngByAddress(policy.location.lat + ', ' + policy.location.lng);
                    that.paths.c1.radius = policy.location.radius;
                    //that.center.lat = policy.locationObj.lat;
                    //that.center.lng = policy.locationObj.lng;
                } //policy.locationBased true

                if (that.isTimebased) {
                    for (var day in policy.schedule) {
                        // console.log(day); // console.log(policy.timeObj[day]);
                        for (var hour in policy.schedule[day]) {
                            // console.log(hour);  // console.log(policy.timeObj[day][hour]);
                            that.schCalender[that.day.indexOf(day)][hour] = policy.schedule[day][hour];

                            if (that.selectedTimesForAllow.hasOwnProperty(day)) {
                                that.selectedTimesForAllow[day][hour] = policy.schedule[day][hour];
                            } else {
                                that.selectedTimesForAllow[day] = {};
                                that.selectedTimesForAllow[day][hour] = policy.schedule[day][hour]
                            }
                        } // for hour    policy.timeObj[day]
                        // console.log(that.selectedTimesForAllow);
                    } //for day    policy.timeObj
                } //policy.timeBased true

                if (that.isProgressReport) {
                    //when comes from firebase our question change into array from object.
                    that.progressReportQuestions = arrayToObject(policy.progressReportQuestions[policy.latestProgressReportQuestionID]['questions']);
                    //Selected Policy QuestionObject and LastestQuestionID (for checking questions are add/remove/change)
                    that.selectedQuestionObject = arrayToObject(policy.progressReportQuestions[policy.latestProgressReportQuestionID]['questions']);
                    that.selectedLastQuestionID = policy.latestProgressReportQuestionID;

                    isQuestionExists();  //checking if questions exists
                } //that.isDailyReport true

                //now getting subgroup ids where this policy has implemented
                that.selectedTeams = []; //on edit policy clear selectedTeams Array  before reload
                that.selectedTeamMembers = {}; //on edit policy clear selectedTeamMembers object before reload

                //before selectedTeam first hasPolicy = false...
                subGroupNamesPolicyFalse();

                //if active policy is match from subgroup object of policyID then hasPolicy true
                that.subGroupNames.forEach(function(val, indx) {
                    if (val.policyID && val.policyID == policy.policyID) {
                        that.selectedTeam(val, true); //creating selected teams array
                    }
                }); //subGroupNames.forEach
            }; //this.selectedPolicy

            function subGroupNamesPolicyFalse() {
                //before selectedTeam first hasPolicy = false...
                that.subGroupNames.forEach(function(val, indx) {
                    that.subGroupNames[indx].hasPolicy = false;
                });
            } // subGroupNamesPolicyFalse

            //Daily Report -- START --
            this.showQuestionList = false;      //for showing table
            this.progressReportQuestions = {};
            // var dailyReportQuestionsLength = gettingQuestionsLength();
            this.addQuestion = function() {
                if (that.question) {

                    var sr = 0;
                    for (var i in that.progressReportQuestions) {
                        that.progressReportQuestions[sr.toString()] = that.progressReportQuestions[i];
                        sr++;
                    }

                    that.progressReportQuestions[sr.toString()] = that.question;
                    that.question = '';

                    //Show Table of Question if question exists
                    isQuestionExists();
                }
            };

            function isQuestionExists() {
                if (Object.keys(that.progressReportQuestions).length > 0) {
                    that.showQuestionList = true;
                } else {
                    that.showQuestionList = false;
                }
            }
            this.deleteQuestion = function(id) {
                delete that.progressReportQuestions[id.toString()];
                that.progressReportQuestions = arrayToObject(that.progressReportQuestions);

                //Show Table of Question if question exists
                isQuestionExists();
            };
            function gettingQuestionsLength() {      //getting current question object length
                return Object.keys(that.progressReportQuestions).length;
            }
            //when comes from firebase our question change into array from object.
            function arrayToObject(arr) {
                if (arr instanceof Array) {
                    var rv = {};
                    for (var i = 0; i < arr.length; ++i)
                        if (arr[i] !== undefined) rv[i] = arr[i];
                    return rv;
                } else {
                    return arr;
                }
            }
            //Daily Report -- END --

            //onclick save button
            this.onSave = function() {
                that.isProcessing = true;
                if (that.policyTitle) {

                    if (!that.isProgressReport && !that.isTimebased && !that.isLocationbased) {
                        //nothing have to do....
                        messageService.showFailure('Please Select your Criteria');

                        this.showarrow = undefined ;
                        that.isProcessing = false;

                        return false;

                    }

                    //default ObjectX

                    var obj = {};
                    obj["title"] = that.policyTitle;    //setting policy title name
                    obj["locationBased"] = false;
                    obj["timeBased"] = false;
                    obj["location"] = "";
                    obj["schedule"] = "";
                    obj["defined-by"] = that.userId;
                    obj["timestamp"] = Firebase.ServerValue.TIMESTAMP;
                    obj["progressReport"] = false;
                    obj["progressReportQuestions"] = "";
                    obj["latestProgressReportQuestionID"] = '';

                    this.showarrow = undefined;
                    //if locationBased is selected
                    if (that.isLocationbased) {
                        //isLocationbased
                        obj["locationBased"] = true;
                        obj["location"] = {
                            lat: that.center.lat,
                            lng: that.center.lng,
                            radius: that.paths.c1.radius,
                            title: that.markers.mark.message
                        }
                           this.showarrow = undefined ;
                           that.isProcessing = false;

                    }

                    //if timeBased is selected
                    if (that.isTimebased) {
                        //isTimebased
                        if (Object.keys(that.selectedTimesForAllow).length > 0) {
                            obj["timeBased"] = true;
                            obj["schedule"] = that.selectedTimesForAllow;
                        } else {
                            messageService.showFailure('Please add schedule/time slot!');
                            that.isProcessing = false;
                            return false;
                        }
                        this.showarrow = undefined;
                    }

                    //if dailyBased is selected
                    if (that.isProgressReport) {
                        //isDailyReport
                        obj["progressReport"] = true;
                        //checking if pogressReport is selected then question should have atleast one.
                        if (Object.keys(that.progressReportQuestions).length > 0) {
                            //checking current questions and saved questions are same or not.........
                            if (JSON.stringify(that.selectedQuestionObject) === JSON.stringify(that.progressReportQuestions)) {
                                //if questions are same //no changes in questions
                                obj["progressReportQuestions"] = null;
                            } else {
                                //if questions are not same or add/remove/chnage any question then add to firebase
                                obj["progressReportQuestions"] = { questions: that.progressReportQuestions, timestamp: Firebase.ServerValue.TIMESTAMP }
                            }
                        } else {
                            messageService.showFailure('Please add some Questions for Daily Report!');
                            return false;
                        }
                    //    that.isProcessing = false;

                    }
                    // console.log('team', that.selectedTeams);
                    // console.log('members', that.selectedTeamMembers);

                    //calling policy service function to add in firebase
                    //policyService.answer(obj, that.groupId, that.selectedTeams, that.selectedTeamMembers, that.activePolicyId, function(lastQuestionid) {
                    policyService.answer(obj, that.groupId, that.selectedTeamNew, that.selectedTeamMembers, that.activePolicyId, function(lastQuestionid) {
                        //Load Group Policies from given GroupID
                        //that.groupPolicies = policyService.getGroupPolicies(that.groupId);
                        if (that.activePolicyId) {  //if edit
                            that.groupPolicies.forEach(function(val, index) {
                                if (val.policyID == that.activePolicyId) {
                                    if (obj["progressReport"]) {  //checking isProgressReport is true then do this else nuthing..
                                        if (lastQuestionid) {
                                            //if getting lastQuestionid then it means question has changed and now we getting lastQuestionId
                                            obj['latestProgressReportQuestionID'] = lastQuestionid || '';
                                            obj['progressReportQuestions'][lastQuestionid] = obj['progressReportQuestions'];
                                        } else {
                                            //pass on which we have done on selected policy
                                            obj['latestProgressReportQuestionID'] = that.selectedLastQuestionID;
                                            obj['progressReportQuestions'] = {};
                                            obj['progressReportQuestions'][that.selectedLastQuestionID] = {};
                                            obj['progressReportQuestions'][that.selectedLastQuestionID]['questions'] = that.selectedQuestionObject;
                                        }
                                    }
                                    //reasign updated obj to our local array
                                    that.groupPolicies[index] = obj;
                                }
                            });

                            messageService.showSuccess('Policy Successfully Updated!');
                            //$state.go('user.policy', {groupID: groupId});
                            that.newPolicy('saved');
                            that.isProcessing = false;

                        } else{

                            messageService.showSuccess('Policy Successfully Created!');
                            //after created reload initial page
                            that.newPolicy('saved');
                            that.isProcessing = false;

                        }
                    });
                } else {//if that.title exists
                    messageService.showFailure('Please Write Policy Name');
                    that.isProcessing = false;
                }

            }; //onSave

            //load constructor
            function init() {
                that.activePolicyId = false; //at initial no policy has selected
                that.policyTitle = ''; //clear policy title (not required on load)
                that.isLocationbased = false; //unchek default location based
                that.isTimebased = false; //unchek default time based
                that.selectedTeams = []; //onLoad or create empty selectedTeams array
                that.selectedTeamMembers = {}; //onLoad or create empty selectedTeamMembers obj
                that.isProgressReport = true;
                //onLoad default qustion daily Report Questions obj
                that.progressReportQuestions = { '0': 'What did you accomplish today?', '1': 'What will you do tomorrow?', '2': 'What obstacles are impeding your progress?' };
                isQuestionExists();

                //set default location
                defaultGeoLocation();

                //generate scheduler
                loadSchaduler();
            }
            //run when controller load
            init();


            //add prototype for comparission of array
            Array.prototype.equals = function(array, strict) {
                if (!array)
                    return false;

                if (arguments.length == 1)
                    strict = true;

                if (this.length != array.length)
                    return false;

                for (var i = 0; i < this.length; i++) {
                    if (this[i] instanceof Array && array[i] instanceof Array) {
                        if (!this[i].equals(array[i], strict))
                            return false;
                    }
                    else if (strict && this[i] != array[i]) {
                        return false;
                    }
                    else if (!strict) {
                        return this.sort().equals(array.sort(), true);
                    }
                }
                return true;
            }

        } // controller function
    ]); //contoller
})();

/**
 * Created by sj on 6/10/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.userSetting', ['core', 'ngMdIcons'])
        .factory('userSettingService', ['groupFirebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig',
            function(groupFirebaseService, $location, soundService, userService, messageService, $q, $http, appConfig) {

                return {

                    'userSetting': function(userID, group, SubgroupInfo, subgroupList, formDataFlag) {
                        //var pageUserId = userService.getCurrentUser().userID;
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.toLowerCase();
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.replace(/[^a-z0-9]/g, '');
                        groupFirebaseService.asyncCreateSubgroup(userID, group, SubgroupInfo, subgroupList, formDataFlag)
                            .then(function(response) {
                                // console.log("Group Creation Successful");
                                var unlistedMembersArray = response.unlistedMembersArray;
                                if (unlistedMembersArray.length > 0) {

                                    messageService.showSuccess("Team of Teams creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                } else {
                                    messageService.showSuccess("Team of Teams creation Successful");
                                }
                            }, function(group) {
                                messageService.showFailure("Team of Teams not created, " + SubgroupInfo.groupID + " already exists");
                            })
                    },
                    'cancelSubGroupCreation': function(userId) {
                        console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)
                    },
                    'uploadPicture': function(file, groupID) {
                        var defer = $q.defer();
                        var reader = new FileReader();
                        reader.onload = function() {

                            var blobBin = atob(reader.result.split(',')[1]);
                            var array = [];
                            for (var i = 0; i < blobBin.length; i++) {
                                array.push(blobBin.charCodeAt(i));
                            }
                            var fileBlob = new Blob([new Uint8Array(array)], {
                                type: 'image/png'
                            });


                            var data = new FormData();
                            data.append('userID', userService.getCurrentUser().userID);
                            //data.append('token', $sessionStorage.loggedInUser.token);
                            data.append('token', userService.getCurrentUser().token);
                            data.append("source", fileBlob, file.name);

                            defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity
                            }));

                        };
                        reader.readAsDataURL(file);
                        return defer.promise;

                    },
                    'getGroupImgFromServer': function() {
                        var defer = $q.defer();
                        $http({
                                url: appConfig.apiBaseUrl + '/api/profilepicture/mmm',
                                method: "GET",
                                params: {
                                    token: userService.getCurrentUser().token
                                }
                            })
                            .then(function(data) {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    defer.resolve(reader.result)
                                };
                                reader.readAsDataURL(data.data.profilePicture);

                            })
                            .catch(function(err) {
                                defer.reject(err)
                            });

                        return defer.promise;

                    }
                };

                function Uint8ToString(u8a) {
                    var CHUNK_SZ = 0x8000;
                    var c = [];
                    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
                    }

                    return c.join("");

                }
            }
        ])

})();

/**
 * Created by Muhammad Mohsin on 6/17/2015.
 */
/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.userSetting')
        .controller('UserSettingController', ['$rootScope', 'messageService', '$stateParams', 'activityStreamService', 'firebaseService', 'groupFirebaseService', '$state', '$location', 'createSubGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', '$mdSidenav', '$mdUtil','CollaboratorService', UserSettingController])
    function UserSettingController($rootScope, messageService, $stateParams, activityStreamService, firebaseService, groupFirebaseService, $state, $location, createSubGroupService, userService, authService, $timeout, utilService, $mdDialog, $mdSidenav, $mdUtil,CollaboratorService) {

        var that = this;
        this.hide = hide;
        var user = userService.getCurrentUser();
        var groupID = $stateParams.groupID;
        this.groupId = groupID
        // var $loggedInUserObj = groupFirebaseService.getSignedinUserObj();

        this.approveMembership = approveMembership;
        this.rejectMembership = rejectMembership;
        this.changeMemberRole = changeMemberRole;

        this.openCreateSubGroupPage = function() {
            // $location.path('/user/group/' + groupID + '/create-subgroup');
            $state.go('user.create-subgroup', {groupID: groupID})
        }

        this.subgroupPage = function() {
            // $location.path('user/group/' + groupID + '/subgroup');
            $state.go('user.subgroup', {groupID: groupID})
        }
        this.editgroupPage = function() {
            // $location.path('user/group/' + groupID + '/edit-group');
            $state.go('user.edit-group', {groupID: groupID})
        }
        this.openGeoFencingPage = function() {
            // $location.path('/user/group/' + groupID + '/geoFencing');
            $state.go('user.geo-fencing', {groupID: groupID})
        }
        this.openPolicyPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.policy', {groupID: groupID})
        }


        this.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync(groupID, user.userID)
            .then(function(syncObj) {
                that.groupSyncObj = syncObj;
                //that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                that.group = that.groupSyncObj.groupSyncObj;
                that.members = that.groupSyncObj.membersSyncArray;
                that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                // console.log(that.pendingRequests)
                //that.activities = that.groupSyncObj.activitiesSyncArray;


            });
            // console.log(this.members);
        function hide() {
            /*   createGroupService.cancelGroupCreation();*/
            /* $mdDialog.cancel();*/
            // $location.path('/user/group/' + groupID);groupID
        }
        //For owner/admin: Approve membership request.
        function approveMembership(requestedMember) {
            // $loggedInUserObj.$loaded().then(function() {
                // $loggedInUserObj.userID = user.userID;groupID
                groupFirebaseService.approveMembership(groupID, user, requestedMember, that.group)
                    .then(function(res) {
                        if(requestedMember.teamrequest){
                            approveTeamMembership(requestedMember);
                        } else{
                            messageService.showSuccess("Approved Request Successfully");
                        }
                    }, function(reason) {
                        messageService.showFailure(reason);
                    });
            // });
        }

        function approveTeamMembership(requestedMember) {
            requestedMember.teamrequest.forEach(function(val, indx){
                groupFirebaseService.addsubgroupmember(requestedMember.userID, groupID, val.subgroupID).then(function(){
                    userActivityStreamOnAddMember(groupID, val.subgroupID, val.subgrouptitle, requestedMember.userID);
                    messageService.showSuccess("Approved Request Successfully");
                    // CollaboratorService.addAccessUser()
                }, function(err){
                    messageService.showFailure("Request Approved for Team of Teams but error in Team: " + err);
                })
            })
        }

        function userActivityStreamOnAddMember(groupID, subgroupID, subgrouptitle, userID) {
            var areaType = 'subgroup-member-assigned';
            //publish an activity stream record -- START --
            var type = 'subgroup';
            var targetinfo = {id: subgroupID, url: groupID+'/'+subgroupID, title: subgrouptitle, type: 'subgroup' };
            var area = {type: areaType };
            var group_id = groupID+'/'+subgroupID;
            var memberuserID = userID;
            //for group activity record
            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
            //for group activity stream record -- END --
        }



        //For owner/admin: Rejects membership request.
        function rejectMembership(requestedMember) {
            // $loggedInUserObj.$loaded().then(function() {
                // $loggedInUserObj.userID = user.userID;
                groupFirebaseService.rejectMembership(groupID, user, requestedMember, that.group)
                    .then(function(res) {
                        messageService.showSuccess("Ignored Request Successfully");
                    }, function(reason) {
                        messageService.showFailure(reason);
                    });
            // });
        }

        //For owner only: to change membership role of a member
        function changeMemberRole(newType, member) {
            groupFirebaseService.changeMemberRole(newType, member, that.group, user)
                .then(function(res) {
                    if (newType) {
                        messageService.showSuccess("Changed Role Successfully");
                    } else {
                        firebaseService.getRefUserSubGroupMemberships().child(member.userID).child(groupID).once('value', function(snapshot) {
                            for (var key in snapshot.val()) {
                                createSubGroupService.DeleteUserMemberShip(member.userID, groupID, key, '');
                                var type = 'subgroup';
                                var targetinfo = {id: key, url: groupID+'/'+key, title: key, type: 'subgroup' };
                                var area = {type: 'subgroup-member-removed' };
                                var group_id = groupID+'/'+key;
                                var memberuserID = member.userID;
                                //for group activity record
                                activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                            }
                            messageService.showSuccess("Membership Deleted Successfully");
                        })
                    }
                }, function(reason) {
                    messageService.showFailure(reason);
                });
        }

    }



})();

(function () {
    'use strict';
    angular
        .module('app.quiz', ['core'])
        .directive('onBookRender', function ($timeout, quizService) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last) {
                        $timeout(function () {
                            $('#bookId' + quizService.getBookIndex() + '').addClass('selectedBook')
                        }, 0);
                    }
                }
            }
        })
        .directive('onChapterRender', function ($timeout, quizService) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    $timeout(function () {
                        if (scope.$last) {
                            //$('#chapid' + quizService.getChapterIndex() + '').addClass('selectedChapter')
                        }
                    }, 0);


                }
            }
        })
        .directive('onTopicRender', function ($timeout, quizService) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last) {
                        $timeout(function () {
                            $('#topicId' + quizService.getTopicIndex() + '').addClass('selectedTopic')
                        }, 0);
                    }
                }
            }
        })
        .factory('quizService', ["$location", function ($location) {
            var that = this;

            that.book = null;
            that.bookIndex = null;
            that.chapter = null;
            that.chapterIndex = null;
            that.topic = null;
            that.topicIndex = null;
            that.question = null;
            that.bookAfterCreation = null;
            that.SelectedQuestion = null;

            that.selectedTab = null;

            return {
                /*    Tabs    */
                'getSelectedTab': function () {
                    return that.selectedTab;
                },
                'setSelectedTab': function (tab) {
                    that.selectedTab = tab;
                },

                'quiz': function () {

                },
                'getSelected': function () {
                    return {
                        book: that.book,
                        chapter: that.chapter,
                        topic: that.topic
                    }
                },
                'getBook': function () {
                    return that.book;
                },
                'getChapter': function () {
                    return that.chapter;
                },
                'getTopic': function () {
                    return that.topic;
                },
                'getQuestionObject': function () {
                    return that.question;
                },

                'getBookIndex': function () {
                    return that.bookIndex;
                },
                'getChapterIndex': function () {
                    return that.chapterIndex + '';
                },
                'getTopicIndex': function () {
                    return that.topicIndex;
                },
                'getBookAfterCreation': function () {
                    return that.bookAfterCreation;
                },


                'setBook': function (bookId, bookIndex) {
                    that.book = bookId
                    that.bookIndex = bookIndex
                },
                'setChapter': function (chapterId, chapterIndex) {
                    that.chapter = chapterId
                    that.chapterIndex = chapterIndex
                },
                'setTopic': function (topicId, topicIndex) {
                    that.topic = topicId
                    that.topicIndex = topicIndex
                },
                'setQuestionObject': function (question) {
                    that.question = question;
                },

                'getSelectedBook': function () {
                    return that.SelectedBook;
                },
                'getSelectedChapter': function () {
                    return that.SelectedChapter;
                },
                'getSelectedTopic': function () {
                    return that.SelectedTopic;
                },
                'getSelectedQuestion': function () {
                    return that.SelectedQuestion;
                },
                'setSelectedBook': function (index) {
                    that.SelectedBook = index;
                },
                'setSelectedChapter': function (index) {
                    that.SelectedChapter = index;
                },
                'setSelectedTopic': function (index) {
                    that.SelectedTopic = index;
                },
                'setSelectedQuestion': function (index) {
                    that.SelectedQuestion = index;
                },
                'setBookAfterCreation': function (book) {
                    that.bookAfterCreation = book;
                }
            }
        }])
        .service('navService', function ($mdSidenav, $mdUtil, $log, $timeout) {
            var $scope = this;
            $scope.toggleRight1 = buildToggler('nav1');
            $scope.toggleRight2 = buildToggler('nav2');
            $scope.toggleRight3 = buildToggler('nav3');
            $scope.toggleRight4 = buildToggler('nav4');
            $scope.toggleRight5 = buildToggler('nav5');
            $scope.toggleRight6 = buildToggler('nav6');

            function buildToggler(navID) {
                var debounceFn = $mdUtil.debounce(function () {
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            $log.debug("toggle " + navID + " is done");
                        });
                }, 200);
                return debounceFn;


            }

            $scope.close = function () {
                $mdSidenav('nav1').close()
                    .then(function () {
                        $log.debug("close LEFT is done");
                    });
            }

            $scope.close = function () {
                $mdSidenav('nav2').close()
                    .then(function () {
                        $log.debug("close LEFT is done");
                    });
            }


            $scope.close = function () {
                $mdSidenav('nav3').close()
                    .then(function () {
                        $log.debug("close RIGHT is done");
                    });
            };


            $scope.close = function () {
                $mdSidenav('nav4').close()
                    .then(function () {
                        $log.debug("close RIGHT is done");
                    });
            };
            $scope.close = function () {
                $mdSidenav('nav5').close()
                    .then(function () {
                        $log.debug("close RIGHT is done");
                    });
            };
            $scope.close = function () {
                $mdSidenav('nav6').close()
                    .then(function () {
                        $log.debug("close RIGHT is done");
                    });
            };
        })

})();

/**
 * Created by Adnan Irfan on 06-Jul-15.
 */
(function () {
    'use strict';

    angular
        .module('app.quiz')
        .controller('QuizController', QuizController);

    QuizController.$inject = ["$rootScope", "appConfig", "messageService", "$stateParams", "utilService", "$q", "$mdDialog", "quizService", "$location", "userService", "navService", "$firebaseArray", "$timeout", "$mdToast", "firebaseService", "$firebaseObject", "$sce", "authService"];

    function QuizController($rootScope, appConfig, messageService, $stateParams, utilService, $q, $mdDialog, quizService, $location, userService, navService, $firebaseArray, $timeout, $mdToast, firebaseService, $firebaseObject, $sce, authService) {

        /*Private Variables*/
        var $scope = this;
        $scope.img = '../../img/userImg1.svg';
        $scope.show = false;
        $scope.showView = false;
        $scope.showQuizBank = true;
        $scope.showQuizList = false;
        $scope.showQuizAssign = false;
        $scope.questionView = null;
        //for toolbar text hide
        $scope.chapterSearch = false;
        $scope.topicSearch = false;
        $scope.questionSearch = false;
        $scope.quizSearch = false;
        $scope.quizQuestionSearch = false;
        $scope.chaptersSideNavSearch = false;
        $scope.topicSideNavSearch = false;
        $scope.questionSideNavSearch = false;
        $scope.inputEnter = false;

        $scope.selectedQuestionIndex = null;
        $scope.selectedTopicIndex = null;
        $scope.selectedChapterIndex = null;

        $scope.addBook = addBook;
        $scope.createBook = createBook;
        $scope.addChapter = addChapter;
        $scope.createChapter = createChapter;
        $scope.closeChapter = closeChapter;
        $scope.addTopic = addTopic;
        $scope.createTopic = createTopic;
        $scope.closeTopic = closeTopic;
        $scope.closeBook = closeBook;
        $scope.closeQuestion = closeQuestion;
        $scope.addQuestion = addQuestion;
        $scope.editChapter = editChapter;
        $scope.hover = hover;
        $scope.editHover = editHover;
        $scope.showChapters = showChapters;
        $scope.showTopics = showTopics;
        $scope.showQuestions = showQuestions;
        $scope.showQuestionView = showQuestionView;
        $scope.showQuizChapters = showQuizChapters;
        $scope.showQuizTopics = showQuizTopics;

        $scope.setSelectedBook = setSelectedBook;
        $scope.setSelectedChapter = setSelectedChapter;
        $scope.setSelectedTopic = setSelectedTopic;
        $scope.setSelectedQuestion = setSelectedQuestion;
        $scope.setSelectedQuizes = setSelectedQuizes;

        $scope.SelectedBook = null;
        $scope.SelectedChapter = null;
        $scope.SelectedTopic = null;
        $scope.SelectedQuestion = null;
        $scope.showQuizBankFunc = showQuizBankFunc;
        $scope.showQuiz = showQuiz;
        $scope.showAssignQuiz = showAssignQuiz;
        $scope.showAttemptQuiz = showAttemptQuiz;
        $scope.addQuiz = addQuiz;
        $scope.closeQuiz = closeQuiz;

        $scope.afterLoad = afterLoad;

        $scope.bookId = '';
        $scope.chapterId = '';
        $scope.topicId = '';
        //Firebase
        var ref = new Firebase('https://pspractice.firebaseio.com');
        var refMain = new Firebase('https://luminous-torch-4640.firebaseio.com');
        $scope.books = [];
        $scope.booksId = [];
        $scope.quizes = [];
        $scope.chaptersId = [];
        $scope.chapters = [];
        $scope.topicsId = [];
        $scope.topics = [];
        $scope.questions = [];
        $scope.groups = [];
        //QUIZ SCEDULE variables & functions
        $scope.closeAssignQuiz = closeAssignQuiz;
        $scope.setSelectedGroup = setSelectedGroup;
        $scope.setSelectedSubGroup = setSelectedSubGroup;
        $scope.quizesList = [];
        $scope.quizesListKey = [];
        $scope.subGroup = [];
        $scope.myDatabase = [];
        $scope.selectedGroup = null;
        $scope.dataPush = dataPush;
        $scope.setSelectedQuiz = setSelectedQuiz;


        /*All Function*/

        setTabs()

        authService.resolveUserPage()
            .then(function (response) {
                getUserObj();
                initializeView();
            }, function (err) {
                alert('Error in Line 86: ' + err)
            });
        setTabs();

        function setTabs() {
            if (quizService.getSelectedTab() == 'QuizBank') {
                $timeout(function () {
                    showQuizBankFunc();
                }, 0)
            } else if (quizService.getSelectedTab() == 'Quiz') {
                $timeout(function () {
                    showQuiz();
                }, 0)
            } else if (quizService.getSelectedTab() == 'QuizAssign') {
                $timeout(function () {
                    showAssignQuiz();
                }, 0)
            }
        }

        function initializeView() {
            // console.log(quizService.getBookAfterCreation())
            // console.log(quizService.getBookAfterCreation() !== null)

            if (quizService.getBookAfterCreation() !== null) {
                ref.child('question-bank').on('child_added', function (snapShot) {
                    $timeout(function () {
                        $scope.books.push(snapShot.val());
                        $scope.booksId.push(snapShot.key());
                        if (quizService.getBookAfterCreation() == snapShot.key()) {
                            $scope.selectedBookIndex = $scope.booksId.indexOf(snapShot.key());
                            $scope.bookId = snapShot.key();
                        }
                    }, 0)
                });
            } else {
                // console.log('ELSE');
                ref.child('question-bank').on('child_added', function (snapShot) {
                    $timeout(function () {
                        $scope.books.push(snapShot.val());
                        $scope.booksId.push(snapShot.key());

                    }, 0)
                });

                /*if(quizService.getSelectedBook()) {
                 $scope.selectedBookIndex = quizService.getSelectedBook();
                 $scope.bookId = quizService.getBook();
                 }else{
                 $scope.selectedBookIndex = 0;
                 $scope.bookId = quizService.getBook();
                 quizService.setBook($scope.bookId, $scope.selectedBookIndex);
                 }*/

                if (quizService.getBook() !== null) {
                    $scope.bookId = quizService.getBook();
                    $scope.selectedBookIndex = quizService.getSelectedBook();
                    console.log(quizService.getBook());
                    ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
                        $timeout(function () {
                            $scope.chapters.push(snapShot.val());
                            $scope.chaptersId.push(snapShot.key());
                        }, 0)
                    });
                    if (quizService.getChapter() !== null) {
                        $scope.chapterId = quizService.getChapter();
                        ref.child('question-bank-topic').child(quizService.getBook()).child(quizService.getChapter()).on('child_added', function (snapShot) {
                            $timeout(function () {
                                $scope.topics.push(snapShot.val());
                                $scope.topicsId.push(snapShot.key());
                            }, 0)
                        });
                        $scope.selectedChapterIndex = quizService.getSelectedChapter()
                        if (quizService.getTopic() !== null) {
                            $scope.topicId = quizService.getTopic();
                            ref.child('questions').child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).on('child_added', function (snapShot) {
                                $timeout(function () {
                                    $scope.questions.push(snapShot.val())
                                }, 0)
                            });
                            $scope.selectedTopicIndex = quizService.getSelectedTopic()
                            console.log(quizService.getSelectedQuestion())
                            console.log(quizService.getQuestionObject())
                            if (quizService.getSelectedQuestion() !== null) {
                                if (quizService.getQuestionObject() !== null) {
                                    $scope.selectedQuestionIndex = quizService.getSelectedQuestion();
                                    showQuestionView(quizService.getQuestionObject())
                                }
                            }
                        }
                    }
                }
                /*else {
                 $scope.bookId = $scope.booksId[0];
                 quizService.setBook($scope.bookId, 0);

                 }*/
            }
        };

        function afterLoad(check) {
            if (check) {
            }

        };

        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        }

        /*  Tabs  */
        function showQuizBankFunc() {
            $scope.showQuizBank = true;
            $scope.showQuizList = false;
            $scope.showQuizAssign = false;
            if (quizService.getQuestionObject() !== null && $scope.questionView !== null) {
                $scope.showView = true;
            }
            $('#chapterColumn').addClass('marginLeft')
            $('#quizBankIcon').addClass('selectedTab')
            $('#quizIcon').removeClass('selectedTab')
            $('#quizAssignIcon').removeClass('selectedTab')
            quizService.setSelectedTab('QuizBank');

            //$scope.chapters = [];
            //$scope.topics = [];
            //$scope.questions = [];
            //$scope.chaptersId = [];
            //$scope.topicsId = [];
            //$scope.questionsId = [];
        }

        function showQuiz() {
            $scope.showQuizBank = false;
            $scope.showQuizList = true;
            $scope.showQuizAssign = false;
            $scope.showView = false;
            //$('#chapterColumn').removeClass('marginLeft')
            $('#quizBankIcon').removeClass('selectedTab')
            $('#quizIcon').addClass('selectedTab')
            $('#quizAssignIcon').removeClass('selectedTab')
            quizService.setSelectedTab('Quiz');

            //$scope.chapters = [];
            //$scope.topics = [];
            //$scope.questions = [];
            //$scope.chaptersId = [];
            //$scope.topicsId = [];
            //$scope.questionsId = [];
        }

        function showAssignQuiz() {


            $scope.showQuizBank = false;
            $scope.showQuizList = false;
            $scope.showQuizAssign = true;

            $scope.showView = false;
            $('#quizBankIcon').removeClass('selectedTab')
            $('#quizIcon').removeClass('selectedTab')
            $('#quizAssignIcon').addClass('selectedTab')

            quizService.setSelectedTab('QuizAssign');

            $scope.shceduleQuizArray = [];
            //Calling Shcedule Array List
            ref.child('quiz-schedule').on('child_added', function (snapShot) {

                var abc = {
                    group: snapShot.key(),
                    sub_group: []
                };
                $.map(snapShot.val(), function (dbTopics, sbgindex) {
                    //for getting sub groups and topics
                    var sb = {
                        name: sbgindex,
                        topics: []
                    };
                    //var tmp2 = {name: sbgindex, topics:
                    $.map(dbTopics, function (quiz, quizindex) {

                        //Quiezes
                        var qiuzess = [];
                        $.map(quiz, function (quizDb, qindex) {
                            qiuzess.push(quizDb);
                        }); //map quizDb

                        //Topics
                        var topicx = {
                            name: quizindex,
                            quizes: qiuzess
                        };
                        sb.topics.push(topicx);

                    }) //map dbtopic

                    //  };//tmp2

                    //var g = tmp2;
                    abc.sub_group.push(sb);

                    // ////for getting sub groups and topics
                    // var sb = { name: sbgindex, topics: [] };
                    // var tmp2 = {name: sbgindex, topics: $.map(dbTopics, function(quiz, quizindex){
                    //     var t = {name: quizindex, quizes: quiz}
                    //     sb.topics.push(t);
                    //     })
                    // };
                    // var g = tmp2;
                    // abc.sub_group.push(sb);


                    //for getting sub groups
                    // var tmp2 = {name: sbgindex, topics: dbTopics};
                    // abc["sub_group"].push(tmp2);
                }); //


                $scope.shceduleQuizArray.push(abc);

                console.log(JSON.stringify($scope.shceduleQuizArray));

                $scope.SearchBindRecord = function (a, b, c) {
                    if (c === 'sub') {
                        $scope.shceduleQuizSubGroups = a.sub_group;

                        //getting All Questions of Specific Groups
                        $scope.shceduleQuizQuizes = [];
                        $scope.shceduleQuizArray.forEach(function (value, index) {

                            if (value.group == b) {
                                value.sub_group.forEach(function (val, indx) {

                                    val.topics.forEach(function (v, i) {

                                        v.quizes.forEach(function (q, qi) {
                                            $scope.shceduleQuizQuizes.push(q);


                                        }); //q

                                    }); //v
                                }); //val

                                //console.log('length: ' + $scope.shceduleQuizQuizes.length + '|' + JSON.stringify($scope.shceduleQuizQuizes));
                            } //if
                        });


                    } // if sub_group

                    if (c === 'topic') {
                        $scope.shceduleQuizTopics = a.topics;


                        //getting All Questions of Specific Sub Group
                        $scope.shceduleQuizQuizes = [];
                        $scope.shceduleQuizArray.forEach(function (value, index) {


                            value.sub_group.forEach(function (val, indx) {

                                console.log('topic----: ' + JSON.stringify(val));

                                if (val.name == b) {
                                    val.topics.forEach(function (v, i) {

                                        v.quizes.forEach(function (q, qi) {
                                            $scope.shceduleQuizQuizes.push(q);
                                        }); //q

                                    }); //v
                                } //if
                            }); //val

                            console.log('length: ' + $scope.shceduleQuizQuizes.length + '|' + JSON.stringify($scope.shceduleQuizQuizes));

                        });


                    } //topic

                    if (c === 'quiz') {



                        //console.log('a-->: '+ JSON.stringify(a.topics));
                    } //quiz


                }; // SearchBindRecord
                //$scope.SearchBindRecord($scope.shceduleQuizArray, 'saylani', 'sub');


            });


        }

        function showAttemptQuiz() {
            $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quiz-attempting')
            document.getElementById('navBar').style.display = "none";
        }

        /*  Selection  */
        function setSelectedQuestion(that, index) {
            $scope.selectedQuestionIndex = index;
            quizService.setSelectedQuestion(index)
            /*if ($scope.lastSelectedTopic.selectedTopic) {
             console.log("show", arguments, that);
             $('.selectedTopic').addClass('previousSelected')
             if ($scope.lastSelectedQuestion) {
             $scope.lastSelectedQuestion.selectedQuestion = '';
             }
             that.selectedQuestion = 'selectedQuestion';
             $scope.lastSelectedQuestion = that;
             }
             console.log($scope.lastSelectedTopic.selectedTopic)*/
        }

        function setSelectedTopic(that, index) {
            $scope.selectedQuestionIndex = null;
            $scope.selectedTopicIndex = index;
            quizService.setSelectedTopic(index)
            quizService.setSelectedQuestion(null)
            /*console.log("show", arguments, that);
             if ($scope.lastSelectedChapter.selected) {
             console.log('in IF')
             $('.previousSelected').removeClass('previousSelected')
             $('.selectedChapter').addClass('previousSelected')
             if ($scope.lastSelectedTopic) {
             $scope.lastSelectedTopic.selectedTopic = '';
             }
             that.selectedTopic = 'selectedTopic';
             $scope.lastSelectedTopic = that;
             }*/
        }

        function setSelectedChapter(that, index) {
            $scope.selectedQuestionIndex = null;
            $scope.selectedTopicIndex = null;
            $scope.selectedChapterIndex = index;
            quizService.setSelectedChapter(index)
            quizService.setSelectedTopic(null)
            quizService.setSelectedQuestion(null)
            /*$('.selectedChapter').removeClass('previousSelected')
             console.log("show", that);
             if ($scope.lastSelectedChapter) {
             $scope.lastSelectedChapter.selected = '';
             }
             quizService.setSelectedChapter(that)
             that.selected = 'selectedChapter';
             $scope.lastSelectedChapter = that;
             console.log($scope.lastSelectedChapter.selected)*/
        }

        function setSelectedBook(that, index) {
            $scope.selectedBookIndex = index;
            quizService.setSelectedBook(index)

            $scope.selectedQuestionIndex = null;
            $scope.selectedTopicIndex = null;
            $scope.selectedChapterIndex = null;
            quizService.setSelectedChapter(null)
            quizService.setSelectedTopic(null)
            quizService.setSelectedQuestion(null)
            /*$scope.selectedQuestionIndex = null;
             $scope.selectedTopicIndex = null;
             $scope.selectedChapterIndex = null;
             if ($scope.lastSelectedBook) {
             $scope.lastSelectedBook.selected = '';
             }
             that.selected = 'selectedBook';
             $scope.lastSelectedBook = that;
             console.log($scope.lastSelectedBook.selected)*/
        }

        function setSelectedQuizes(index) {
            $scope.selectedQuizes = index;
        }

        /*  Question Bank   */
        function showChapters(bookIndex) {
            quizService.setQuestionObject(null)
            quizService.setChapter(null, null);
            quizService.setTopic(null, null);
            console.log('showing Chapters')
            quizService.setQuestionObject(null);
            $scope.showView = false;
            $scope.questionView = null;
            $scope.bookId = $scope.booksId[bookIndex];
            quizService.setBook($scope.bookId, bookIndex);
            $scope.chapterId = null
            $scope.topicId = null
            $scope.show = true;
            $scope.chapters = [];
            $scope.topics = [];
            $scope.questions = [];

            $scope.chaptersId = [];
            $scope.topicsId = [];
            $scope.questionsId = [];
            ref.child('question-bank-chapters').child($scope.bookId).on('child_added', function (snapShot) {
                $timeout(function () {
                    $scope.chapters.push(snapShot.val());
                    $scope.chaptersId.push(snapShot.key());
                }, 0)
            })
        }

        function showTopics(chapterIndex) {
            quizService.setTopic(null, null);
            quizService.setQuestionObject(null);
            $scope.topics = [];
            $scope.questions = [];

            $scope.topicsId = [];
            $scope.questionsId = [];
            $scope.showView = false;
            $scope.topicId = null
            $scope.questionView = null;
            $scope.chapterId = $scope.chaptersId[chapterIndex];
            quizService.setChapter($scope.chapterId, chapterIndex);
            $scope.topics = [];
            $scope.questions = []
            ref.child('question-bank-topic').child($scope.bookId).child($scope.chapterId).on('child_added', function (snapShot) {
                $timeout(function () {
                    $scope.topics.push(snapShot.val());
                    $scope.topicsId.push(snapShot.key());
                }, 0)
            })
        }

        function showQuestions(topicIndex) {
            $scope.showView = false;
            $scope.questionView = null;
            $scope.topicId = $scope.topicsId[topicIndex];
            quizService.setTopic($scope.topicId, topicIndex);
            quizService.setQuestionObject(null);
            $scope.questions = [];
            ref.child('questions').child($scope.bookId).child($scope.chapterId).child($scope.topicId).on('child_added',
                function (snapShot) {
                    $timeout(function () {
                        $scope.questions.push(snapShot.val())
                    }, 0)
                });

        }

        function showQuestionView(question) {
            if (question !== null) {
                quizService.setQuestionObject(question);
            }
            console.log('Showing Question View ' + question);
            $scope.showView = true;
            $scope.questionView = question;
        }

        /*  Quizes functions  */
        $scope.showQuizes = showQuizes;
        $scope.showQuizesQuestions = showQuizesQuestions;
        $scope.quizes = [];

        function showQuizes(bookIndex) {
            $scope.quizes = [];
            ref.child('quiz-create').child(quizService.getBook()).on('child_added', function (snapShot) {
                var temp = {
                    details: snapShot.val().quizDetails,
                    key: snapShot.key()
                };
                $scope.quizes.push(temp);
            });
        }

        function showQuizesQuestions(index) {
            $scope.Array = [];
            var iterator = 0;
            var chapterKey = '';
            console.log('showing quiz Questions');
            ref.child('quiz-create').child(quizService.getBook()).child($scope.quizes[index].key).child('quizQuestion')
                .on('child_added', function (snapShot) {
                    chapterKey = snapShot.key();
                    var chapterTemp = snapShot.val().ChapterDetails;
                    ref.child('quiz-create').child(quizService.getBook()).child($scope.quizes[index].key).child('quizQuestion')
                        .child(chapterKey).child('ChapterTopics').on('child_added', function (snap) {
                        var topicTemp = snap.val().TopicDetails;
                        ref.child('quiz-create').child(quizService.getBook()).child($scope.quizes[index].key).child('quizQuestion')
                            .child(chapterKey).child('ChapterTopics').child(snap.key())
                            .child('TopicQuestions').on('child_added', function (shot) {
                            $scope.Array[iterator] = {
                                chapterDetails: chapterTemp,
                                topicDetails: topicTemp,
                                question: shot.val()
                            };
                            iterator++;
                        });

                    });
                });

        }

        /*  Quiz Assign  */
        /*refMain.child('groups-names').on('child_added', function (snapshot) {
         $scope.groups.push({
         details : snapshot.val(),
         key   : snapshot.key()
         });
         console.log( snapshot.val() + ' ' + snapshot.key());
         })*/
        $scope.assignQuiz = assignQuiz;
        // console.log($localStorage.loggedInUser)
        //$scope.userID = '123654789';
        /*userService.getCurrentUser()*/
        var groupDataUbind = {}
        var userDataUbind = {}
        var userObjUbind;
        $scope.userObj = [];

        function getUserObj() {
            // console.log('getUserObj: ' + userService.getCurrentUser().userID)
            //var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.userID))
            var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child(userService.getCurrentUser().userID))
                .$loaded()
                .then(function (data) {
                    //alert(data.$id)
                    // console.log('THEN getUserObj')

                    userObjUbind = data.$watch(function () {
                        getUserObj()
                    })
                    $scope.userObj = data;
                    data.forEach(function (el, i) {
                        var j = i;
                        $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                            .$loaded()
                            .then(function (groupData) {
                                groupDataUbind[j] = groupData.$watch(function () {
                                    $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""
                                });
                                $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""

                                if (groupData['group-owner-id']) {
                                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/!*.child('profile-image')*!/)
                                    $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
                                        .$loaded()
                                        .then(function (img) {

                                            $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value);
                                            userDataUbind[j] = img.$watch(function (dataVal) {

                                                $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img)
                                            })
                                            // console.log($scope.userObj)
                                        })

                                }
                            });
                    });
                })
                .catch(function (err) {
                    //alert(err);
                })
        };

        function assignQuiz() {
            /* $timeout(function () {
             $location.path('/user/:userID/quiz/quizAssign');
             }, 0)*/
            $scope.subGroup = [];
            $timeout(function () {
                $scope.showQuizSceduling = navService.toggleRight6;
                $scope.showQuizSceduling();
            }, 0)

            $scope.quizesList = [];
            ref.child('quiz-create').child(quizService.getBook()).on('child_added', function (snapShot) {
                $scope.quizesListKey.push(snapShot.key());
                $scope.quizesList.push(snapShot.val().quizDetails);
                console.log(snapShot.val());

            });
            console.log($scope.quizesListKey);

            for (var i = 0; i < $scope.userObj.length; i++) {

                $scope.myDatabase[i] = {
                    groupId: $scope.userObj[i].$id,
                    subGroupId: null,
                    subGroupIdIndex: null,
                    bookId: quizService.getBook(),
                    quizId: null


                };

            }

            console.log($scope.myDatabase);
        }


        function setSelectedQuiz(id) {
            $scope.seclectedQuizID = id;
            for (var i = 0; i < $scope.userObj.length; i++) {

                if ($scope.myDatabase[i].groupId == $scope.selectedGroup) {
                    $scope.myDatabase[i].quizId = $scope.seclectedQuizID;

                }
                console.log($scope.myDatabase[i]);
            }
            //            console.log($scope.myDatabase);

        }


        function setSelectedGroup(id, index) {
            $scope.selectedGroup = id;
            $scope.selectedGroupIndex = index;
            $scope.subGroup = [];
            refMain.child('subgroups').child(id).on('child_added', function (snapShot) {
                $scope.subGroup.push(snapShot.key());
                console.log($scope.subGroup);
            });


        }

        function setSelectedSubGroup(id, index) {
            $scope.subGroupId = id;
            for (var i = 0; i < $scope.userObj.length; i++) {

                if ($scope.myDatabase[i].groupId == $scope.selectedGroup) {
                    $scope.myDatabase[i].subGroupId = id;
                    $scope.myDatabase[i].quizId = $scope.seclectedQuizID;
                    $scope.myDatabase[i].subGroupIdIndex = index;
                }


            }
            console.log($scope.myDatabase);
        }


        function dataPush() {


            for (var i = 0; i < $scope.userObj.length; i++) {


                if ($scope.myDatabase[i].subGroupId != null && $scope.myDatabase[i].quizId != null) {

                    for (var a = 0; a < $scope.quizesList.length; a++) {
                        if ($scope.quizesList[a].title == $scope.myDatabase[i].quizId) {
                            alert("yes");
                            ref.child('quiz-schedule').child($scope.myDatabase[i].groupId).child($scope.myDatabase[i].subGroupId).child($scope.myDatabase[i].bookId).push({
                                quizName: $scope.quizesList[a].title,
                                quizUid: $scope.quizesListKey[a]
                            });
                            console.log($scope.myDatabase[i]);
                        }
                    }
                }
            }
            closeAssignQuiz();
        }


        function closeAssignQuiz() {
            $scope.showQuizSceduling = navService.toggleRight6;
            $scope.showQuizSceduling();

        }


        function showQuizChapters(bookIndex) {
            console.log('showing quiz Chapters')
            $scope.bookId = $scope.booksId[bookIndex];
            quizService.setBook($scope.bookId, bookIndex);
        }

        function showQuizTopics() {
            console.log('showing quiz Topics')
        }


        /*  Question Bank Addition Functions  */

        //        Create Book Navigation Start
        $scope.desc = "";
        $scope.newImg = null;
        $scope.imgLogoUrl;
        var userQuestionBanksRef1 = new Firebase('https://pspractice.firebaseio.com/');

        function addBook() {
            $scope.showbook = navService.toggleRight1;
            $scope.showbook();
        }

        function createBook(bookForm, p) {
            //alert('hi')
            console.log($scope.imgLogoUrl)
            console.log($rootScope.newImg);
            $scope.temps = {

                title: $scope.name,
                description: $scope.desc,
                //imgLogoUrl: $scope.imgLogoUrl || 'img/1angular.png'
                imgLogoUrl: p
            };

            console.log('tmp: ' + JSON.stringify($scope.temps))

            userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child($scope.bookID).set({
                'membership-type': 1
            });
            userQuestionBanksRef1.child("question-bank-memberships").child($scope.bookID).child(userService.getCurrentUser().userID).set({
                "membership-type": 1
            });
            userQuestionBanksRef1.child("question-bank").child($scope.bookID).set($scope.temps);
            console.log($scope.temps);


            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                console.log(x)
                console.log(temp)
                console.log(mimeType)
                console.log($scope.bookID)
                $scope.saveFile(x, mimeType, $scope.bookID)
                    .then(function (url) {
                        // $scope.temps.imgLogoUrl = url + '?random=' + new Date();
                        //its for sending data on firebase by Name's node
                        userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child($scope.bookID).set({
                            'membership-type': 1
                        });
                        userQuestionBanksRef1.child("question-bank-memberships").child($scope.bookID).child(userService.getCurrentUser().userID).set({
                            "membership-type": 1
                        });
                        userQuestionBanksRef1.child("question-bank").child($scope.bookID).set($scope.temps);
                        console.log($scope.temps);

                        // quizService.setBookAfterCreation($scope.bookID)
                        // ref.child($scope.bookID).set(temp);
                        $scope.name = "";
                        $scope.desc = "";
                        $scope.bookID = "";
                        //$scope.newImg = null;
                        alert('book creation successful')
                        // $location.path('/user/' + user.userID)
                    })
                    .catch(function () {
                        //bookForm.$submitted = false;
                        //return messageService.showSuccess('picture upload failed')
                        alert('picture upload failed')
                    });
            }


        }

        $scope.showAdvanced1 = function (ev) {
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue.tmpl.html',
                targetEvent: ev
            }).then(function (picture) {
                $rootScope.newImg = picture;
                console.log("this is image" + picture)
            }, function (err) {
                console.log(err)

            })

        };

        $scope.saveFile = function (file, type, quizID) {

            console.log(file);
            console.log(type);
            console.log(quizID);

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savequizBookPicture?quizID=" + quizID + "&file_type=" + type);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(alert("Could not get signed URL."))
                    }
                }
            };
            defer.resolve(true)
            /*remove it*/
            //            xhr.send();
            return defer.promise;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function (data) {
                console.log(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....');
                    console.log('picture upload successful')
                    console.log(url);

                    defer.resolve(url)

                }
            };
            xhr.onerror = function (error) {
                defer.reject(messageService.showSuccess("Could not upload file."));
            };
            xhr.send(file);
            console.log(file);
            return defer.promise;
        }

        function closeBook() {
            $scope.showbook = navService.toggleRight1;
            $scope.showbook();
        }

        //        Create Book Navigation End


        /*  Question Bank Addition Functions  */
        /*        function addBook() {
         //console.log('Add Book')
         $timeout(function () {
         $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddBook')
         }, 0)
         }*/

        var ref = new Firebase('https://pspractice.firebaseio.com/');

        $scope.bookId = $stateParams.id;
        $scope.Title = '';
        $scope.Description = '';

        function createChapter() {
            console.log($scope.Title + " " + $scope.Description)
            ref.child("question-bank-chapters").child($scope.bookId).push({
                title: $scope.Title,
                description: $scope.Description
            }, function () {
                $scope.Title = '';
                $scope.Description = '';

            });
        }

        function addChapter() {
            if ($scope.bookId) {
                $timeout(function () {
                    $scope.showChapter = navService.toggleRight2;
                    $scope.showChapter();
                }, 0)
            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Book' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }
        }

        function closeChapter() {
            $scope.showChapter = navService.toggleRight2;
            $scope.showChapter();
        }


        $scope.Title = '';
        $scope.Description = '';
        $scope.chapterId = $stateParams.id;

        function createTopic() {
            ref.child("question-bank-topic").child(quizService.getBook()).child($scope.chapterId).push({
                description: $scope.Description,
                title: $scope.Title
            });
        }

        function addTopic() {
            //console.log('Add Book')
            if ($scope.chapterId) {
                $timeout(function () {
                    //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddTopic/' + $scope.chapterId)
                    $scope.showTopic = navService.toggleRight4;
                    $scope.showTopic();
                }, 0)
            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Chapter' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }
        }

        function closeTopic() {
            $scope.showTopic = navService.toggleRight4;
            $scope.showTopic();
        }

        function addQuestion() {
            //console.log('Add Book')
            if ($scope.topicId) {
                $timeout(function () {
                    //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddQuestion/' + $scope.topicId)
                    $scope.showQuestion = navService.toggleRight3;
                    $scope.showQuestion();
                }, 0)
            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Topic' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }
        }

        function closeQuestion() {
            $scope.showQuestion = navService.toggleRight3;
            $scope.showQuestion();
        }


        //AddQuestion Controller Work
        var that = this;
        var myFirebaseRef = new Firebase("https://pspractice.firebaseio.com/");
        var idCounter = 3;
        this.showRadioOptions = false;
        this.showCheckOptions = false;
        this.showAddButton = false;
        this.myAnswer = undefined;
        this.myType = '';
        that.answerTag = [];
        that.myTop = ['40px', '50px'];
        var topMargin = 50;
        this.showCheckText = false;
        this.topicId = $stateParams.id;
        //
        //
        //Answer Types.
        this.types = [{
            name: 'Radio Button'
        }, {
            name: 'CheckBox'
        }];
        this.question = {
            Title: '',
            Description: '',
            Type: '',
            QuestionOptions: [{
                optionText: '',
                id: 2,
                rightAnswer: false
            }, {
                optionText: '',
                id: 3,
                rightAnswer: false
            }]
        };
        //If Answer Type Changes.
        this.typeChanged = function () {

            that.radioValue = '';
            that.myAnswer = undefined;
            that.myTop = ['40px', '90px'];
            topMargin = 50;
            angular.forEach(that.question.QuestionOptions, function (data) {
                if (data.id === true) {
                    data.id = false;
                }
            });
        };
        //Setting different inputs.
        this.setBoxValue = function () {
            this.showAddButton = true;
            that.question.QuestionOptions = [{
                optionText: '',
                id: 2,
                rightAnswer: false
            }, {
                optionText: '',
                id: 3,
                rightAnswer: false
            }];
            if (that.myType.name === 'Radio Button') {
                that.showRadioOptions = true;
                that.showCheckOptions = false;
                that.answerTag = [];
                that.myAnswer = undefined;
            } else if (that.myType.name === 'CheckBox') {
                that.showCheckOptions = true;
                that.showRadioOptions = false;
                that.answerTag = [];
                that.myAnswer = undefined;
            }
        };
        //Push new input fields.
        this.addOption = function () {

            //Radio margin.
            if (topMargin < 100) {
                topMargin += 50;
            }
            that.myTop.push(topMargin + 'px');
            idCounter++;
            that.question.QuestionOptions.push({
                optionText: '',
                id: idCounter,
                rightAnswer: false
            });
        };
        //Delete Option
        this.deleteOption = function (optionIndex) {
            if (optionIndex > -1) {
                that.question.QuestionOptions.splice(optionIndex, 1);
            }
        };

        //Sets Answer if Type CheckBox is selected.
        that.setCheckBoxValue = function (questionId) {
            if (that.question.QuestionOptions[questionId].id == true) {
                that.question.QuestionOptions[questionId].rightAnswer = true;
                that.answerTag.push('one');
            } else if (that.question.QuestionOptions[questionId].id == false) {
                that.question.QuestionOptions[questionId].rightAnswer = false;
                that.answerTag.pop();
            }
        };
        //        //Add more Questions, Saves data to firebase and clears input fields.
        that.addQuestionsAndContinue = function () {
            that.showRadioOptions = false;
            that.showCheckOptions = false;
            that.showAddButton = false;
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function (data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    } else {
                        data.rightAnswer = false;
                    }
                });
            }
            angular.forEach(that.question.QuestionOptions, function (data) {
                delete data.$$hashKey;
                delete data.$$mdSelectId;
                delete data.id;
            });
            that.question.Type = that.myType.name;
            myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(that.question);
            that.question = {
                Title: '',
                Description: '',
                Type: '',
                Answer: [],
                QuestionOptions: [{
                    optionText: '',
                    id: 2,
                    rightAnswer: false
                }, {
                    optionText: '',
                    id: 3,
                    rightAnswer: false
                }]
            };
            that.myAnswer = undefined;
        };
        //Redirect on close
        this.prev = function () {
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            });
        };
        //Save and Exit Button
        this.showAnswer = function () {
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function (data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    } else {
                        data.rightAnswer = false;
                    }
                });
            }
            angular.forEach(that.question.QuestionOptions, function (data) {
                delete data.$$hashKey;
                delete data.$$mdSelectId;
                delete data.id;
            });
            that.question.Type = that.myType.name;
            myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(that.question, function () {

                that.question = {};
                abc();
            });

            that.myAnswer = undefined;

        };


        //View Dialog Box.
        this.showAdvanced = function (ev) {
            that.question.Type = that.myType.name;
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function (data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    } else {
                        data.rightAnswer = false;
                    }
                });
            }
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: './components/quiz-add-question/dialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        questionData: that.question
                    }
                })
                .then(function (answer) {

                }, function () {

                });
        };

        //addQuestion work end


        function editChapter(chapter) {
            alert(chapter.name);
            chapter.showEdit = !chapter.showEdit;
        }

        function addQuiz() {

            /*$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizCreate/')*/

            if ($scope.bookId) {
                $timeout(function () {
                    //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizCreate/')

                    $scope.showQuize = navService.toggleRight5;
                    $scope.showQuize();

                    //Parou Code
                    var that = this;
                    var bookId = '';
                    var chapId = '';
                    var marker = 0;
                    $scope.awaisObject = {};
                    $scope.flagChapters = [];
                    $scope.flagTopics = [];
                    $scope.showQuestionView1 = false;
                    $scope.quizObject = {};

                    //temporary
                    $scope.showTick = true;
                    $scope.buttonText = 'Next';
                    $scope.quizTitle = '';
                    var topicCounter = 0;
                    $scope.quizDescription = '';
                    $scope.quizTime = '';
                    var myCounter = 0;
                    $scope.questionIndex = 0;
                    $scope.tempQuestions = [];
                    $scope.myChapterIndex = 0;
                    $scope.viewAllQuestions = [];
                    $scope.viewAllTopics = [];
                    //bring the chapters from firebase

                    $scope.secondBookName = 'angular101';
                    $scope.secondChapters = [];
                    $scope.secondChaptersKey = [];
                    /*This will show hide quiz tabs*/
                    var counter = 1;
                    var tabCounter = 1;
                    var arr = [],
                        name = '';
                    $scope.myChapters = [];
                    $scope.myChaptersKey = [];
                    $scope.thirdTopics = [];
                    //Data fetching from firebase
                    $scope.chapters = [];
                    $scope.chaptersId = [];
                    $scope.nestedQuestions = [];
                    $scope.topics = [];
                    $scope.topicsId = [];
                    $scope.questions = [];
                    $scope.questionsId = [];
                    $scope.showOne = false;
                    $scope.showTwo = true;
                    $scope.showThree = false;
                    //Second Page
                    // all variables
                    $scope.show = false;
                    $scope.showView = false;
                    $scope.showQuizBar = false;
                    $scope.showTick = false;
                    $scope.bookId = '';
                    $scope.chapterId = '';
                    $scope.topicId = null;
                    $scope.SelectedBook = null;
                    $scope.SelectedChapter = null;
                    $scope.SelectedTopic = null;
                    $scope.SelectedQuestion = null;
                    /*$scope.quizes = [];*/
                    $scope.chaptersId = [];
                    $scope.chapters = [];
                    $scope.topicsId = [];
                    $scope.topics = [];
                    $scope.questions = [];
                    $scope.questionView = '';
                    $scope.latestNode = [];


                    /*
                     if (tabCounter == 1) {
                     //Tab Icons
                     that.oneTab = true;
                     that.twoTab = true;
                     that.threeTab = false;
                     tabCounter++;

                     }*/


                    // seleted data start
                    $scope.setSelectedQuestion = function (thisScope) {

                        if ($scope.lastSelectedTopic.selectedTopic) {
                            $('.selectedTopic').addClass('previousSelected');
                            if ($scope.lastSelectedQuestion) {
                                $scope.lastSelectedQuestion.selectedQuestion = '';
                            }
                            thisScope.selectedQuestion = 'selectedQuestion';
                            $scope.lastSelectedQuestion = thisScope;
                        }
                    };

                    $scope.setSelectedTopics = function (thisScope) {
                        if ($scope.lastSelectedChapter.selected) {
                            $('.previousSelected').removeClass('previousSelected');
                            $('.selectedChapter').addClass('previousSelected');
                            if ($scope.lastSelectedTopic) {
                                $scope.lastSelectedTopic.selectedTopic = '';
                            }
                            thisScope.selectedTopic = 'selectedTopic';
                            $scope.lastSelectedTopic = thisScope;
                        }
                    };

                    $scope.setSelectedChapters = function (thisScope) {

                        $('.selectedChapter').removeClass('previousSelected');
                        if ($scope.lastSelectedChapter) {
                            $scope.lastSelectedChapter.selected = '';
                        }
                        quizCreateService.setSelectedChapter(thisScope);
                        thisScope.selected = 'selectedChapter';
                        $scope.lastSelectedChapter = thisScope;
                    };
                    //selected data end
                    //2nd Tab Functions
                    var chapterCounter = 0;
                    //Chapters

                    ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
                        //$timeout(function () {

                        $scope.chapters.push(snapShot.val());
                        /*console.log($scope.chapters.push(snapShot.val()));*/
                        $scope.chaptersId.push(snapShot.key());
                        $scope.chaptersSnapData = snapShot.val();
                        $scope.nestedQuestions.push([]);
                        $scope.flagChapters[chapterCounter] = {};
                        $scope.flagChapters[chapterCounter].id = true;
                        $scope.viewAllTopics.push([]);
                        $scope.flagTopics.push([]);
                        chapterCounter++;
                        //}, 0)

                    });


                    bookId = quizService.getBook();
                    $scope.bookId = quizService.getBook();
                    $scope.quizObject[quizService.getBook()] = {};
                    $scope.awaisObject[quizService.getBook()] = {};

                    //Topics
                    $scope.showTopics = function (chapterIndex) {
                        $scope.showQuestionView1 = false;
                        if ($scope.quizObject[bookId]['quizQuestion'] == undefined) {
                            $scope.quizObject[bookId]['quizQuestion'] = {};
                        }
                        $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]] = {};
                        $scope.awaisObject[bookId][$scope.chaptersId[chapterIndex]] = {};
                        $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]]['ChapterDetails'] = {
                            title: $scope.chapters[chapterIndex].title,
                            description: $scope.chapters[chapterIndex].description
                        };
                        $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]]['ChapterTopics'] = {};
                        $scope.awaisObject[bookId][$scope.chaptersId[chapterIndex]] = {};
                        console.log("Chapter Details");
                        console.log($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]]['ChapterDetails']);
                        $scope.chapterId = $scope.chaptersId[chapterIndex];
                        $scope.myChapterIndex = chapterIndex;
                        quizCreateService.setChapter($scope.chapterId, chapterIndex);

                        if ($scope.flagChapters[chapterIndex].id == true) {
                            $scope.nestedQuestions[chapterIndex] = [];
                            $scope.tempQuestions[chapterIndex] = [];
                            $scope.flagChapters[chapterIndex].id = false;
                            $scope.topics = [];
                            $scope.topicsId = [];
                            $scope.topicId = null;
                            topicCounter = 0;
                            ref.child('question-bank-topic').child(quizService.getBook()).child(quizCreateService.getChapter()).on('child_added', function (snapShot) {
                                $timeout(function () {
                                    $scope.topics.push(snapShot.val());
                                    $scope.viewAllTopics[chapterIndex].push(snapShot.val());
                                    $scope.topicsId.push(snapShot.key());
                                    $scope.flagTopics[chapterIndex][topicCounter] = {};
                                    $scope.flagTopics[chapterIndex][topicCounter].id = true;
                                    $scope.nestedQuestions[chapterIndex].push([]);
                                    $scope.tempQuestions[chapterIndex].push([]);
                                    topicCounter++;
                                }, 0)
                            })
                        } else {
                            $scope.topics = $scope.viewAllTopics[chapterIndex];
                            $scope.myChapterIndex = chapterIndex;
                        }
                    };

                    //Questions.
                    $scope.showQuestions = function (topicIndex) {
                        $scope.showQuestionView1 = false;
                        if ($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]] == undefined) {
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]] = {};
                            $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[topicIndex]] = {};
                            //Topic Object
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]]['TopicDetails'] = {
                                title: $scope.topics[topicIndex].title,
                                description: $scope.topics[topicIndex].description
                            };
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]]['TopicQuestions'] = {};
                            $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[topicIndex]] = {};
                            console.log("Topic Details");
                            console.log($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]]);
                        }
                        if ($scope.flagTopics[$scope.myChapterIndex][topicIndex].id == true) {

                            $scope.flagTopics[$scope.myChapterIndex][topicIndex].id = false;
                            $scope.nestedQuestions[$scope.myChapterIndex][topicIndex] = [];
                            myCounter = 0;
                            $scope.questionIndex = topicIndex;
                            $scope.showView = false;
                            $scope.topicId = $scope.topicsId[topicIndex];
                            $scope.tempQuestions[$scope.myChapterIndex][topicIndex] = [];
                            quizCreateService.setTopic($scope.topicId, topicIndex);

                            ref.child('questions').child(quizService.getBook()).child(quizCreateService.getChapter()).child(quizCreateService.getTopic()).on('child_added',
                                function (snapShot) {
                                    $timeout(function () {
                                        $scope.questions.push(snapShot.val());
                                        $scope.questionsId.push(snapShot.key());
                                        $scope.nestedQuestions[$scope.myChapterIndex][topicIndex].push(snapShot.val());
                                        $scope.tempQuestions[$scope.myChapterIndex][topicIndex].push(snapShot.val());
                                        $scope.tempQuestions[$scope.myChapterIndex][topicIndex][myCounter].id = false;
                                        $scope.nestedQuestions[$scope.myChapterIndex][topicIndex][myCounter].id = false;
                                        myCounter++;
                                    }, 0)
                                });
                        } else {
                            $scope.questionIndex = topicIndex;
                            $scope.nestedQuestions[$scope.myChapterIndex][topicIndex] = $scope.tempQuestions[$scope.myChapterIndex][topicIndex];
                        }
                    };
                    $scope.showQuestionView = function (question) {
                        $scope.showQuestionView1 = true;
                        if (question !== null) {
                            quizService.setQuestionObject(question);
                        }
                        $scope.questionView = question;
                    };
                    $scope.checkArray = [];
                    $scope.showTickIcon = function (trueFalseValue, questionIndex) {

                        console.log($scope.tickArray);

                        if (trueFalseValue == false) {
                            console.log("Checking");
                            $scope.checkArray.push(questionIndex)
                            //$scope.tickArray.push(trueFalseValue);
                            //console.log($scope.tickArray + 'pus');
                            $scope.showQuestionView1 = true;
                            $scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = true;
                            $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = true;
                            $scope.viewAllQuestions.push($scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex]);
                            if ($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'] == undefined) {
                                $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'] = {};
                                $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[$scope.questionIndex]] = {};
                            }
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'][$scope.questionsId[questionIndex]] = $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex];
                            $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[$scope.questionIndex]][$scope.questionsId[questionIndex]] = $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex];
                        } else if (trueFalseValue == true) {
                            $scope.checkArray.splice($scope.checkArray.indexOf(questionIndex), 1);
                            //$scope.tickArray.splice(trueFalseValue,1);
                            //console.log($scope.tickArray + 'splice');
                            $scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = false;
                            $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = false;
                            arr = $scope.viewAllQuestions;
                            name = $scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].Title;
                            angular.forEach(arr, function (data, key) {
                                if (data.Title == name) {
                                    arr.splice(key, 1);
                                }
                            });
                            $scope.viewAllQuestions = arr;
                            delete($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'][$scope.questionsId[questionIndex]]);
                            delete($scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[$scope.questionIndex]][$scope.questionsId[questionIndex]]);
                        }


                    };


                    $scope.createQuiz = function () {
                        /*Quiz Create.*/

                        //Delete Topics if Questions not there.
                        console.log($scope.quizObject[bookId]['quizQuestion']);
                        angular.forEach($scope.quizObject[bookId]['quizQuestion'], function (datum, key, obj) {
                            //$scope.consoleObj = datum;
                            //console.log($scope.consoleObj + 'TIS IS T LENT OF AN OBJECT');
                            //console.log(datum +  'TIS IS T LENT OF AN OBJECT');
                            //console.log(datum +  'TIS IS T LENT OF AN OBJECT');
                            angular.forEach(datum['ChapterTopics'], function (datum1, key2) {
                                if (Object.keys(datum1['TopicQuestions']).length == 0) {
                                    delete($scope.quizObject[bookId]['quizQuestion'][key]['ChapterTopics'][key2]);
                                }
                            })
                        });
                        //console.log($scope.consoleObj);
                        //console.log($scope.consoleObj.length + 'TIS IS T LENT OF AN OBJECT');
                        //Delete Chapters if Topics not there.
                        angular.forEach($scope.quizObject[bookId]['quizQuestion'], function (data, key) {
                            if (Object.keys(data['ChapterTopics']).length == 0) {
                                delete($scope.quizObject[bookId]['quizQuestion'][key])
                            }
                        });


                        /*Quiz Attempt*/

                        //Delete Topics if Questions not there.
                        angular.forEach($scope.awaisObject[bookId], function (datum, key) {
                            angular.forEach(datum, function (datum1, key2) {
                                if (Object.keys(datum1).length == 0) {
                                    delete($scope.awaisObject[bookId][key][key2]);
                                }
                            })
                        });


                        //Delete Chapters if Topics not there.
                        angular.forEach($scope.awaisObject[bookId], function (data, key) {
                            if (Object.keys(data).length == 0) {
                                delete($scope.awaisObject[bookId][key])
                            }
                        });

                        $scope.quizObject[bookId]['quizDetails'] = {
                            title: $scope.quizTitle,
                            description: $scope.quizDescription,
                            time: $scope.quizTime
                        };


                        //Object With Answer.
                        ref.child('quiz-create').child(bookId).push($scope.quizObject[bookId], function () {

                            angular.forEach($scope.awaisObject[bookId], function (one) {
                                angular.forEach(one, function (two) {
                                    angular.forEach(two, function (three) {
                                        angular.forEach(three.QuestionOptions, function (deleteAnswer) {
                                            delete(deleteAnswer.rightAnswer);
                                        });
                                    });
                                });
                            });
                            //Object WithoutAnswer.
                            // ref.child('quiz-attempt').child(bookId).push($scope.awaisObject[bookId]);
                            angular.forEach($scope.viewAllQuestions, function (data) {
                                delete(data.$$hashKey);
                                angular.forEach(data.QuestionOptions, function (option) {
                                    delete(option.$$hashKey);
                                });
                                ref.child('quiz-create').child(bookId).on("child_added", function (snapshot) {
                                    $scope.latestNode.push(snapshot.key());
                                });
                                ref.child('quiz-attempt').child(bookId).child($scope.latestNode[$scope.latestNode.length - 1]).set(
                                    $scope.awaisObject[bookId]
                                );
                            });
                        });

                    };


                }, 0);


            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Book' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }


            console.log($scope.quizes);
        }

        function closeQuiz() {
            $scope.showbook = navService.toggleRight5;
            $scope.showbook();
        }


        function hover(item) {
            //console.log('Hover')
            // Shows/hides the delete button on hover
            //return item.showEdit = !item.showEdit;
        }

        function editHover(item) {
            alert("Deleting the " + item.name);
            return item.show = false;
        }
    }
})();

/**
 * Created by Mehmood on 5/20/2015.
 */

(function() {
    'use strict';
    angular.module('components', [
        // "app.createChannels",
        // 'app.createTeamsChannels',
        "app.createGroup",
        // "app.subgroup",
        'app.editGroup',
        'app.createSubGroup',
        'app.home',
        'app.signin',
        'app.sign-up',
        'app.user',
        'app.group',
        'app.navToolbar',
        'app.navLoginbar',
        'app.forgot',
        'app.JoinGroup',
        'app.personalSettings',
        'app.userSetting',
        // 'app.geoFencing',
        'app.quiz',
        'app.policy',
        'app.activity',
        'app.report',
        'app.manualattendace',
        'app.progressreport',
        'app.chat',
        'app.collaborator',
        'app.membershipcard'
        // 'app.quizAddBook',
        // 'app.quizAddChapter',
        // 'app.quizAddTopic',
        // 'app.quizAddQuestion',
        // 'app.quizCreate',
        // 'app.quizAttempt',
        // 'app.quizAttempting',
        // 'app.quizAssign',
        // 'app.quizResult'
    ]);
})();

/**
 * Created by Usuf on 23/Feb/16.
 */
(function () {

    "use strict";

    angular.module('core').factory('activityStreamService', ['$timeout', '$firebaseObject', 'firebaseService', 'userService', '$rootScope', activityStreamService]);

    function activityStreamService($timeout, $firebaseObject, firebaseService, userService, $rootScope) {
        var user = '';
        var userID = '';
        var actor = '';
        var currentUserActivities = [];
        var currentUserGroupNamesAndMemberShips = {};
        var currentUserSubGroupNamesAndMemberShips = {};
        var currentUserSubGroupsMembersAndMemberShips = {};
        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
        var lastSeenTimeStamp = null;
        var ref = firebaseService.getRefMain();

        //object for those who will be notify....

        function init() {
            user = userService.getCurrentUser();
            userID = user.userID;
            actor = {
                "type": "user",
                "id": user.userID, //this is the userID, and an index should be set on this
                "email": user.email,
                "displayName": user.firstName + " " + user.lastName,
                'profile-image': $rootScope.userImg || ''
            };

            //getting curent user groups and then getting its notification/activities but first we get timestamp of seen activities to get records of activities
            getLastSeenActivityTimeStamp();
            //getGroupsOfCurrentUser();

            //getting current user subgroup names
            getSubGroupsOfCurrentUsers();

            //getting current user subgroup members
            //getSubGroupsMembersOfCurrentUsers ();

            userGroupEvents();

        } //init

        //getting last seen activity from activities-seen-by-user
        function getLastSeenActivityTimeStamp() {
            var onchnaged = 0;      //because firebaretimestamp run twice thats y use this strategy....
            var once = 0;
            firebaseService.getRefActivitySeen().child(userID).on('value', function (snapshot) {

                lastSeenTimeStamp = (snapshot.val() && snapshot.val().timestamp) ? snapshot.val().timestamp : '';

                if (once === 0 && onchnaged === 0) {
                    // console.log('activitiess', 'once');
                    getGroupsOfCurrentUser(lastSeenTimeStamp);
                    once++;
                }

                onchnaged++;

                if (once !== 0 && onchnaged === 2) {
                    // console.log('activitiess', 'on update');
                    LastChildAddedClosed();
                    $timeout(function () {
                        getGroupsOfCurrentUser(lastSeenTimeStamp);
                    }, 1000);

                    onchnaged = 0;
                }

                //getGroupsOfCurrentUser(snapshot.val());
            });

            // firebaseService.getRefActivitySeen().child(userID).on('child_changed', function(snapshot) {
            //     //console.log(snapshot.key(), snapshot.val());
            //     getGroupsOfCurrentUser(snapshot.val());
            // });
        }   // getLastSeenActivityTimeStamp

        function LastChildAddedClosed() {
            for (var group in currentUserSubGroupNamesAndMemberShips) {
                // console.log('watch group', group);
                firebaseService.getRefGroupsActivityStreams().child(group).off("child_added");
                for (var subgroup in currentUserSubGroupNamesAndMemberShips[group]) {
                    firebaseService.getRefSubGroupsActivityStreams().child(group).off('child_added');
                    firebaseService.getRefSubGroupsActivityStreams().child(group).child(subgroup).off("child_added");
                    // console.log('watch subgroup', subgroup);
                }
            }
        }        // LastChildAddedClosed



        //for activity step1
        function getGroupsOfCurrentUser(date) {
            //child_added on user-group-memberships
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function (group) {
                if (group && group.key()) {
                    //create a object of group name and membership-type
                    currentUserGroupNamesAndMemberShips[group.key()] = group.val()['membership-type'];

                    $timeout(function () {
                        //getting activities by groupID
                        getActivityOfCurrentUserByGroup(group.key(), date);

                        //getting activity by subgroup
                        getActivityOfCurrentUserBySubGroup(group.key(), date);
                    }, 1000);

                }
            });

            //child_changed on user-group-memberships
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_changed', function (group) {
                // console.log('group child_changed', group.val());
                //change membership in currentUserGroupNamesAndMemberShips
                currentUserGroupNamesAndMemberShips[group.key()] = group.val()['membership-type'];

                // delete all activity from user activity array of group.key()
                // if (group.val()['membership-type'] == '-1') {
                //     currentUserActivities.forEach(function (val, index) {
                //         if (val.groupID == group.key()) {
                //             //remove all notifications if user blocked
                //             currentUserActivities.splice(val, 1);
                //         }
                //     })
                // }

            });

            //child_removed on user-group-memberships
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_removed', function (group) {
                // console.log('group child_removed', group.val());
                //delete group from currentUserGroupNamesAndMemberShips
                delete currentUserGroupNamesAndMemberShips[group.key()];

                // delete all activity from user activity array of group.key()  (remove activity related from group)
                // currentUserActivities.forEach(function (val, index) {
                //     if (val.groupID == group.key()) {
                //         //remove all notifications if user blocked
                //         currentUserActivities.splice(val, 1);
                //     }
                // });
            });

        }
        //for activity group
        function getActivityOfCurrentUserByGroup(groupID, date) {
            //getting activity streams from firebase node: group-activity-streams.startAt(startDate.setHours(0, 0, 0, 0))
            if (date) {
                //close child_added Event....
                firebaseService.getRefGroupsActivityStreams().child(groupID).off("child_added");

                firebaseService.getRefGroupsActivityStreams().child(groupID)
                    .orderByChild('published').startAt(date).on("child_added", function (snapshot) {
                        if (snapshot && snapshot.val()) {
                            currentUserActivities.push({
                                groupID: groupID,
                                displayMessage: snapshot.val().displayName,
                                activityID: snapshot.key(),
                                published: snapshot.val().published,
                                // seen: false
                            });
                        }
                    });
            } else {

                firebaseService.getRefGroupsActivityStreams().child(groupID)
                    .orderByChild('published').on("child_added", function (snapshot) {
                        if (snapshot && snapshot.val()) {
                            currentUserActivities.push({
                                groupID: groupID,
                                displayMessage: snapshot.val().displayName,
                                activityID: snapshot.key(),
                                published: snapshot.val().published,
                                // seen: false
                            });
                        }
                    });
            }
        }

        //for getting subgroups of current user
        function getSubGroupsOfCurrentUsers() {
            firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_added', function (snapshot) {

                //register subgroup added
                //addedUserSubgroupMembershipOnSubgroupEvent(snapshot.key());

                //register removed event of any subgroup membership
                removeUserSubgroupMembershipOnGroupEvent(snapshot.key());

                for (var subgroup in snapshot.val()) {
                    if (currentUserSubGroupNamesAndMemberShips && currentUserSubGroupNamesAndMemberShips[snapshot.key()]) {
                        currentUserSubGroupNamesAndMemberShips[snapshot.key()][subgroup] = snapshot.val()[subgroup]['membership-type'];
                    } else {
                        currentUserSubGroupNamesAndMemberShips[snapshot.key()] = {};
                        currentUserSubGroupNamesAndMemberShips[snapshot.key()][subgroup] = snapshot.val()[subgroup]['membership-type'];
                    }

                    //getting subgroup members
                    getSubGroupsMembersOfCurrentUsers(snapshot.key(), subgroup);


                }
            });
        }   // getSubGroupsOfCurrentUsers

        function removeUserSubgroupMembershipOnGroupEvent(group) {
            firebaseService.getRefUserSubGroupMemberships().child(userID).child(group).on('child_removed', function (snapshot) {
                // console.log('watch subgroup child_removed', snapshot.val(), snapshot.key());

                //for (var subgroup in snapshot.val()) {
                //delete membership type from subgroup object
                if (snapshot.key()) {
                    delete currentUserSubGroupNamesAndMemberShips[group][snapshot.key()];
                }

                // // delete all activity from user activity array of subgroup (remove activity related from subgroup)
                // currentUserActivities.forEach(function (val, index) {
                //     if (val.subgroupID == subgroup) {
                //         //remove all notifications if user blocked
                //         currentUserActivities.splice(val, 1);
                //     }
                // });
                //}
            });
        }   // removeUserSubGroupMembershipEvent

        function addedUserSubgroupMembershipOnSubgroupEvent(group) {
            firebaseService.getRefUserSubGroupMemberships().child(userID).child(group).on('child_added', function (snapshot) {
                console.log('watch: ', snapshot.key(), snapshot.val());
            });
        }   // addedUserSubgroupMembershipOnSubgroupEvent



        //for activity of subgroup
        function getActivityOfCurrentUserBySubGroup(groupID, date) {
            //getting activity streams from firebase node: subgroup-activity-streams
            if (date) {
                //close child_added Event....
                firebaseService.getRefSubGroupsActivityStreams().child(groupID).off('child_added');

                firebaseService.getRefSubGroupsActivityStreams().child(groupID).on('child_added', function (subgroup) {
                    if (subgroup && subgroup.val()) {
                        firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroup.key())
                            .orderByChild('published').startAt(date).on("child_added", function (snapshot) {
                                if (snapshot && snapshot.val()) {
                                    currentUserActivities.push({
                                        groupID: groupID,
                                        subgroupID: subgroup.key(),
                                        displayMessage: snapshot.val().displayName,
                                        activityID: snapshot.key(),
                                        published: snapshot.val().published,
                                        // seen: false
                                    });
                                }
                            });
                    }
                });
            } else {
                firebaseService.getRefSubGroupsActivityStreams().child(groupID).on('child_added', function (subgroup) {
                    if (subgroup && subgroup.val()) {
                        firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroup.key()).orderByChild('published').on("child_added", function (snapshot) {
                            if (snapshot && snapshot.val()) {
                                currentUserActivities.push({
                                    groupID: groupID,
                                    subgroupID: subgroup.key(),
                                    displayMessage: snapshot.val().displayName,
                                    activityID: snapshot.key(),
                                    published: snapshot.val().published,
                                    // seen: false
                                });
                            }
                        });
                    }
                });
            }
        }

        //for getting subgroups members of current user
        function getSubGroupsMembersOfCurrentUsers(groupID, subgroupID) {
            //getting members by child_added
            firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_added', function (snapshot) {

                if (currentUserSubGroupsMembersAndMemberShips && currentUserSubGroupsMembersAndMemberShips[groupID]) {

                    if (currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID]) {
                        currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID].push({ 'userID': snapshot.key(), 'membership-type': snapshot.val()['membership-type'] });
                    } else {
                        currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID] = [];
                        currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID].push({ 'userID': snapshot.key(), 'membership-type': snapshot.val()['membership-type'] });
                    }

                } else {
                    currentUserSubGroupsMembersAndMemberShips[groupID] = {};
                    currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID] = [];
                    currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID].push({ 'userID': snapshot.key(), 'membership-type': snapshot.val()['membership-type'] })
                }
                //currentUserSubGroupsMembers[groupID][subgroupID] = snapshot.key();
            }); //firebaseService.getRefSubGroupMembers

            //remove subgroup when child_removed from subgroup
            firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_removed', function (snapshot) {
                // console.log('member child_removed: ', snapshot.key(), snapshot.val());
                //when member remove from subgroup then update array of  currentUserSubGroupsMembersAndMemberShips
                delete currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID];

            });
        } //getSubGroupsMembersOfCurrentUsers



        function getActivities() {
            return currentUserActivities;
        }

        function getSubgroupNamesAndMemberships() {
            return currentUserSubGroupNamesAndMemberShips;
        } //getSubgroupNamesAndMemberships

        function getSubgroupMembersAndMemberships() {
            return currentUserSubGroupsMembersAndMemberShips;
        }



        //new service  # start

        var userGroupz = {};
        var userSubGroupz = {};
        var subgroupsOfGroup = {};

        function userGroupEvents() {
            //group added
            ref.child('user-group-memberships').child(userID).on('child_added', function (group) {
                if (group) {
                    console.log('watch added raw', group.val());
                    var obj = {
                        'membership-type': group.val()['membership-type'],
                        'title': ''
                    };
                    userGroupz[group.key()] = obj;

                    console.log('watch added', userGroupz, group.val()['membership-type'] );

                    //subgroup add event
                    userSubGroupEvents(group.key());

                    // group users
                    getUserGroupMembers(group.key());

                    setTimeout(function () {
                        //get subgroups of this group is memebership type is owner
                        (group.val()['membership-type'] === 1) ? getSubgroupOfGroups(group.key()) : null;
                    },1000);
                }
            });

            //group changed
            ref.child('user-group-memberships').child(userID).on('child_changed', function (group) {
                if (group) {
                    console.log('watch changed raw', group.val());
                    var obj = {
                        'membership-type': group.val()['membership-type'],
                        'title': ''
                    };
                    userGroupz[group.key()] = obj;
                    console.log('watch changed', userGroupz);
                }
            });

            //group removed
            ref.child('user-group-memberships').child(userID).on('child_removed', function (group) {
                if (group) {
                    console.log('watch removed raw', group.val());
                    delete userGroupz[group.key()];
                    console.log('watch remove', userGroupz);
                }
            });
        }
        function userSubGroupEvents(groupid) {
            // subgroup added
            ref.child('user-subgroup-memberships').child(userID).child(groupid).on('child_added', function (subgroup) {
                if (subgroup) {
                    console.log('watch added raw', subgroup.val());
                    var obj = {
                        'membership-type': subgroup.val()['membership-type'],
                        'title': ''
                    };

                    if (userSubGroupz.hasOwnProperty(groupid)) {
                        userSubGroupz[groupid][subgroup.key()] = obj;
                    } else {
                        userSubGroupz[groupid] = {};
                        userSubGroupz[groupid][subgroup.key()] = obj;
                    }

                    console.log('watch added', userSubGroupz);
                    // get subgroup users
                    getUserSubGroupMembers(groupid, subgroup.key());
                }
            });

            // group changed
            ref.child('user-subgroup-memberships').child(userID).child(groupid).on('child_changed', function (subgroup) {
                if (subgroup) {
                    console.log('watch added raw', subgroup.val());
                    var obj = {
                        'membership-type': subgroup.val()['membership-type'],
                        'title': ''
                    };
                    userSubGroupz[groupid][subgroup.key()] = obj;
                    console.log('watch changed', userSubGroupz);
                }
            });

            //group removed
            ref.child('user-subgroup-memberships').child(userID).child(groupid).on('child_removed', function (subgroup) {
                if (subgroup) {
                    console.log('watch added raw', subgroup.val());
                    delete userSubGroupz[groupid][subgroup.key()];
                    console.log('watch delete', userSubGroupz);
                }
            });
        }
        function getSubgroupOfGroups(groupid) {
            console.log('watch fireeeeeeeeeeeeeeeeeee');
            //subgroup added
            ref.child('subgroups').child(groupid).on('child_added', function (subgroup) {
                console.log('watch fireeeeeeeeeeeeeeeeeeeee22222222', subgroup);
                if (subgroupsOfGroup.hasOwnProperty(groupid)) {
                    subgroupsOfGroup[groupid].push(subgroup.key());
                } else {
                    subgroupsOfGroup[groupid] = [];
                    subgroupsOfGroup[groupid].push(subgroup.key());
                }

                console.log('watch added subgrp of grp', subgroupsOfGroup);

            });

            //subgroup removed
            ref.child('subgroups').child(groupid).on('child_removed', function (subgroup) {
                var index = subgroupsOfGroup[groupid].indexOf(subgroup.key());

                // remove from array of subgroups
                subgroupsOfGroup[groupid].splice(index, 1);
            });

        }
        function getUserGroupMembers(groupid) {
            // group-members child_added
            ref.child('group-members').child(groupid).on('child_added', function (user) {
                           console.log('child_added',user.key(),user.val() )
                var obj = {
                    'membership-type': user.val()['membership-type'],
                    'title': ''
                };
                if (userGroupz.hasOwnProperty(groupid)) {
                    if (userGroupz[groupid].hasOwnProperty("users")) {
                        userGroupz[groupid]["users"][user.key()] = obj;
                    } else {
                        userGroupz[groupid]["users"] = {};
                        userGroupz[groupid]["users"][user.key()] = obj;
                    }
                }
            });

            // group-members child_changed
            ref.child('group-members').child(groupid).on('child_changed', function (user) {
                console.log('child_changed',user.key(),user.val() )
                var obj = {
                    'membership-type': user.val()['membership-type'],
                    'title': ''
                };
                userGroupz[groupid]["users"][user.key()] = obj;
            });
        }
        function getUserSubGroupMembers(groupid, subgroupid) {
            // subgroup-members child_added
            ref.child('subgroup-members').child(groupid).child(subgroupid).on('child_added', function (user) {
                var obj = {
                    'membership-type': user.val()['membership-type'],
                    'title': ''
                };

                if (userSubGroupz[groupid].hasOwnProperty(subgroupid)) {
                    if (userSubGroupz[groupid][subgroupid].hasOwnProperty("users")) {
                        userSubGroupz[groupid][subgroupid]["users"][user.key()] = obj;
                    } else {
                        userSubGroupz[groupid][subgroupid]["users"] = {};
                        userSubGroupz[groupid][subgroupid]["users"][user.key()] = obj;
                    }
                }
            });

            // subgroup-members child_changed
            ref.child('subgroup-members').child(groupid).child(subgroupid).on('child_changed', function (user) {
                var obj = {
                    'membership-type': user.val()['membership-type'],
                    'title': ''
                };
                if (userSubGroupz[groupid][subgroupid].hasOwnProperty("users")) { 
                    if (userSubGroupz[groupid][subgroupid]["users"].hasOwnProperty(user.key())) {
                        userSubGroupz[groupid][subgroupid]["users"][user.key()] = obj;        
                    } else {
                        userSubGroupz[groupid][subgroupid]["users"][user.key()] = {};
                        userSubGroupz[groupid][subgroupid]["users"][user.key()] = obj;
                    }
                }
                
                
            });

            // subgroup-members child_changed
            ref.child('subgroup-members').child(groupid).child(subgroupid).on('child_removed', function (user) {
                delete userSubGroupz[groupid][subgroupid]["users"][user.key()];
            });


        }

        function getCurrentUserGroups() {
            return userGroupz;
        }
        function getCurrentUserSubgroups() {
            return userSubGroupz;
        }
        function getSubgroupsOfGroup() {
            console.log('watch', subgroupsOfGroup);
            return subgroupsOfGroup;
        }
        //new service  # end



        // type = group, subgroup, policy, progressReport, firepad, chat
        //targetinfo = {id: '', url: '', title: '', type: '' }
        //area = {type: '', action: ''}
        //memberUserID = if object is user for notification

        // activities - seen - by - user
        // userid
        //timesapan:
        function activityHasSeen() {
            firebaseService.getRefActivitySeen().child(userID).update({ timestamp: firebaseTimeStamp }, function (err) {
                if (!err) {
                    currentUserActivities.splice(0, currentUserActivities.length);
                }
            });
        }

        //calling from services or controller (public)
        function activityStream(type, targetinfo, area, activityGroupOrSubGroupID, memberID, object) {
            //function activityStream(type, targetinfo, area, activityGroupOrSubGroupID, memberUserID) {
            var obj = {}; //object: affected area for user.... (represent notification)

            if (object) {

                saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, object);

            } else {

                if (memberID) { // incase of group ceration or group edit
                    firebaseService.asyncCheckIfUserExists(memberID).then(function (res) {
                        obj = {
                            "type": type,
                            "id": memberID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName,
                        };
                        //now calling function for save to firebase....
                        saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, obj);
                    });
                } else {
                    obj = {
                        "type": type,
                        "id": targetinfo.id, //an index should be set on this
                        "url": targetinfo.id,
                        "displayName": targetinfo.title,
                    };
                    //now calling function for save to firebase....
                    saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, obj);
                }

            }


        } //activityStream
        //calling from here  (private)
        function saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, object) {
            //function saveToFirebase(type, targetinfo, area, groupID, memberUserID, object) {
            // ## target ##
            //if related group target is group, if related subgroup target is subgroup, if related policy target is policy, if related progressReport target is progressReport
            var target = {
                "type": type,
                "id": targetinfo.id,
                "url": targetinfo.url,
                "displayName": targetinfo.title
            };

            var displayNameObject = {
                'group': {
                    'membersettings': { //reject == ignore
                        'group-ignore-member': actor.displayName + " rejected " + object.displayName + "'s membership request for " + target.displayName,
                        'group-approve-member': actor.displayName + " approved " + object.displayName + " as a member in " + target.displayName,
                        'user-membership-from-admin-to-member': actor.displayName + " changed " + object.displayName + "'s membership from \"admin\" to \"member\" for " + target.displayName,
                        'user-membership-from-member-to-admin': actor.displayName + " changed " + object.displayName + "'s membership from \"member\" to \"admin\" for " + target.displayName,
                        'user-membership-block': actor.displayName + " changed " + object.displayName + "'s membership to \"suspend\" for " + target.displayName,
                        'user-membership-unblock': actor.displayName + " changed " + object.displayName + "'s membership from \"suspend\" to \"member\" for " + target.displayName,
                        'group-member-removed': actor.displayName + " removed " + object.displayName + " from " + target.displayName,
                    }, //membersettings
                    'group-created': actor.displayName + " created group " + target.displayName,
                    'group-updated': actor.displayName + " udpated group " + target.displayName,
                    'group-join': actor.displayName + " sent team join request of " + target.displayName,
                }, //'type: group'
                'subgroup': {
                    'subgroup-created': actor.displayName + " created subgroup " + target.displayName,
                    'subgroup-updated': actor.displayName + " updated subgroup " + target.displayName,
                    'subgroup-member-assigned': actor.displayName + " assigned " + object.displayName + " as a member of " + target.displayName,
                    'subgroup-admin-assigned': actor.displayName + " assigned " + object.displayName + " as a admin of " + target.displayName,
                    'subgroup-member-removed': actor.displayName + " removed as member " + object.displayName + " from " + target.displayName,
                    'subgroup-admin-removed': actor.displayName + " removed as admin " + object.displayName + " from " + target.displayName,
                    'subgroup-join': actor.displayName + " sent team of teams join request of " + target.displayName,
                    'subgroup-checkin': actor.displayName + " checkin " + target.displayName,
                    'subgroup-checkout': actor.displayName + " checkout from " + target.displayName,

                }, //subgroup
                'policy': {
                    'policy-created': actor.displayName + " created policy " + target.displayName,
                    'policy-updated': actor.displayName + " updated policy " + target.displayName,
                    'policy-assigned-team': actor.displayName + " assigned policy " + target.displayName + " to " + object.displayName,
                }, //policy
                'progressReport': {
                    'progressReport-created': actor.displayName + " Created progress report against " + target.displayName,
                    'progressReport-updated': actor.displayName + " Updated progress report in " + target.displayName,
                } //progressReport
            }; //displayNameObject


            var displayMessage = '';

            if (area.action) {
                displayMessage = displayNameObject[type][area.type][area.action];
            } else {
                displayMessage = displayNameObject[type][area.type];
            }

            var activity = {
                language: "en",
                verb: (area.action) ? area.action : area.type,
                published: firebaseTimeStamp,
                displayName: displayMessage,
                actor: actor,
                object: object,
                target: target,
                //seen: false
            };


            var pushObj = ref.child('group-activity-streams/' + activityGroupOrSubGroupID).push();
            var activityPushID = pushObj.key();

            var multipath = {};

            if (type === 'group') {
                //firebase node: group-activity-streams
                if (area.type === 'group-created' || area.type === 'group-updated') {
                    delete activity.target;
                    delete activity.object;
                } else if (area.type === 'group-join' || area.type === 'membersettings') {
                    delete activity.target;
                }

                multipath['group-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            } else if (type === 'subgroup') {
                //firebase node: subgroup-activity-streams
                if (area.type === 'subgroup-created' || area.type === 'subgroup-updated') {
                    delete activity.target;
                    delete activity.object;
                } else if (area.type === 'subgroup-join') {
                    delete activity.target;
                }

                multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            } else if (type === 'policy') {
                //firbase node:
                //if pass groupid in 'activityGroupOrSubGroupID' then save into firebase group-activity-streams
                //else if pass subgroupid in 'activityGroupOrSubGroupID' then save into firebase subgroup-activity-streams
                //checking if activityGroupOrSubGroupID contains / then location is subgroup-activity else group-activity
                if (activityGroupOrSubGroupID.indexOf('/') > -1) {
                    multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;
                } else {
                    multipath['group-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;
                }
            } else if (type === 'progressReport') {
                //progress report belongs to subgroup then activityGroupOrSubGroupID will be subgroupID
                multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            }

            //  console.log('activity_ activityGroupOrSubGroupID: ', activityGroupOrSubGroupID);
            //  console.log('activity_  type: ', type);
            //  console.log('activity_ : ', activity);

            firebaseService.getRefMain().update(multipath, function (err) {
                if (err) {
                    console.log('activityError', err);
                }
            });
        } //saveToFirebase

        // function currentUserActivity() {
        //    var deffer = $q.deffer();
        //    var refGroupActivitieStream = firebaseService.groupsActivityStreams().child('group002').child(userID);
        //    refGroupActivitieStream.on('child_added',function(snapshot){
        //       console.log(snapshot.val());
        //    });
        //    return deffer.promise;
        // }

        return {
            init: init,
            getActivities: getActivities,
            activityStream: activityStream,
            activityHasSeen: activityHasSeen,
            getSubgroupNamesAndMemberships: getSubgroupNamesAndMemberships,
            getCurrentUserGroups: getCurrentUserGroups,
            getCurrentUserSubgroups: getCurrentUserSubgroups,
            getSubgroupsOfGroup: getSubgroupsOfGroup
        };
    } //activityStreamService
})();

/**
 * Created by ZiaKhan on 16/12/14.
 */
'use strict';

// Create the 'example' controller
angular.module('core')
    .factory('authService', ["$state", "dataService", "userPresenceService", "messageService", "$q", "$http", "appConfig", "$firebaseAuth", "$location", "firebaseService", "userService",
        function($state, dataService, userPresenceService, messageService, $q, $http, appConfig, $firebaseAuth, $location, firebaseService, userService) {

            return {
                //userData: null,

                login: function(userCred, successFn, failureFn) {
                    var self = this;
                    $http.post(appConfig.apiBaseUrl + '/api/signin', userCred).
                    success(function(data, status, headers, config) {

                        // this callback will be called asynchronously
                        // when the response is available
                        //self.userData = data.user;
                        if (data.statusCode != 0) {
                            //$sessionStorage.loggedInUser = data.user;
                            userService.setCurrentUser(data.user);
                            //firebaseService.asyncLogin($sessionStorage.loggedInUser.userID, $sessionStorage.loggedInUser.token)
                            firebaseService.asyncLogin(userService.getCurrentUser().userID, userService.getCurrentUser().token)
                                .then(function() {
                                    successFn(data);
                                    // dataService.loadData();
                                }, function(error) {
                                    if (error) {
                                        console.error("Firebase Authentication failed: ", error);
                                        failureFn();
                                    }
                                })

                        } else {
                            failureFn(data);
                        }

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //console.log('login error response object: ' + JSON.stringify(status));
                        failureFn();
                    });

                },
                forgotPassword: function(userCred) {
                    var defer = $q.defer();

                    $http.post(appConfig.apiBaseUrl + '/api/forgotpassword', userCred)
                        .success(function(data, status, headers, config) {
                            if (data.statusCode === 1) {
                                defer.resolve(data.statusDesc);
                            } else {
                                defer.reject(data.statusDesc);
                            }
                        })
                        .error(function(data, status, headers, config) {
                            console.log('forgot error response object: ' + JSON.stringify(data));
                            defer.reject('Error occurred in sending data. Please try again.');
                        });

                    return defer.promise;
                },
                signup: function(userInfo, successFn, failureFn) {
                    var self = this;
                    $http.post(appConfig.apiBaseUrl + '/api/signup', {
                        email: userInfo.email,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        password: userInfo.password,
                        userID: userInfo.userID
                    }).
                    success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //console.log("response: " + data);
                        //console.log('signup response object: ' + JSON.stringify(data));
                        successFn(data);
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        failureFn();
                    });
                },
                logout: function() {
                    //empty data in dataservice
                    dataService.unloadData();
                    userPresenceService.removeCurrentConRef();
                    // for manually sign out from firebase.
                    userService.removeCurrentUser();
                    firebaseService.logout();
                    Firebase.goOffline();
                    $state.go('signin');
                },
                //to resolve route "/user/:user" confirming is authenticated from firebase
                resolveUserPage: function() {
                    // alert('inside authService');
                    var defer = $q.defer();
                    // console.log('1')
                    if (userService.getCurrentUser() && userService.getCurrentUser().userID) {
                        // console.log('2')
                        if (appConfig.firebaseAuth) {
                            dataService.loadData();
                            defer.resolve();
                            // console.log('3')
                        } else {
                            //firebaseService.asyncLogin( $sessionStorage.loggedInUser.userID, $sessionStorage.loggedInUser.token )
                            firebaseService.asyncLogin(userService.getCurrentUser().userID, userService.getCurrentUser().token)
                                .then(function() {
                                    //console.info("Firebase Authentication Successful when restarting app");
                                    firebaseService.addUpdateHandler();
                                    dataService.loadData();
                                    defer.resolve();
                                    // console.log('4')
                                }, function(error) {
                                    if (error) {
                                        console.log("Firebase Authentication failed: ", error);
                                        $location.path('/signin')
                                        // console.log('5')
                                    }
                                });
                        }
                    } else {
                        console.log("No user logged in");
                        $location.path('/signin')
                        // console.log('6')
                    }
                    // console.log('7')
                    return defer.promise;
                },
                resolveDashboard: function(userID){
                    var defer = $q.defer();
                    // console.log('a1')
                    if (userService.getCurrentUser() && userID !== userService.getCurrentUser().userID) {
                        $location.path('/profile/' + userID)
                        // console.log('a2')
                        // $state.go('user.dashboard', {userID: user.userID})
                    } else {
                        defer.resolve();
                        // console.log('a3')
                    }
                    return defer.promise;
                }
            };
        }
    ]);

/**
 * Created by sj on 6/6/2015.
 */
(function() {
    'use strict';
    angular
        .module('core')
        .factory('chatService', chatService);

    chatService.$inject = ['$q', 'firebaseService', '$firebaseObject', '$firebaseArray'];

    function chatService($q, firebaseService, $firebaseObject, $firebaseArray) {

        // private variables
        var refs, fireTimeStamp;

        //firebase unix-epoch time
        fireTimeStamp = Firebase.ServerValue.TIMESTAMP;
        // main firebase reference
        refs = {
            main: firebaseService.getRefMain()
        };
        // group chat reference
        refs.refGroupChats = refs.main.child('group-chats');
        refs.refTeamChats = refs.main.child('subgroup-chats')
        refs.refgroupchannel = refs.main.child('group-channel');
        refs.refgroupmessages = refs.main.child('group-messages');
        refs.refsubgroupchannel = refs.main.child('subgroup-channel');
        refs.refsubgroupmessages = refs.main.child('subgroup-messages');

        return {
            checkGroupChannelExists: function (groupID, channelTitle) {
                var deferred = $q.defer();
                refs.refgroupchannel.child(groupID).orderByChild('title').equalTo(channelTitle).on('value', function(snapshot){
                    deferred.resolve(snapshot.val());
                })
                return deferred.promise;
            },
            checkSubGroupChannelExists: function (groupID, subgroupID, channelTitle) {
                var deferred = $q.defer();
                refs.refsubgroupchannel.child(groupID).child(subgroupID).orderByChild('title').equalTo(channelTitle).on('value', function(snapshot){
                    deferred.resolve(snapshot.val());
                })
                return deferred.promise;
            },
            // creating channel
            createGroupChannel: function(groupID, channelTitle, userID, cb){
                var newChannel = {
                    'created-by': userID,
                    timestamp   : fireTimeStamp,
                    title       : channelTitle
                }
                var request = refs.refgroupchannel.child(groupID).push();
                request.update(newChannel, function(err){
                    cb(err, request.key(), channelTitle);
                });
            },
            createSubGroupChannel: function(groupID, subgroupID, channelTitle, userID, cb){
                var newChannel = {
                    'created-by': userID,
                    timestamp   : fireTimeStamp,
                    title       : channelTitle
                }
                var request = refs.refsubgroupchannel.child(groupID).child(subgroupID).push();
                request.update(newChannel, function(err){
                    cb(err, request.key(), channelTitle);
                });
            },
            getGroupChannel: function(groupID){
                return $firebaseArray(refs.refgroupchannel.child(groupID))
            },
            getSubGroupChannel: function(groupID, subgroupID){
                return $firebaseArray(refs.refsubgroupchannel.child(groupID).child(subgroupID))
            },
            asyncCreateChannel: function(groupID, channelObj, user) {
                var self = this;
                var deferred = $q.defer();

                //Step 1: see if it already exists - check if channelID exists
                self.asyncCheckIfChannelExists(groupID, channelObj.channelID).then(function(response) {
                    if (response.exists) {
                        return deferred.reject('Channel creation failed. ' + channelObj.channelID + 'already exists.');
                    } else {

                        //Step 2: Add to channel
                        var channelRef = refs.refGroupChats.child(groupID).child(channelObj.channelID)
                            .set({
                                title: channelObj.title,
                                timestamp: fireTimeStamp,
                                "created-by": user.userID//,
                                // messages: {}

                            }, function(error) {
                                if (error) {
                                    deferred.reject("error occurred in creating channel====");
                                } else {
                                    //step 3: add to messages
                                    // var chatRef = refs.refGroupChats.child(groupID).child(channelObj.channelID).child("messages")
                                        // .push({

                                            // from: user.userID,
                                            // timestamp: fireTimeStamp,
                                            // text: "Welcome to " + channelObj.title + " Group"


                                        // }, function(error) {
                                            if (error) {
                                                deferred.reject("error occurred in creating channel");
                                            } else {

                                                //step4 - create an activity for "channel-created" verb.
                                                self.asyncRecordChannelCreationActivity(channelObj, user, groupID).then(

                                                    deferred.resolve("channel created successfully and also pushed activity.")
                                                );
                                            }


                                        // });
                                }
                            });

                    }



                });

                return deferred.promise;
            },
            // sending msgs
            SendMessages: function(groupID, channelID, user, text) {

                var deferred = $q.defer();
                var msgRef = refs.refgroupmessages.child(groupID + '/' + channelID).push({
                    from: user.userID,
                    timestamp: fireTimeStamp,
                    text: text.msg
                }, function(error) {
                    if (error) {
                        deferred.reject("error occurred in sending msg");
                    } else {
                        deferred.resolve("msg sucessfully sent");
                    }


                });



                return deferred.promise;

            },
            // checking if channel exists
            asyncCheckIfChannelExists: function(groupID, channelID) {
                var deferred = $q.defer();

                refs.refGroupChats.child(groupID + '/' + channelID).once('value', function(snapshot) {
                    var exists = (snapshot.val() !== null);
                    deferred.resolve({
                        exists: exists,
                        channel: snapshot.val()
                    });
                });

                return deferred.promise;
            },
            // getting channel Array
            getGroupChannelsSyncArray: function(groupID) {
                return Firebase.getAsArray(refs.refsubgroupchannel.child(groupID));
            },
            //getting channels msg array
            getChannelMessagesArray: function(groupID, channelID) {

            var ref = refs.refgroupmessages.child(groupID + '/' + channelID);
                // return Firebase.getAsArray(ref);
                return $firebaseArray(ref);
            },
            // creating channel Activity
            asyncRecordChannelCreationActivity: function(channel, user, group) {
                var deferred = $q.defer();
                var ref = firebaseService.getRefGroupsActivityStreams().child(group);
                var actor = {
                    "type": "user",
                    "id": user.userID, //this is the userID, and an index should be set on this
                    "email": user.email,
                    "displayName": user.firstName + " " + user.lastName
                };

                var target = {
                    type: "group",
                    id: group
                        //url:"",
                        //displayName:""
                };

                var object = {
                    "type": "channel",
                    "id": channel.channelID, //an index should be set on this
                    //"url": group.groupID,
                    "displayName": channel.title
                };


                var activity = {
                    language: "en",
                    verb: "group-channel-creation",
                    published: fireTimeStamp,
                    displayName: actor.displayName + " created " + channel.title + "channel in " + target.id + " group.",
                    actor: actor,
                    object: object,
                    target: target
                };

                var newActivityRef = ref.push();
                newActivityRef.set(activity, function(error) {
                    if (error) {
                        deferred.reject();
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = ref.child(activityID);
                        activityEntryRef.once("value", function(snapshot) {
                            var timestamp = snapshot.val().published;
                            newActivityRef.setPriority(0 - timestamp, function(error2) {
                                if (error2) {
                                    deferred.reject();
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });


                    }
                });

                return deferred.promise;
            },
            // getting user emails object
            getUserEmails: function(userID) {
                // var deferred = $q.defer();
                return $firebaseObject(refs.main.child("users").child(userID));
                // deferred.resolve(EmailSyncObj);



            },


            //  SUB TEAMs SERVICESSSSSSSS

            //    creating team channels

            CreateTeamChannel: function(groupID, channelObj, TeamID, user) {
                var self = this;
                var deferred = $q.defer();

                /*      //Step 1: see if it already exists - check if channelID exists
                self.asyncCheckIfChannelExists(groupID, channelObj.channelID).then(function(response){
                    if( response.exists ){
                        return deferred.reject('Channel creation failed. ' + channelObj.channelID + 'already exists.');
                    }
                    else{
*/
                //Step 2: Add to channel
                var channelRef = refs.refTeamChats.child(groupID).child(TeamID).child(channelObj.channelID)
                    .set({
                        title: channelObj.title,
                        timestamp: fireTimeStamp,
                        "created-by": user.userID,
                        messages: {}

                    }, function(error) {
                        if (error) {
                            deferred.reject("error occurred in creating channel");
                        } else {
                            //step 3: add to messages
                            var chatRef = refs.refTeamChats.child(groupID).child(TeamID).child(channelObj.channelID).child("messages")
                                .push({

                                    from: user.userID,
                                    timestamp: fireTimeStamp,
                                    text: "Welcome to " + channelObj.title + " Group"


                                }, function(error) {
                                    if (error) {
                                        deferred.reject("error occurred in creating channel");
                                    } else {
                                        deferred.resolve("channel created successfully and also pushed activity.");
                                            /*//step4 - create an activity for "channel-created" verb.
                                            self.asyncRecordChannelCreationActivity(channelObj,user,groupID ).then(
                                                deferred.resolve("channel created successfully and also pushed activity.")
                                            )*/
                                    }


                                });








                        }
                    });

                //}



                // });

                return deferred.promise;
            },
            geTeamChannelsSyncArray: function(groupID, TeamID) {
                return Firebase.getAsArray(refs.refsubgroupchannel.child(groupID).child(TeamID));
            },
            getTeamChannelMessagesArray: function(groupID, teamID, channelID) {

                var ref = refs.refsubgroupmessages.child(groupID + '/' + teamID + '/' + channelID);
                return $firebaseArray(ref);
            },

            TeamSendMessages: function(groupID, teamID, channelID, user, text) {

                var deferred = $q.defer();
                var msgRef = refs.refsubgroupmessages.child(groupID + '/' + teamID + '/' + channelID).push({

                    from: user.userID,
                    timestamp: fireTimeStamp,
                    text: text.msg


                }, function(error) {
                    if (error) {
                        deferred.reject("error occurred in sending msg");
                    } else {
                        deferred.resolve("msg sucessfully sent");
                    }


                });



                return deferred.promise;

            }
        };
    }
})();

/**
 * Created by ZiaKhan on 31/12/14.
 */

'use strict';

angular.module('core')
    .factory('userService', ["$state", "$q", "$http", "appConfig", '$localStorage', function($state, $q, $http, appConfig, $localStorage) {
        //.factory('userService',["$http","appConfig","$sessionStorage",'$localStorage','userFirebaseService', function( $http, appConfig,$sessionStorage,$localStorage, userFirebaseService) {

        var user = $localStorage.loggedInUser;

        return {
            getUserPresenceFromLocastorage: function() {
                var deferred = $q.defer();
                if (user && user.userID) {
                    if ((user.expiry*1000) < Date.now()) {
                        deferred.resolve();
                    }
                    var ref = new Firebase(appConfig.myFirebase);
                    ref.child("users").child(user.userID).once('value', function(snapshot) {
                        if (snapshot.hasChild('email')) {
                            $state.go('user.dashboard', {userID: user.userID})
                        } else {
                            deferred.resolve();
                        }
                        //console.log(snapshot)
                    }); //user once
                } // if userObj
                else {
                    deferred.resolve();
                }

                return deferred.promise;

            },
            getCurrentUser: function() {
                return user;
            },
            getUserProfile : function(userID,callback) {
                var ref = new Firebase(appConfig.myFirebase);
                ref.child('users').child(userID).once('value',function(snapshot){
                  callback(snapshot.val());
                })
            },
            getCurrentUserID: function() {
                return user.userID;
            },
            setCurrentUser: function(newuser) {
                $localStorage.loggedInUser = newuser;
                user = newuser;
            },
            removeCurrentUser: function() {
                delete $localStorage.loggedInUser;
                user = {};
            },
            setExpiry: function(timestamp) {
                $localStorage.loggedInUser.expiry = timestamp;
                user.expiry = timestamp;
            },
            getExpire: function() {
                return user.expiry
            },
            isUserAccessingOwnHome: function(path, userLoggedInfo) {
                return true;
            },
            isUserGroupAdmin: function() {

            },
            isUserGroupMember: function() {

            }
        };
    }]);

/**
 * Created by Mkamran on 31/12/14.
 */

"use strict";

angular.module('core')
    .factory('dataService', ['$firebaseObject', 'firebaseService', 'checkinService', 'userService', 'userPresenceService',
        function($firebaseObject, firebaseService, checkinService, userService, userPresenceService) {
            var userData = [];
            var userGroups = [];
            var userID = '';

            function unloadData () {
                userData = [];
                userGroups = [];
                userID = '';
            }

            function loadData () {
                unloadData();
                userID = userService.getCurrentUser().userID;
                setUserData();
                setUserGroups();
            }

            function setUserData () {
                var groupTitle = '';
                var subgroupTitle = '';
                var groupsubgroupTitle = {};
                firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_added', function(group, prevChildKey) {
                    $firebaseObject(firebaseService.getRefGroups().child(group.key())).$loaded().then(function(groupmasterdata) {
                        groupsubgroupTitle[group.key()] = groupmasterdata.title;
                    });
                    firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).on('child_added', function(subgroup, prevChildKey) {
                        // console.log('user', subgroup.val())
                        firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).on('child_removed', function(rmsubgroup) {
                            firebaseService.getRefSubGroupMembers().child(group.key()).child(subgroup.key()).off();
                            userData.forEach(function(val, indx) {
                                // if (val.id === userID) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + rmsubgroup.key())) {
                                        userData.splice(indx, 1);
                                    }
                                // }
                            });
                        });
                        firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).child(subgroup.key()).on('child_changed', function(chsubgroup) {
                            // console.log('watch', chsubgroup)
                            // firebaseService.getRefSubGroupMembers().child(group.key()).child(subgroup.key()).off();
                            // userData.forEach(function(val, indx) {
                            //     // if (val.id === userID) {
                            //         if (val.groupsubgroup === (group.key() + ' / ' + rmsubgroup.key())) {
                            //             userData.splice(indx);
                            //         }
                            //     // }
                            // });
                        });
                        checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).on('child_changed', function(snapshot, prevChildKey) {
                            userData.forEach(function(val, indx) {
                                if (val.id === snapshot.key()) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + subgroup.key())) {
                                        if (snapshot.val().type === 1) {
                                            val.type = true;
                                        } else {
                                            val.type = false;
                                        }
                                        val.message = snapshot.val().message;
                                        val.timestamp = snapshot.val().timestamp;
                                    }
                                }
                            });
                        });
                        checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).on('child_added', function(snapshot, prevChildKey) {
                           userData.forEach(function(val, indx) {
                                if (val.id === snapshot.key()) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + subgroup.key())) {
                                        if (snapshot.val().type === 1) {
                                            val.type = true;
                                        } else {
                                            val.type = false;
                                        }
                                        val.message = snapshot.val().message;
                                        val.timestamp = snapshot.val().timestamp;
                                    }
                                }
                            });
                        });
                        $firebaseObject(firebaseService.getRefSubGroups().child(group.key()).child(subgroup.key())).$loaded().then(function(subgroupmasterdata) {
                            groupsubgroupTitle[subgroup.key()] = subgroupmasterdata.title;
                        });
                        firebaseService.getRefSubGroupMembers().child(group.key()).child(subgroup.key()).on('child_added', function(snapshot, prevChildKey) {
                            // console.log('user2', snapshot.key(), snapshot.val())
                            $firebaseObject(checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).child(snapshot.key())).$loaded().then(function(userdata) {
                                // console.log('user', userdata)
                                // checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).child(snapshot.key()).on('value', function(ss){
                                //     console.log('user', ss.key())
                                //     console.log('user', ss.val())
                                // })
                                if (userdata.type === 1) {
                                    var type = true;
                                } else {
                                    var type = false;
                                }
                                var message = userdata.message;
                                var timestamp = userdata.timestamp;
                                $firebaseObject(firebaseService.getRefUsers().child(userdata.$id)).$loaded().then(function(usermasterdata) {
                                    // console.log('user change 4', userdata.$id)
                                    firebaseService.getRefUsers().child(userdata.$id).on('child_changed', function(snapshot, prevChildKey) {
                                        // console.log('user change', snapshot.key(), snapshot.val(), userData.length)
                                        // for (var i = 0; i <= userData.length; i++) {
                                        //     // console.log('user change 2', i, userData[i].id, userdata.$id)
                                        //     if (userData[i].id === userdata.$id) {
                                        //         // console.log('user change 3', val.id)
                                        //         if (snapshot.key() === "profile-image") {
                                        //             userData[i].profileImage = snapshot.val();
                                        //         }
                                        //         if (snapshot.key() === "firstName") {
                                        //             userData[i].firstName = snapshot.val();
                                        //         }
                                        //         if (snapshot.key() === "lastName") {
                                        //             userData[i].lastName = snapshot.val();
                                        //         }
                                        //         if (snapshot.key() === "contactNumber") {
                                        //             userData[i].contactNumber = snapshot.val();
                                        //         }
                                        //         break;
                                        //     }
                                            userData.forEach(function(val, indx) {
                                                    // console.log('user 2', val.id, userdata.$id)
                                                if (val.id === userdata.$id) {
                                                    // console.log('user 1', val.id === userdata.$id)
                                                    console.log('user 1', snapshot.key())
                                                    if (snapshot.key() === "profile-image") {
                                                        val.profileImage = snapshot.val();
                                                    }
                                                    if (snapshot.key() === "firstName") {
                                                        val.firstName = snapshot.val();
                                                        val.fullName = val.firstName + ' ' + val.lastName;
                                                    }
                                                    if (snapshot.key() === "lastName") {
                                                        console.log('user 2', val.lastName)
                                                        val.lastName = snapshot.val();
                                                        val.fullName = val.firstName + ' ' + val.lastName;
                                                    }
                                                    if (snapshot.key() === "contactNumber") {
                                                        val.contactNumber = snapshot.val();
                                                    }
                                                }
                                            });
                                        // }
                                    });
                                    firebaseService.getRefUsers().child(userdata.$id).on('child_added', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (snapshot.key() === "profile-image") {
                                                    val.profileImage = snapshot.val();
                                                }
                                                if (snapshot.key() === "firstName") {
                                                    val.firstName = snapshot.val();
                                                    val.fullName = val.firstName + ' ' + val.lastName;
                                                }
                                                if (snapshot.key() === "lastName") {
                                                    val.lastName = snapshot.val();
                                                    val.fullName = val.firstName + ' ' + val.lastName;
                                                }
                                                if (snapshot.key() === "contactNumber") {
                                                    val.contactNumber = snapshot.val();
                                                }
                                            }
                                        });
                                    });
                                    /*userPresenceService.getRefUsersPresense().child(userdata.$id).child('defined-status').on('value', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                val.onlinestatus = snapshot.val();
                                            }
                                        })
                                    });*/
                                    userPresenceService.getRefUsersPresense().child(userdata.$id).child('connections').on('value', function(usersPresense, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (usersPresense.val()) {
                                                    /*for (var key in snapshot.val()) {
                                                        if (snapshot.val()[key].type === 1) {
                                                            val.onlineweb = 1;
                                                        } else if (snapshot.val()[key].type === 2) {
                                                            val.onlineios = 1;
                                                        } else if (snapshot.val()[key].type === 3) {
                                                            val.onlineandroid = 1;
                                                        }
                                                    }*/
                                                    val.onlinestatus = true;
                                                } else {
                                                    val.onlinestatus = false;
                                                }
                                            }
                                        });
                                        firebaseService.getRefGroupMembers().child(group.key()).child(userdata.$id).once('value', function(snapshot) {
                                            // console.log('snap', snapshot.getPriority(), snapshot.val(), snapshot.key())
                                            // console.log('user', userdata.$id)
                                            if (userData.length > 0) {
                                                for (var indx = 0; indx <= userData.length; indx++) {
                                                    // console.log(val.id);
                                                    // console.log(userdata.$id)
                                                    // console.log(userData[indx])
                                                    if (userData[indx].id === userdata.$id && userData[indx].groupID === group.key() && userData[indx].subgroupID === subgroup.key()) {
                                                        userData[indx].id = userdata.$id;
                                                        userData[indx].type = type;
                                                        userData[indx].groupsubgroup = group.key() + ' / ' + subgroup.key();
                                                        userData[indx].groupsubgroupTitle = groupsubgroupTitle[group.key()] + ' / ' + groupsubgroupTitle[subgroup.key()];
                                                        userData[indx].groupID = group.key();
                                                        userData[indx].groupTitle = groupsubgroupTitle[group.key()];
                                                        userData[indx].subgroupID = subgroup.key();
                                                        userData[indx].subgroupTitle = groupsubgroupTitle[subgroup.key()];
                                                        userData[indx].membershipNo  = snapshot.getPriority() || '';
                                                        userData[indx].contactNumber = usermasterdata.contactNumber || '';
                                                        userData[indx].onlinestatus = usersPresense.val() ? true : false,
                                                        /*userData[indx].onlineweb = 0;
                                                        userData[indx].onlineios = 0;
                                                        userData[indx].onlineandroid = 0;*/
                                                        userData[indx].timestamp = timestamp;
                                                        userData[indx].message = message;
                                                        userData[indx].profileImage = usermasterdata['profile-image'] || '';
                                                        userData[indx].firstName = usermasterdata.firstName;
                                                        userData[indx].lastName = usermasterdata.lastName;
                                                        userData[indx].fullName = usermasterdata.firstName + ' ' + usermasterdata.lastName;
                                                        break;
                                                    }
                                                    if (userData.length === indx + 1) {
                                                        userData.push({
                                                            id: userdata.$id,
                                                            type: type,
                                                            groupsubgroup: group.key() + ' / ' + subgroup.key(),
                                                            groupsubgroupTitle: groupsubgroupTitle[group.key()] + ' / ' + groupsubgroupTitle[subgroup.key()],
                                                            groupID: group.key(),
                                                            groupTitle: groupsubgroupTitle[group.key()],
                                                            subgroupID: subgroup.key(),
                                                            subgroupTitle: groupsubgroupTitle[subgroup.key()],
                                                            membershipNo : snapshot.getPriority() || '',
                                                            contactNumber: usermasterdata.contactNumber || '',
                                                            onlinestatus: usersPresense.val() ? true : false,
                                                            /*onlineweb: 0,
                                                            onlineios: 0,
                                                            onlineandroid: 0,*/
                                                            timestamp: timestamp,
                                                            message: message,
                                                            profileImage: usermasterdata['profile-image'] || '',
                                                            firstName: usermasterdata.firstName,
                                                            lastName: usermasterdata.lastName,
                                                            fullName: usermasterdata.firstName + ' ' + usermasterdata.lastName
                                                        });
                                                    }
                                                };
                                            } else {
                                                userData.push({
                                                    id: userdata.$id,
                                                    type: type,
                                                    groupsubgroup: group.key() + ' / ' + subgroup.key(),
                                                    groupsubgroupTitle: groupsubgroupTitle[group.key()] + ' / ' + groupsubgroupTitle[subgroup.key()],
                                                    groupID: group.key(),
                                                    groupTitle: groupsubgroupTitle[group.key()],
                                                    subgroupID: subgroup.key(),
                                                    subgroupTitle: groupsubgroupTitle[subgroup.key()],
                                                    membershipNo : snapshot.getPriority() || '',
                                                    contactNumber: usermasterdata.contactNumber || '',
                                                    onlinestatus: usersPresense.val() ? true : false,
                                                    /*onlineweb: 0,
                                                    onlineios: 0,
                                                    onlineandroid: 0,*/
                                                    timestamp: timestamp,
                                                    message: message,
                                                    profileImage: usermasterdata['profile-image'] || '',
                                                    firstName: usermasterdata.firstName,
                                                    lastName: usermasterdata.lastName,
                                                    fullName: usermasterdata.firstName + ' ' + usermasterdata.lastName
                                                });
                                            }
                                        });
                                    });
                                });
                            }); //$firebaseObject
                        }); //firebaseService.getRefSubGroupMembers child_added
                    });
                });
            }

            function getUserData () {
                return userData;
            }

            function setUserGroups () {
                firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function(group, prevChildKey) {
                	firebaseService.getRefUserGroupMemberships().child(userID).child(group.key()).on('child_removed', function() {
                		userGroups.forEach(function(val,indx) {
                            if(val.groupID === group.key()) {
                                userGroups.splice(indx, 1);
                            }
                        });
                	});
                    firebaseService.getRefGroups().child(group.key()).on('value', function(snapshot) {
                        var groupmasterdata = snapshot.val();
                        var eflag = true;

                        //checking if group exists then update
                        userGroups.forEach(function(val,indx) {
                            if(val.groupID === snapshot.key()) {
                                val.title = groupmasterdata.title;
                                val.address = groupmasterdata.address;
                                val.addressTitle = groupmasterdata['address-title'] || '';
                                val.phone = groupmasterdata.phone;
                                val.desc = groupmasterdata.desc;
                                val.ownerID = groupmasterdata["group-owner-id"];
                                val.owerImgUrl = groupmasterdata["owner-img-url"];
                                val.imgUrl = (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' );
                                val.membersOnline = (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0);
                                val.members = groupmasterdata["members-count"];
                                eflag = false;
                            }
                        });

                        if(eflag){
                            if(snapshot.hasChildren()) {
                                userGroups.push({
                                    groupID: snapshot.key(),
                                    title: groupmasterdata.title,
                                    address: groupmasterdata.address,
                                    addressTitle: groupmasterdata['address-title'] || '',
                                    phone: groupmasterdata.phone,
                                    desc: groupmasterdata.desc,
                                    ownerID: groupmasterdata["group-owner-id"],
                                    owerImgUrl: groupmasterdata["owner-img-url"],
                                    imgUrl: (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' ),
                                    membersOnline: (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0),
                                    members: groupmasterdata["members-count"]
                                }); //userGroups Push
                                firebaseService.getRefGroups().child(group.key()).on('child_changed', function(snapshot, prevChildKey) {
                                    userGroups.forEach(function(item, index){
                                        if (item.groupID === group.key()) {
                                            if (snapshot.key() === "title") {
                                                item.title = snapshot.val();
                                            }
                                            if (snapshot.key() === "members-checked-in") {
                                                item.membersOnline = snapshot.val().count;
                                            }
                                            if (snapshot.key() === "members-count") {
                                                item.members = snapshot.val();
                                            }
                                            if (snapshot.key() === "address-title") {
                                                item.addressTitle = snapshot.val();
                                            }
                                        }
                                    });
                                });// firebaseService
                            }//if snapshot.hasChildren()
                        } // if eflag



                        // userGroups.forEach(function(val,indx){
                        //     console.log('2')
                        //     if(val.groupID === snapshot.key()) {
                        //         console.log('3')
                        //         val.title = groupmasterdata.title;
                        //         val.address = groupmasterdata.address;
                        //         val.addressTitle = groupmasterdata['address-title'] || '';
                        //         val.phone = groupmasterdata.phone;
                        //         val.desc = groupmasterdata.desc;
                        //         val.ownerID = groupmasterdata["group-owner-id"];
                        //         val.owerImgUrl = groupmasterdata["owner-img-url"];
                        //         val.imgUrl = (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' );
                        //         val.membersOnline = (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0);
                        //         val.members = groupmasterdata["members-count"];
                        //     } else {
                        //         console.log('else')
                        //         if(snapshot.hasChildren()) {
                        //             userGroups.push({
                        //                 groupID: snapshot.key(),
                        //                 title: groupmasterdata.title,
                        //                 address: groupmasterdata.address,
                        //                 addressTitle: groupmasterdata['address-title'] || '',
                        //                 phone: groupmasterdata.phone,
                        //                 desc: groupmasterdata.desc,
                        //                 ownerID: groupmasterdata["group-owner-id"],
                        //                 owerImgUrl: groupmasterdata["owner-img-url"],
                        //                 imgUrl: (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' ),
                        //                 membersOnline: (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0),
                        //                 members: groupmasterdata["members-count"]
                        //             });
                        //             firebaseService.getRefGroups().child(group.key()).on('child_changed', function(snapshot, prevChildKey) {
                        //                 userGroups.forEach(function(item, index){
                        //                     if (item.groupID === group.key()) {
                        //                         if (snapshot.key() === "title") {
                        //                             item['title'] = snapshot.val()
                        //                         }
                        //                         if (snapshot.key() === "members-checked-in") {
                        //                             item.membersOnline = snapshot.val().count
                        //                         }
                        //                         if (snapshot.key() === "members-count") {
                        //                             item.members = snapshot.val()
                        //                         }
                        //                         if (snapshot.key() === "address-title") {
                        //                             item.addressTitle = snapshot.val();
                        //                         }
                        //                     }
                        //                 });
                        //             });
                        //         }//if closing
                        //     }//else closing
                        // })
                    });
                });
            }

            function getUserGroups () {
                return userGroups;
            }

            function setUserCheckInOut (grId, sgrId, userID, type) {
                userData.forEach(function(val, indx) {
                    if (val.groupsubgroup === (grId + ' / ' + sgrId)) {
                        if (val.id === userID) {
                            if (type) {
                                val.type = false;
                            } else {
                                val.type = true;
                            }
                        }
                    }
                });
            }

            return {
                loadData: loadData,
                unloadData: unloadData,
                getUserData: getUserData,
                getUserGroups: getUserGroups,
                setUserCheckInOut: setUserCheckInOut
            };
        }
    ]);

/**
 * Created by ZiaKhan on 07/01/15.
 */

'use strict';

angular.module('core')
    .factory('utilService', ['$q', function($q) {
        return {
            trim: function(str, characters) {
                var c_array = characters.split('');
                var result = '';

                for (var i = 0; i < characters.length; i++)
                    result += '\\' + c_array[i];

                return str.replace(new RegExp('^[' + result + ']+|[' + result + ']+$', 'g'), '');
            },
            trimID: function(str) {
                return this.trim(str, "/");
            },
            base64ToBlob: function(base64) {
                // console.log(base64.split(',')[0])
                var blobBin = atob(base64.split(',')[1]);
                var array = [];
                for (var i = 0; i < blobBin.length; i++) {
                    array.push(blobBin.charCodeAt(i));
                }

                return new Blob([new Uint8Array(array)], {
                    type: 'image/png'
                });
            }
        };
    }]);

/**
 * Created by ZiaKhan on 01/02/15.
 */

'use strict';

angular.module('core')
    .factory('messageService', ["$mdToast", "soundService", function($mdToast, soundService) {
        var position = 'top left';
        return {
            show: function(message) {
                $mdToast.show({
                    template: '<md-toast class="md-toast-animating">' + message + '</md-toast>',
                    hideDelay: 3000,
                    //hideDelay: 200000,
                    position: 'top left right'
                });
            },
            fast: function(message) {
                $mdToast.show({
                    template: '<md-toast class="md-toast-animating">' + message + '</md-toast>',
                    hideDelay: 500,
                    //hideDelay: 200000,
                    position: 'top left right'
                });
            },
            showSuccess: function(message) {
                this.show(message || 'Process successful.');
                soundService.playSuccess();
            },
            showFailure: function(message) {
                this.show(message || 'Process failed.');
                soundService.playFail();
            },
            fastSuccess: function(message) {
                this.fast(message || 'Process successful.');
                soundService.playSuccess();
            },
            fastFailure: function(message) {
                this.fast(message || 'Process failed.');
                soundService.playFail();
            },
            changePosition: function(position) {
                position = position
            },
            reset: function() {
                position = 'top left'
            }
        };
    }]);

/**
 * Created by Shahzad on 2/25/2015.
 */

(function() {
    'use strict';

    angular
        .module('core')
        .factory('confirmDialogService', confirmDialogService);

    confirmDialogService.$inject = ['$mdDialog'];

    function confirmDialogService($mdDialog) {

        return function(cautionString) {
            return $mdDialog.show({
                templateUrl: 'core/views/confirmDialog.tmpl.html',
                controller: 'ConfirmDialogCtrl',
                locals: {
                    cautionString: cautionString || 'Are you sure ?'
                }
            });
        };
    }

})();

/**
 * Created by ZiaKhan on 02/01/15.
 */

'use strict';

angular.module('core')
    .factory('firebaseService', ["$firebaseAuth", "appConfig", "$q", "$location", "$timeout", "messageService", "$firebaseObject", "userPresenceService", "userService",
        function($firebaseAuth, appConfig, $q, $location, $timeout, messageService, $firebaseObject, userPresenceService, userService) {

            var ref = new Firebase(appConfig.myFirebase);

            var currentAuthData = null;
            var refUsers = null;
            var refGroups = null;
            var refSubGroups = null;
            var refMicroGroups = null;
            var refUserGroupMemberships = null;
            var refUserSubGroupMemberships = null;
            var refUserMicroGroupMemberships = null;
            var groupsUserInvites = null;
            var groupMembershipRequests = null;
            var groupsMembershipRequestsByUser = null;
            var subgroupMembershipRequests = null;
            var subgroupMembershipRequestsByUser = null;
            var groupMembers = null;
            var subgroupMembers = null;
            var microgroupMembers = null;
            var groupsNames = null;
            var subgroupsNames = null;
            var microgroupsNames = null;
            var groupsActivityStreams = null;
            var subgroupsActivityStreams = null;
            var microgroupsActivityStreams = null;
            var groupCheckinCurrent = null;
            var groupCheckinRecords = null;
            var subgroupCheckinRecords = null;
            var groupLocsDefined = null;
            var flattenedGroups = null;
            var loggedUserRef = null;
            var policies = null;
            var userPolicies = null;
            var progressReport = null;
            var subgroupPolicies = null;
            var activitySeen = null;

            return {
                addUpdateHandler: function() {
                    ref.onAuth(function(authData) {
                        if (authData) {
                            currentAuthData = authData;
                            //console.info("User " + authData.uid + " is logged in with " + authData.provider);
                        } else {
                            //console.info("User is logged out");
                            //delete $sessionStorage.loggedInUser;
                            userService.removeCurrentUser();
                            appConfig.firebaseAuth = false;
                            messageService.showFailure("User is logged out, Please login again.");
                            //$location.path("/user/login");
                        }
                    });

                },
                getRefMain: function() {
                    return ref;
                },
                getAuthData: function() {
                    return ref.getAuth();
                },
                getRefUsers: function() {
                    return refUsers;
                },
                getRefUserGroupMemberships: function() {
                    return refUserGroupMemberships;
                },
                getRefUserSubGroupMemberships: function() {
                    return refUserSubGroupMemberships;
                },
                getRefUserMicroGroupMemberships: function() {
                    return refUserMicroGroupMemberships;
                },
                getRefGroupsUserInvites: function() {
                    return groupsUserInvites;
                },
                getRefGroupMembershipRequests: function() {
                    return groupMembershipRequests;
                },
                getRefGroupMembershipRequestsByUser: function() {
                    return groupsMembershipRequestsByUser;
                },
                getRefSubgroupMembershipRequests: function() {
                    return subgroupMembershipRequests;
                },
                getRefSubgroupMembershipRequestsByUser: function() {
                    return subgroupMembershipRequestsByUser;
                },
                getRefGroupMembers: function() {
                    return groupMembers;
                },
                getRefSubGroupMembers: function() {
                    return subgroupMembers;
                },
                getRefMicroGroupMembers: function() {
                    return microgroupMembers;
                },
                getRefGroupsNames: function() {
                    return groupsNames;
                },
                getRefSubGroupsNames: function() {
                    return subgroupsNames;
                },
                getRefMicroGroupsNames: function() {
                    return microgroupsNames;
                },
                getRefGroupsActivityStreams: function() {
                    return groupsActivityStreams;
                },
                getRefSubGroupsActivityStreams: function() {
                    return subgroupsActivityStreams;
                },
                getRefMicroGroupsActivityStreams: function() {
                    return microgroupsActivityStreams;
                },
                getRefGroups: function() {
                    return refGroups;
                },
                getRefSubGroups: function() {
                    return refSubGroups;
                },
                getRefMicroGroups: function() {
                    return refMicroGroups;
                },
                getRefGroupCheckinCurrent: function() {
                    return groupCheckinCurrent;
                },
                getRefGroupCheckinRecords: function() {
                    return groupCheckinRecords;
                },
                getRefsubgroupCheckinRecords: function() {
                    return subgroupCheckinRecords;
                },
                getRefGroupLocsDefined: function() {
                    return groupLocsDefined;
                },
                getSignedinUserRef: function() {
                    return loggedUserRef;
                },
                getRefFlattendGroups: function() {
                    return flattenedGroups;
                },
                getRefPolicies: function() {
                    return policies;
                },
                getRefUserPolicies: function() {
                    return userPolicies;
                },
                getRefProgressReport: function() {
                    return progressReport;
                },
                getRefSubgroupPolicies: function(){
                        return subgroupPolicies;
                },
                getRefActivitySeen: function() {
                    return activitySeen;
                },
                logout: function() {
                  console.log('unauth the firebase');
                  ref.unauth();
                  var authdata = ref.getAuth();
                  console.log(authdata);
                },
                asyncLogin: function(userID, token) {
                    var deferred = $q.defer();
                    if (token) { // means user logged in from web server
                        Firebase.goOnline(); // if previously manually signed out from firebase.
                        var auth = $firebaseAuth(ref);
                        auth.$authWithCustomToken(token).then(function(authData) {
                            if (authData.uid == userID) {

                                //authenticated
                                appConfig.firebaseAuth = true;
                                userService.setExpiry(authData.expires)

                                /*storing references*/
                                currentAuthData = authData;
                                refUsers = ref.child("users");
                                refGroups = ref.child("groups");
                                refSubGroups = ref.child("subgroups");
                                refMicroGroups = ref.child("microgroups");
                                refUserGroupMemberships = ref.child("user-group-memberships");
                                refUserSubGroupMemberships = ref.child("user-subgroup-memberships");
                                refUserMicroGroupMemberships = ref.child("user-microgroup-memberships");
                                groupsUserInvites = ref.child("groups-user-invites");
                                groupMembershipRequests = ref.child("group-membership-requests");
                                groupsMembershipRequestsByUser = ref.child("group-membership-requests-by-user");
                                subgroupMembershipRequests = ref.child("subgroup-membership-requests");
                                subgroupMembershipRequestsByUser = ref.child("subgroup-membership-requests-by-user");
                                groupMembers = ref.child("group-members");
                                subgroupMembers = ref.child("subgroup-members");
                                microgroupMembers = ref.child("microgroup-members");
                                groupsNames = ref.child("groups-names");
                                subgroupsNames = ref.child("subgroups-names");
                                microgroupsNames = ref.child("microgroups-names");
                                groupsActivityStreams = ref.child("group-activity-streams");
                                subgroupsActivityStreams = ref.child("subgroup-activity-streams");
                                microgroupsActivityStreams = ref.child("microgroup-activity-streams");
                                groupCheckinCurrent = ref.child("group-check-in-current");
                                groupCheckinRecords = ref.child("group-check-in-records");
                                subgroupCheckinRecords = ref.child("subgroup-check-in-records");
                                groupLocsDefined = ref.child("group-locations-defined");
                                flattenedGroups = ref.child("flattened-groups");
                                policies = ref.child("policies");
                                userPolicies = ref.child("user-policies");
                                progressReport = ref.child('subgroup-progress-reports');
                                subgroupPolicies = ref.child('subgroup-policies');
                                activitySeen = ref.child('activities-seen-by-user');

                                /*presence API work*/
                                //explicitly passing references to avoid circular dependency issue.
                                userPresenceService.init({
                                    main: ref,
                                    users: refUsers
                                });

                                //listen for firebase connection state and register presence
                                userPresenceService.syncUserPresence(userID);

                                deferred.resolve({
                                    loggedUserRef: loggedUserRef
                                });
                            } else {
                                deferred.reject();
                            }
                        }).catch(function(error) {
                            // console.error("Firebase Authentication failed: ", error);
                            deferred.reject(error);
                        });
                    } else {
                        deferred.reject(); //token not provided
                    }
                    return deferred.promise;
                },
                asyncCheckIfGroupExists: function(groupID) {
                    var deferred = $q.defer();
                    groupsNames.child(groupID).once('value', function(snapshot) {
                        var exists = (snapshot.val() !== null);
                        deferred.resolve({
                            exists: exists,
                            group: snapshot.val()
                        });
                    });
                    return deferred.promise;
                },
                asyncCheckIfUserExists: function(userID) {
                    var deferred = $q.defer();
                    refUsers.child(userID).once('value', function(snapshot) {
                        var exists = (snapshot.val() !== null);
                        deferred.resolve({
                            exists: exists,
                            userID: userID,
                            user: snapshot.val()
                        });
                    });
                    return deferred.promise;
                }
            };
        }
    ]);

/**
 * Created by ZiaKhan on 11/02/15.
 */

'use strict';

angular.module('core')
    .factory('userFirebaseService', ['activityStreamService', "firebaseService", "$q", "$timeout", '$http', "$firebaseObject", 'appConfig', 'userService',
        function(activityStreamService, firebaseService, $q, $timeout, $http, $firebaseObject, appConfig, userService) {

            //Firebase timeStamp object.
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;

            function groupJoinRequestProcess(userID, groupID, message, subgroupID, subgrouptitle, membershipNo, deferred) {
                var ref = firebaseService.getRefGroupMembershipRequests().child(groupID);
                ref.child(userID).once("value", function(snap) {
                    var alreadyPending = snap.val();
                    if (alreadyPending) {
                        if (subgroupID) {
                            if (snap.val()['team-request']) {
                                var obj = snap.val()['team-request'];
                                obj.forEach(function(key, indx){
                                    if(key.subgroupID === subgroupID) {
                                        deferred.reject("Request is already pending for this team");
                                        return
                                    };
                                    if(obj.length === (indx + 1)) {
                                        // requestSaveToFirebase(groupID, subgroupID, subgrouptitle, userID, message, ref, deferred);

                                        var request = {};
                                        request[userID] = snap.val();
                                        request[userID]['timestamp'] = firebaseTimeStamp;
                                        request[userID]['message'] = message;
                                        request[userID]['membershipNo'] = membershipNo;
                                        request[userID]['team-request'][obj.length] = {
                                            'subgroupID': subgroupID,
                                            'subgrouptitle': subgrouptitle
                                        };
                                        ref.update(request, function(error) {
                                            if (error) {
                                                deferred.reject("Server Error, please try again");
                                                return
                                            } else {
                                                deferred.resolve();
                                                return
                                            }
                                        })

                                    }
                                })
                            } else {
                                var request = {};
                                request[userID] = {
                                    timestamp: firebaseTimeStamp,
                                    message: message,
                                    membershipNo: membershipNo,
                                    'team-request': {
                                        '0': {
                                            'subgroupID': subgroupID,
                                            'subgrouptitle': subgrouptitle
                                        }
                                    }
                                };
                                ref.update(request, function(error) {
                                    if (error) {
                                        deferred.reject("Server Error, please try again");
                                        return
                                    } else {
                                        deferred.resolve();
                                        return
                                    }
                                })
                            }
                        } else {
                            deferred.reject("Request is already pending for this team of teams"); //just to double check here also, but no need if data is consistent
                        }
                    } else {
                        requestSaveToFirebase(groupID, subgroupID, subgrouptitle, userID, message, membershipNo, ref, deferred);
                    }
                });
            }

            function requestSaveToFirebase (groupID, subgroupID, subgrouptitle, userID, message, membershipNo, ref, deferred) {
                var request = {};
                if (subgroupID) {
                    request[userID] = {
                        timestamp: firebaseTimeStamp,
                        message: message,
                        membershipNo: membershipNo,
                        'team-request': {
                            '0': {
                                'subgroupID': subgroupID,
                                'subgrouptitle': subgrouptitle
                            }
                        }
                    };
                } else {
                    request[userID] = {
                        timestamp: firebaseTimeStamp,
                        message: message,
                        membershipNo: membershipNo
                    };
                    console.log(membershipNo)
                }
                ref.update(request, function(error) {
                    if (error) {
                        deferred.reject("Server Error, please try again");
                    } else {
                        ref.child(userID).once("value", function(snapshot) {
                            var timestamp = snapshot.val()["timestamp"]; //to get the server time
                            var refByUser = firebaseService.getRefGroupMembershipRequestsByUser().child(userID); //Step 4 add to pending by user
                            var requestByUser = {};
                            requestByUser[groupID] = {
                                timestamp: timestamp
                            };
                            refByUser.update(requestByUser, function(error) {
                                if (error) {
                                    //roll back previous may be
                                    deferred.reject("Server Error, please try again");
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });
            }

            return {
                getUserMembershipsSyncObj: function(userID) {
                    var response = {
                        groupArray: [],
                        userActivityStream: []
                    };
                    var self = this;
                    response.userGroupMembershipRef = firebaseService.getRefUserGroupMemberships().child(userID);
                    response.userGroupMembershipRef.on('child_added', function(snapshot) {
                        $timeout(function() {
                            var groupSyncObj = $firebaseObject(firebaseService.getRefGroups().child(snapshot.key()));
                            var groupActivitiesRef = firebaseService.getRefGroupsActivityStreams().child(snapshot.key());
                            self.getGroupActivityStream(groupActivitiesRef, response.userActivityStream);
                            response.groupArray.push({
                                groupID: snapshot.key(),
                                membershipType: snapshot.val()["membership-type"],
                                timestamp: snapshot.val()["timestamp"],
                                groupData: groupSyncObj
                            });
                        }, 1000);

                    });
                    response.userGroupMembershipRef.on('child_changed', function(snapshot) {
                        var groupID = snapshot.key();
                        var groupObj = snapshot.val();
                        response.groupArray.forEach(function(obj) {
                            if (obj.groupID == groupID) {
                                $timeout(function() {
                                    obj.membershipType = groupObj['membership-type'];
                                });
                            }
                        });
                    });
                    response.userGroupMembershipRef.on('child_removed', function(snapshot) {
                        var groupID = snapshot.key();
                        var memberType = snapshot.val();
                        response.groupArray.forEach(function(obj, i) {
                            if (obj.groupID == groupID) {
                                $timeout(function() {
                                    response.groupArray.splice(i, 1);
                                });
                            }
                        });

                    });
                    return response;
                },
                'uploadProfilePicture': function(api, data) {
                    //var deferred = $q.defer();
                    return $http.post(appConfig.apiBaseUrl + '/' + api, data, {
                        withCredentials: false,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity
                    });
                    //return deferred.promise;
                },
                asyncCreateGroup: function(userID, groupObj, loggedInUserGroupsList, formDataFlag) {
                    var self = this;
                    var deferred = $q.defer();

                    //Step 1: see if it already exists
                    firebaseService.asyncCheckIfGroupExists(groupObj.groupID).then(function(response) {
                        if (response.exists) {
                            deferred.reject(groupObj);
                        } else {
                            //first adding own membership to get write access as per rules
                            firebaseService.getRefUserGroupMemberships().child(userID).child(groupObj.groupID).update({
                                "membership-type": 1,
                                timestamp: firebaseTimeStamp
                            }, function(error1) {
                                if (error1) {
                                    deferred.reject();
                                } else {
                                    firebaseService.getRefGroupMembers().child(groupObj.groupID).child(userID).set({
                                        "membership-type": 1,
                                        timestamp: firebaseTimeStamp
                                    }, function(error2) {
                                        if (error2) {
                                            deferred.reject();
                                        } else {
                                            //Step 4: Add to group
                                            var dataToSet = {
                                                'group-owner-id': userService.getCurrentUser().userID,
                                                'owner-img-url': groupObj.ownerImgUrl,
                                                title: groupObj.title,
                                                desc: groupObj.desc || '',
                                                'address-title': groupObj.addressTitle || '',
                                                address: groupObj.address || '',
                                                phone: groupObj.phone,
                                                timeZone: groupObj.timeZone,
                                                timestamp: firebaseTimeStamp,
                                                "members-count": 1,
                                                "subgroups-count": 0,
                                                "members-checked-in": {
                                                     "count": 0
                                                 },
                                                 privacy: + groupObj.signupMode,
                                                 'logo-image': {
                                                    url: groupObj.imgLogoUrl || 'https://s3-us-west-2.amazonaws.com/defaultimgs/teamofteams.png', // pID is going to be changed with userID for single profile picture only
                                                    id: groupObj.groupID,
                                                    'bucket-name': 'test2pwow',
                                                    source: 1, // 1 = google cloud storage
                                                    mediaType: 'image/png' //image/jpeg
                                                }
                                            };

                                            /* if(groupObj.signupMode === '3')dataToSet.privacy.allowedDomain = groupObj.allowedDomain;*/
                                            var groupRef = firebaseService.getRefGroups().child(groupObj.groupID).set(dataToSet, function(error) {
                                                if (error) {
                                                    deferred.reject();
                                                } else {

                                                    /* if(formDataFlag){
                                                         var api = appConfig.serverPostApi.groupProfilePictureUpload;
                                                         self.uploadProfilePicture(api,groupObj.formData).then(function(data){
                                                             console.log('pictureuploaded')
                                                             console.log(data)
                                                         },function(err){
                                                             console.log('picture upload error')
                                                             console.log(err)

                                                         }) // save groupProfilePicture usign our server
                                                     }*/
                                                    var groupNameRef = firebaseService.getRefGroupsNames().child(groupObj.groupID);
                                                    var data = {
                                                        title: groupObj.title,
                                                        groupImgUrl: groupObj.imgLogoUrl || 'https://s3-us-west-2.amazonaws.com/defaultimgs/teamofteams.png',
                                                        ownerImgUrl: groupObj.ownerImgUrl,
                                                        'address-title': groupObj.addressTitle || ''
                                                            //groupOwnerImgUrl:
                                                    };

                                                    groupNameRef.set(data, function(error) {
                                                        if (error) {
                                                            deferred.reject();
                                                            //role back previous
                                                        } else {
                                                            var memRef = firebaseService.getRefGroupMembers().child(groupObj.groupID);

                                                            //to create a JSON for given comma separated members string.
                                                            self.asyncCreateGroupMembersJSON(userID, groupObj.members).then(function(response) {
                                                                var mems = response.memberJSON;

                                                                //mems[userID] = {"membership-type": 1, timestamp: firebaseTimeStamp};
                                                                memRef.update(mems, function(error) {
                                                                    if (error) {
                                                                        //roleback previous
                                                                        deferred.reject();
                                                                    } else {
                                                                        var promises = [];
                                                                        //promises.push(self.asyncAddUserMembership(userID, groupObj.groupID, 1));
                                                                        var memArray = response.members;
                                                                        memArray.forEach(function(val, i) {
                                                                            promises.push(self.asyncAddUserMembership(val, groupObj.groupID, 3));
                                                                        });
                                                                        $q.all(promises).then(function() {
                                                                            //self.asyncRecordGroupCreationActivity(groupObj, $sessionStorage.loggedInUser).then(function () {
                                                                            self.asyncRecordGroupCreationActivity(groupObj, userService.getCurrentUser()).then(function() {
                                                                                var memberCountRef = firebaseService.getRefGroups().child(groupObj.groupID).child("members-count");
                                                                                if (memArray.length > 0) {
                                                                                    memberCountRef.transaction(function(current_value) {
                                                                                        return (current_value || 0) + memArray.length;
                                                                                    });
                                                                                }

                                                                                if (memArray.length == 1) {
                                                                                    //self.asyncRecordGroupMemberAdditionActivity(groupObj, $sessionStorage.loggedInUser, response.members[0])
                                                                                    // self.asyncRecordGroupMemberAdditionActivity(groupObj, userService.getCurrentUser(), response.members[0])
                                                                                    //     .then(function() {
                                                                                    //         deferred.resolve({
                                                                                    //             unlistedMembersArray: response.unlisted
                                                                                    //         });
                                                                                    //     })
                                                                                } else if (memArray.length > 1) {
                                                                                    //self.asyncRecordManyGroupMembersAdditionActivity(groupObj, $sessionStorage.loggedInUser, response.members)
                                                                                    // self.asyncRecordManyGroupMembersAdditionActivity(groupObj, userService.getCurrentUser(), response.members)
                                                                                    //     .then(function() {
                                                                                    //         deferred.resolve({
                                                                                    //             unlistedMembersArray: response.unlisted
                                                                                    //         });
                                                                                    //     });
                                                                                } else {
                                                                                    deferred.resolve({
                                                                                        unlistedMembersArray: response.unlisted
                                                                                    });
                                                                                }
                                                                            });

                                                                        }, function() {
                                                                            deferred.reject();
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });


                        }
                    });

                    return deferred.promise;
                },
                asyncAddUserMembership: function(userID, groupID, typeNum) {
                    var deferred = $q.defer();
                    var timestampRef = firebaseService.getRefGroupMembers().child(groupID + '/' + userID + '/timestamp');

                    timestampRef.once("value", function(snapshot) {
                        var timestamp = snapshot.val() || firebaseTimeStamp;
                        var userMem = {};

                        userMem[groupID] = {
                            "membership-type": typeNum,
                            timestamp: timestamp
                        };

                        var userMemRef = firebaseService.getRefUserGroupMemberships().child(userID);
                        userMemRef.update(userMem, function(error) {
                            if (error) {
                                deferred.reject();
                            } else {
                                deferred.resolve();
                            }
                        });
                    });

                    return deferred.promise;
                },
                asyncCreateGroupMembersJSON: function(ownerUserID, listStr, existingMembersObj) {
                    var deferred = $q.defer();

                    var groupMembersJSON = {};
                    var unlistedMembers = [];
                    var members = [];

                    if (listStr.length < 2) {
                        deferred.resolve({
                            memberJSON: groupMembersJSON,
                            unlisted: unlistedMembers,
                            members: members
                        });
                    } else {
                        existingMembersObj = existingMembersObj || {};

                        var memberArray = listStr.split(",");
                        var promises = [];

                        memberArray.forEach(function(val, i) {
                            val = val.trim();
                            var promise = firebaseService.asyncCheckIfUserExists(val);
                            promise.then(function(response) {
                                if (response.exists) {
                                    /*check if requested userID is :
                                     * a valid user,
                                     * has not already been added to members list of group (if updating members list) */
                                    if (val != ownerUserID && !existingMembersObj[val]) {
                                        groupMembersJSON[val] = {
                                            "membership-type": 3, //1 means owner, 2 will mean admin, 3 means member only
                                            timestamp: firebaseTimeStamp
                                        };
                                        members.push(val);
                                        //}
                                    } else {
                                        unlistedMembers.push(val);
                                    }
                                } else {
                                    unlistedMembers.push(val);
                                }
                            });

                            promises.push(promise);
                        });

                        $q.all(promises).then(function() {
                            deferred.resolve({
                                memberJSON: groupMembersJSON,
                                unlisted: unlistedMembers,
                                members: members
                            });
                        }, function() {
                            deferred.reject();
                        });
                    }

                    return deferred.promise;
                },
                asyncRecordMemberLeft: function(userObj, groupObj) {
                    var deferred = $q.defer();

                    var ref = firebaseService.getRefGroupsActivityStreams().child(groupObj.$id);
                    var actor = {
                        "type": "user",
                        "id": userObj.userID, //this is the userID, and an index should be set on this
                        "email": userObj.email,
                        "displayName": userObj.firstName + " " + userObj.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": groupObj.$id, //an index should be set on this
                        "url": groupObj.$id,
                        "displayName": groupObj.title
                    };

                    var activity = {
                        language: "en",
                        verb: "group-member-left",
                        published: firebaseTimeStamp,
                        displayName: actor.displayName + " left " + target.displayName,
                        actor: actor,
                        target: target
                    };

                    var newActivityRef = ref.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = ref.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        deferred.reject();
                                    } else {
                                        deferred.resolve('You have left ' + target.displayName + ' successfully.');
                                    }
                                });
                            });
                        }
                    });

                    return deferred.promise;
                },
                asyncRecordGroupCreationActivity: function(groupObj, user) {
                    var deferred = $q.defer();

                    //publish an activity stream record -- START --
                    var type = 'group';
                    var targetinfo = {id: groupObj.groupID, url: groupObj.groupID, title: groupObj.title, type: 'group' };
                    var area = {type: 'group-created'};
                    var group_id = groupObj.groupID;
                    var memberuserID = null;
                    //for group activity record
                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                    //for group activity stream record -- END --
                    deferred.resolve();

                    // var ref = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    // var actor = {
                    //     "type": "user",
                    //     "id": user.userID, //this is the userID, and an index should be set on this
                    //     "email": user.email,
                    //     "displayName": user.firstName + " " + user.lastName
                    // };
                    //
                    // var object = {
                    //     "type": "group",
                    //     "id": group.groupID, //an index should be set on this
                    //     "url": group.groupID,
                    //     "displayName": group.title
                    // };
                    //
                    // var activity = {
                    //     language: "en",
                    //     verb: "group-creation",
                    //     //published: firebaseTimeStamp,
                    //     //published: Firebase.ServerValue.TIMESTAMP,
                    //     published: {
                    //         ".sv": "timestamp"
                    //     },
                    //     displayName: actor.displayName + " created " + group.title,
                    //     actor: actor,
                    //     object: object
                    // };
                    // var newActivityRef = ref.push();
                    // newActivityRef.set(activity, function(error) {
                    //     if (error) {
                    //         deferred.reject();
                    //     } else {
                    //         var activityID = newActivityRef.key();
                    //         var activityEntryRef = ref.child(activityID);
                    //         activityEntryRef.once("value", function(snapshot) {
                    //             var timestamp = snapshot.val().published;
                    //             newActivityRef.setPriority(0 - timestamp, function(error2) {
                    //                 if (error2) {
                    //                     deferred.reject();
                    //                 } else {
                    //                     deferred.resolve();
                    //                 }
                    //             });
                    //         });
                    //
                    //
                    //     }
                    // });

                    return deferred.promise;
                },
                asyncRecordGroupMemberAdditionActivity: function(group, user, memberUserID) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": group.groupID,
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };

                        var activity = {
                            language: "en",
                            verb: "group-added-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added " + object.displayName + " as a member in " + group.title,
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            deferred.reject();
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordManyGroupMembersAdditionActivity: function(group, user, membersArray) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var self = this;
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var object = {
                        "type": "UserCollection",
                        "totalItems": membersArray.length,
                        "items": {}
                    };

                    var target = {
                        "type": "group",
                        "id": group.groupID,
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    var promiseArray = [];
                    membersArray.forEach(function(member) {
                        promiseArray.push(firebaseService.asyncCheckIfUserExists(member));
                    });

                    $q.all(promiseArray).then(function(values) {
                        values.forEach(function(v) {
                            object.items[v.userID] = {
                                "verb": "group-added-member",
                                "object": {
                                    "type": "user",
                                    "id": v.userID,
                                    "email": v.user.email,
                                    "displayName": v.user.firstName + " " + v.user.lastName
                                }
                            };
                        });


                        var activity = {
                            language: "en",
                            verb: "group-added-many-members",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added members to " + group.title + " group",
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            deferred.reject();
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                            }
                        });
                    });

                    return deferred.promise;
                },
                asyncRecordGroupMemberApproveRejectActivity: function(type, group, user, memberUserID) {
                    var deferred = $q.defer();
                    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": group.groupID,
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };
                        //create an appropriate display message.
                        var displayName;
                        if (type === "approve") {
                            displayName = actor.displayName + " approved " + object.displayName +
                                " as a member in " + group.title + "."
                        } else {
                            displayName = actor.displayName + " rejected " + object.displayName +
                                "'s membership request for " + group.title + "group."
                        }

                        var activity = {
                            language: "en",
                            verb: type === "approve" ? "group-approve-member" : "group-reject-member",
                            published: firebaseTimeStamp,
                            displayName: displayName,//actor.displayName + " approved " + object.displayName + " as a member in " + group.title,
                            // if actor is to subject and target is to object then object is to verb
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = refGroupActivities.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                //handle this case
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = refGroupActivities.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            //handle this case
                                            deferred.reject();
                                        } else {
                                            deferred.resolve(displayName);
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordSubGroupMemberApproveRejectActivity: function(type, subgroup, user, memberUserID) {
                    //memberUserID is the request sender.
                    //user is one whom request is made.
                    var deferred = $q.defer();
                    var refSubgroupActivities = firebaseService.getRefSubGroupsActivityStreams().child(subgroup.groupID).child(subgroup.subgroupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID,
                        "url": subgroup.subgroupID,
                        "displayName": subgroup.title
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };

                        //create an appropriate display message.
                        var displayName;
                        if (type === "approve") {
                            displayName = actor.displayName + " approved " + object.displayName + " as a member in " + subgroup.title + "subgroup.";
                        } else {
                            displayName = actor.displayName + " rejected " + object.displayName + "'s membership request for " + subgroup.title + "subgroup.";
                        }

                        var activity = {
                            language: "en",
                            verb: type === "approve" ? "subgroup-approve-member" : "subgroup-reject-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + (type === "approve" ? " approved " : " rejected ") + object.displayName + " as a member in " + subgroup.title,
                            // if actor is to subject and target is to object then object is to verb
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = refSubgroupActivities.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                //handle this case
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = refSubgroupActivities.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            //handle this case
                                            deferred.reject();
                                        } else {
                                            deferred.resolve(displayName);
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordMembershipChangeActivity: function(prevType, newType, user, groupObj, loggedInUser) {
                    var deferred = $q.defer();
                    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(groupObj.$id);
                    var actor = {
                        "type": "user",
                        "id": loggedInUser.userID, //this is the userID, and an index should be set on this
                        "email": loggedInUser.email,
                        "displayName": loggedInUser.firstName + " " + loggedInUser.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": groupObj.$id,
                        "url": groupObj.$id,
                        "displayName": groupObj.title
                    };

                    var object = {
                        "type": "user-membership-change",
                        "id": user.$id,
                        "url": user.$id,
                        "from": this.getRoleTitleByType(prevType),
                        "to": this.getRoleTitleByType(newType),
                        "displayName": user.firstName + ' ' + user.lastName
                    };

                    var displayName = loggedInUser.firstName + ' ' + loggedInUser.lastName + ' changed ' +
                        user.firstName + ' ' + user.lastName + '\'s membership from "' + object.from +
                        '" to "' + object.to + '" for ' + groupObj.title + ' group.';

                    var activity = {
                        language: "en",
                        verb: "user-membership-change",
                        published: firebaseTimeStamp,
                        displayName: displayName,
                        actor: actor,
                        object: object,
                        target: target
                    };

                    var newActivityRef = refGroupActivities.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            //handle this case
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = refGroupActivities.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        //handle this case
                                        deferred.reject();
                                    } else {
                                        deferred.resolve(displayName);
                                    }
                                });
                            });
                        }
                    });

                    return deferred.promise;
                },
                asyncRecordMemberRemoved: function(prevType, newType, user, groupObj, loggedInUser) {
                    var deferred = $q.defer();
                    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(groupObj.$id);

                    var actor = {
                        "type": "user",
                        "id": loggedInUser.userID, //this is the userID, and an index should be set on this
                        "email": loggedInUser.email,
                        "displayName": loggedInUser.firstName + " " + loggedInUser.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": groupObj.$id,
                        "url": groupObj.$id,
                        "displayName": groupObj.title
                    };

                    var object = {
                        "type": "user",
                        "id": user.$id,
                        "url": user.$id,
                        "displayName": user.firstName + ' ' + user.lastName
                    };

                    var displayName = loggedInUser.firstName + ' ' + loggedInUser.lastName + ' removed ' +
                        user.firstName + ' ' + user.lastName + ' from "' + groupObj.title + '" group.';

                    var activity = {
                        language: "en",
                        verb: "group-member-removed",
                        published: firebaseTimeStamp,
                        displayName: displayName,
                        "from": this.getRoleTitleByType(prevType),
                        "to": null,
                        actor: actor,
                        object: object,
                        target: target
                    };

                    var newActivityRef = refGroupActivities.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            //handle this case
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = refGroupActivities.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        //handle this case
                                        deferred.reject();
                                    } else {
                                        deferred.resolve(displayName);
                                    }
                                });
                            });
                        }
                    });

                    return deferred.promise;
                },
                getGroupActivityStream: function(activityGroupRef, activityArray) {
                    var self = this;
                    activityGroupRef.orderByPriority().on("child_added", function(snapshot) {
                        //console.log(snapshot.key());
                        var activity = snapshot.val();
                        //activity.publishedDate = new Date(activity.published/1000);
                        if (activity) {
                            if (activityArray.length === 0) {
                                $timeout(function() {
                                    activityArray.push(activity);
                                });
                            } else {
                                var position = self.insertionPosition(activityArray, activity.published);
                                $timeout(function() {
                                    activityArray.splice(position, 0, activity);
                                });
                            }
                        }

                    });
                },
                insertionPosition: function(activityArray, currentTimestamp) {
                    for (var i = 0; i < activityArray.length; i++) {
                        if (currentTimestamp >= activityArray[i].published) {
                            return i;
                        }
                    }
                    return activityArray.length;
                },
                getRoleTitleByType: function(type) {
                    var verb = 'unknown';

                    switch (type) {
                        case -1:
                            verb = 'suspend';
                            break;
                        case 2:
                            verb = 'admin';
                            break;
                        case 3:
                            verb = 'member';
                            break;
                    }

                    return verb;
                },
                asyncGroupJoiningRequest: function(userID, groupID, message, subgroupID, subgrouptitle, membershipNo) {
                    var deferred = $q.defer();
                    var self = this;
                    firebaseService.asyncCheckIfGroupExists(groupID).then(function(response) {
                        if (response.exists) {
                            //Step 2: Add to pending requests
                            var userMembershipRef = firebaseService.getRefUserGroupMemberships().child(userID).child(groupID);
                            userMembershipRef.once("value", function(snapshotMem) { //Step 3: check to see if already a member
                                var membershipData = snapshotMem.val();
                                if (membershipData) {
                                    if (membershipData["membership-type"] == 1) {
                                        deferred.reject("User is already an owner of this team of teams");
                                    } else if (membershipData["membership-type"] == 2) {
                                        deferred.reject("User is already a admin of this team of teams");
                                    } else if (membershipData["membership-type"] == 0) {
                                        if (subgroupID) {
                                            groupJoinRequestProcess(userID, groupID, message, subgroupID, subgrouptitle, membershipNo, deferred);
                                        } else {
                                            deferred.reject("Membership request is already pending for this team of teams");
                                        }
                                    } else {
                                        if (subgroupID) {
                                            groupJoinRequestProcess(userID, groupID, message, subgroupID, subgrouptitle, membershipNo, deferred);
                                        } else {
                                            deferred.reject("User is already a member of this team of teams");
                                        }
                                    }
                                } else {
                                    groupJoinRequestProcess(userID, groupID, message, subgroupID, subgrouptitle, membershipNo, deferred);
                                }
                            });
                        } else {
                            deferred.reject(groupID + " does not exist!");
                        }
                    });
                    return deferred.promise;
                },
                asyncSubgroupJoiningRequest: function(userID, groupID, subgroupID, message) {
                        var deferred = $q.defer();
                        var self = this;

                        //Step 1: check to see if already a member
                        var userMembershipRef = firebaseService.getRefUserSubGroupMemberships().child(userID + '/' + groupID + '/' + subgroupID);
                        userMembershipRef.once("value", function(snapshotMem) { //
                            var membershipData = snapshotMem.val();
                            if (membershipData) {
                                if (membershipData["membership-type"] == 1) {
                                    deferred.reject("User is already an owner of this team of teams");
                                } else if (membershipData["membership-type"] == 2) {
                                    deferred.reject("User is already a admin of this team of teams");
                                }
                                //else if (membershipData["membership-type"] == 0) {
                                //    deferred.reject("Membership request is already pending for this group");
                                //}
                                else {
                                    deferred.reject("User is already a member of this team of teams");
                                }

                            } else {
                                //Step : check to see if already a request sent
                                var ref = firebaseService.getRefSubgroupMembershipRequests().child(groupID + '/' + subgroupID + '/' + userID);
                                ref.once("value", function(snap) {
                                    var alreadyPending = snap.val();
                                    if (alreadyPending) {
                                        deferred.reject("Request is already pending for this team"); //just to double check here also, but no need if data is consistent
                                    } else {
                                        //step : setting request for membership "subgroup-membership-requests"
                                        ref.set({
                                            timestamp: firebaseTimeStamp,
                                            message: message
                                        }, function(error) {
                                            if (error) {
                                                deferred.reject("Server Error, please try again");
                                            } else {
                                                ref.once("value", function(snapshot) {
                                                    var timestamp = snapshot.val()["timestamp"]; //to get the server time
                                                    var refByUser = firebaseService.getRefSubgroupMembershipRequestsByUser().child(userID + '/' + groupID + '/' + subgroupID);
                                                    // /Step 4 add to pending by user
                                                    refByUser.set({
                                                        timestamp: timestamp
                                                    }, function(error) {
                                                        if (error) {
                                                            //roll back previous may be
                                                            deferred.reject("Server Error, please try again");
                                                        } else {
                                                            deferred.resolve();
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        //}
                        //});

                        return deferred.promise;
                    }
                    //,   userExists: function(userID){
                    //     firebaseService.getRefUsers().child(userID).once(function(snapshot){
                    //         console.log(snapshot)
                    //         if(snapshot){
                    //             return true;
                    //         } else {
                    //             return false;
                    //         }
                    //     })
                    // }
            }
        }
    ]);

 /**
 * Created by ZiaKhan on 03/02/15.
 */

'use strict';


angular.module('core')
    .factory('groupFirebaseService', ['$rootScope', 'activityStreamService', "firebaseService", "$q", "$timeout", 'userFirebaseService', 'checkinService', 'confirmDialogService', "$firebaseObject", "userPresenceService",
        function($rootScope, activityStreamService, firebaseService, $q, $timeout, userFirebaseService, checkinService, confirmDialogService, $firebaseObject, userPresenceService) {

            /*var syncObj = {
                subgroupsSyncArray: [],
                membersSyncArray: [],
                pendingMembershipSyncArray: [],
                activitiesSyncArray: []
            };*/
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;


            return {
                getGroupSyncObjAsync: function(groupID, viewerUserID) {
                    var deferred = $q.defer();
                    var self = this;
                    var syncObj = {
                        subgroupsSyncArray: [],
                        membersSyncArray: [],
                        pendingMembershipSyncArray: [],
                        activitiesSyncArray: []
                    };
                    syncObj.self = this;
                    syncObj.viewerUserID = viewerUserID;
                    syncObj.groupID = groupID;
                    syncObj.userGroupMembershipRef = firebaseService.getRefUserGroupMemberships().child(viewerUserID).child(groupID);
                    syncObj.groupSyncObj = $firebaseObject(firebaseService.getRefGroups().child(groupID));
                    syncObj.userGroupMembershipRef.once("value", function(snapshot) {
                        if (snapshot.val()) {

                            syncObj.membershipType = snapshot.val()["membership-type"];
                            syncObj.timestamp = snapshot.val()["timestamp"];
                            syncObj.userGroupMembershipRef.on("child_changed", self.membershipChanged, syncObj);
                            syncObj.userGroupMembershipRef.on("child_removed", self.membershipDeleted, syncObj);
                            self.addListeners(syncObj);
                        } else {
                            syncObj.membershipType = -100; //right now not a member
                            //listen to if membership added later
                            firebaseService.getRefUserGroupMemberships().on("child_added", self.membershipAddedLater, syncObj);
                        }

                        deferred.resolve(syncObj);
                    });


                    return deferred.promise;
                },
                addListeners: function(syncObj) {
                    if (syncObj.membershipType >= 1) {
                        syncObj.subgroupRef = this.syncSubgroups(syncObj.groupID, syncObj.subgroupsSyncArray, syncObj);
                        syncObj.groupMembershipRef = syncObj.self.syncGroupMembers(syncObj.groupID, syncObj.membersSyncArray, syncObj);
                        syncObj.groupActivitiesRef = syncObj.self.syncGroupActivities(syncObj.groupID, syncObj.activitiesSyncArray, syncObj);
                    }

                    if (syncObj.membershipType == 1 || syncObj.membershipType == 2) {
                        syncObj.groupPendingMembershipRequestsRef = syncObj.self.syncGroupPendingMembershipRequests(syncObj.groupID, syncObj.pendingMembershipSyncArray, syncObj);
                    }
                },
                membershipAddedLater: function(snapshot) {
                    if (this.groupID == snapshot.key()) { //has become a member now
                        this.membershipType = snapshot.val()["membership-type"];
                        this.timestamp = snapshot.val()["timestamp"];
                        this.userGroupMembershipRef.on("child_changed", this.self.membershipChanged, this);
                        this.userGroupMembershipRef.on("child_removed", this.self.membershipDeleted, this);
                        this.self.addListeners(this);
                    }
                },
                membershipChanged: function(snapshot) {
                    var newMembershipType = snapshot.val();
                    if (newMembershipType != this.membershipType) { //membership type has changed
                        if (this.membershipType == 3) { //previously was a member
                            if (newMembershipType == 2) { //now a admin
                                this.groupPendingMembershipRequestsRef = this.self.syncGroupPendingMembershipRequests(this.groupID, this.pendingMembershipSyncArray, this);
                            } else if (newMembershipType == -1) { //has been suspended
                                this.self.removeConfidentialGroupData.call(this, this.groupID);
                            }
                        }

                        if (this.membershipType == 2) { //previously was a admin
                            if (newMembershipType == 3) { //now a member only
                                if (this.groupPendingMembershipRequestsRef) {
                                    this.groupPendingMembershipRequestsRef.off("child_added", this.self.groupMembershipRequestAdded, this.pendingMembershipSyncArray);
                                    this.groupPendingMembershipRequestsRef.off("child_removed", this.self.groupMembershipRequestDeleted, this.pendingMembershipSyncArray);
                                }

                                while (this.pendingMembershipSyncArray.length > 0) { //empty pending
                                    this.pendingMembershipSyncArray.pop();
                                }

                            } else if (newMembershipType == -1) { //has been suspended
                                this.self.removeConfidentialGroupData.call(this, this.groupID);
                            }
                        }
                        this.membershipType = newMembershipType;
                    }
                },
                removeConfidentialGroupData: function(groupIDMembershipDeleted) {
                    if (this.groupID == groupIDMembershipDeleted) { //group membership deleted which logged-in-user was viewing
                        this.membershipType = -100;
                        this.timestamp = undefined;

                        if (this.userGroupMembershipRef) {
                            this.userGroupMembershipRef.off("child_changed", this.self.membershipChanged, this);
                            this.userGroupMembershipRef.off("child_removed", this.self.membershipDeleted, this);
                        }

                        if (this.subgroupRef) {
                            if (this.subgroupsRefContext) {
                                this.subgroupRef.off('child_added', this.self.groupUserMembershipAdded, this.subgroupsRefContext);
                            }

                            this.subgroupRef.off('child_removed', this.self.groupUserMembershipAdded, this.subgroupsArray);
                        }

                        if (this.subgroupsRefContext) {
                            this.subgroupsRefContext.subgroupsMembershipRef.off('child_added', this.self.subgroupsAdded, this.subgroupsRefContext);
                            this.subgroupsRefContext.subgroupsMembershipRef.off('child_removed', this.self.subgroupsDeleted, this.subgroupsRefContext);
                        }

                        if (this.groupMembershipRef) {
                            this.groupMembershipRef.off('child_added', this.self.groupUserMembershipAdded, this.membersSyncArray);
                            this.groupMembershipRef.off('child_changed', this.self.groupUserMembershipChanged, this.membersSyncArray);
                            this.groupMembershipRef.off('child_removed', this.self.groupUserMembershipDeleted, this.membersSyncArray);
                        }

                        if (this.groupActivitiesRef) {
                            this.groupActivitiesRef.off("child_added", this.self.groupActivityAdded, this.activitiesSyncArray);
                        }

                        if (this.groupPendingMembershipRequestsRef) {
                            this.groupPendingMembershipRequestsRef.off("child_added", this.self.groupMembershipRequestAdded, this.pendingMembershipSyncArray);
                            this.groupPendingMembershipRequestsRef.off("child_removed", this.self.groupMembershipRequestDeleted, this.pendingMembershipSyncArray);
                        }

                        while (this.subgroupsSyncArray.length > 0) { //empty teams
                            this.subgroupsSyncArray.pop();
                        }
                        while (this.membersSyncArray.length > 0) { //empty members
                            this.membersSyncArray.pop();
                        }
                        while (this.pendingMembershipSyncArray.length > 0) { //empty pending
                            this.pendingMembershipSyncArray.pop();
                        }
                        while (this.activitiesSyncArray.length > 0) { //empty activities
                            this.activitiesSyncArray.pop();
                        }

                    }
                },
                membershipDeleted: function(snapshot) { //is no longer a member
                    var groupIDMembershipDeleted = snapshot.key();
                    this.self.removeConfidentialGroupData.call(this, groupIDMembershipDeleted);

                },
                syncSubgroups: function(groupID, subgroupsArray, syncObj) {
                    var subgroupsRef = firebaseService.getRefSubGroups().child(groupID);
                    var subgroupsMembershipRef = firebaseService.getRefUserSubGroupMemberships().child(syncObj.viewerUserID).child(groupID);

                    syncObj.subgroupsRefContext = {
                        subgroupsMembershipRef: subgroupsMembershipRef,
                        subgroupRef: subgroupsRef,
                        subgroupsArray: subgroupsArray
                    };

                    subgroupsMembershipRef.on('child_added', this.subgroupsAdded, syncObj.subgroupsRefContext);
                    subgroupsMembershipRef.on('child_removed', this.subgroupsDeleted, syncObj.subgroupsRefContext);
                    return subgroupsRef;
                },
                subgroupsAdded: function(snapshot) {
                    var self = this;
                    var subgroupSyncObj = $firebaseObject(this.subgroupRef.child(snapshot.key()));
                    $timeout(function() {
                        self.subgroupsArray.push(subgroupSyncObj);
                    });
                },
                subgroupsDeleted: function(snapshot) {
                    var self = this;
                    var subgroupID = snapshot.key();
                    this.subgroupsArray.forEach(function(obj, i) {
                        if (obj.$id == subgroupID) {
                            $timeout(function() {
                                self.subgroupsArray.splice(i, 1);
                            });
                        }
                    });
                },
                syncGroupMembers: function(groupID, memberArray) {
                    var ref = firebaseService.getRefGroupMembers().child(groupID);
                    ref.on('child_added', this.groupUserMembershipAdded, memberArray);
                    ref.on('child_changed', this.groupUserMembershipChanged, memberArray);
                    ref.on('child_removed', this.groupUserMembershipDeleted, memberArray);
                    return ref;
                },
                groupUserMembershipAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            membershipType: snapshot.val()["membership-type"],
                            timestamp: snapshot.val()["timestamp"],
                            membershipNo: snapshot.getPriority(),
                            userSyncObj: userSyncObj,
                            //FIXME when implementing in client2 , eliminate userSyncObj to avoid duplicate listeners.
                            user: userPresenceService.getUserSyncObject(snapshot.key())
                        });
                    });
                },
                groupUserMembershipChanged: function(snapshot) {
                    var userID = snapshot.key();
                    var membershipObj = snapshot.val();
                    this.forEach(function(obj) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                obj.membershipType = membershipObj["membership-type"];
                            });
                        }
                    });
                },
                groupUserMembershipDeleted: function(snapshot) {
                    var self = this;
                    var userID = snapshot.key();
                    this.forEach(function(obj, i) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                self.splice(i, 1);
                            });
                        }
                    });
                },
                syncGroupActivities: function(groupID, activitiesSyncArray) {
                    var ref = firebaseService.getRefGroupsActivityStreams().child(groupID).orderByPriority();
                    ref.on("child_added", this.groupActivityAdded, activitiesSyncArray);
                    return ref;
                },
                groupActivityAdded: function(snapshot) {
                    var self = this;
                    var activity = snapshot.val();
                    $timeout(function() {
                        if (activity) {
                            self.push(activity);
                        }
                    });
                },
                syncGroupPendingMembershipRequests: function(groupID, pendingMembershipSyncArray) {
                    var ref = firebaseService.getRefGroupMembershipRequests().child(groupID);
                    ref.on("child_added", this.groupMembershipRequestAdded, pendingMembershipSyncArray);
                    ref.on("child_removed", this.groupMembershipRequestDeleted, pendingMembershipSyncArray);
                    return ref;
                },
                groupMembershipRequestAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            message: snapshot.val()["message"],
                            timestamp: snapshot.val()["timestamp"],
                            "teamrequest": snapshot.val()["team-request"],
                            "membershipNo": snapshot.val()["membershipNo"],
                            userSyncObj: userSyncObj
                        });
                    });
                },
                groupMembershipRequestDeleted: function(snapshot) {
                    var self = this;
                    var userID = snapshot.key();
                    this.forEach(function(obj, i) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                self.splice(i, 1);
                            });
                        }
                    });
                },
                asyncCreateSubgroup: function(userID, group, subgroupInfo, subgroupList) {

                    /* NODES TO HIT FOR CREATING SUBGROUPS:
                     subgroup-members
                     user-subgroup-memberships
                     subgroup-names
                     subgroups
                     subgroup-activity-streams
                     */

                    var self = this;
                    var deferred = $q.defer();
                    var subgroupExist = false;
                    var errorHandler = function(reason) {
                        deferred.reject(reason || "Subgroup creation failed. error occurred in accessing server.");
                    };

                    //Step 1: check if subgroup does not exist
                    subgroupList.forEach(function(subgroup) {
                        if (subgroup.subgroupID == subgroupInfo.subgroupID) {
                            errorHandler("Subgroup not created, " + subgroupInfo.subgroupID + " already exists"); //subgroup ID already exists
                            subgroupExist = true;
                        }
                    });

                    if (subgroupExist) {
                        return deferred.promise;
                    }

                    //step : create an entry for "subgroup-members"
                    self.asyncCreateSubGroupMembersJSON(userID, subgroupInfo.members)
                        .then(function(response) {
                            var memRef = firebaseService.getRefSubGroupMembers().child(group.$id).child(subgroupInfo.subgroupID);
                            var mems = response.memberJSON;
                            //if(response.members.length != 0) { //by default admin is included in membersJSON of subgroup.

                            //step : create subgroup members
                            memRef.set(mems, function(error) {
                                if (error) {
                                    //roleback previous
                                    errorHandler();
                                } else {
                                    var subgroupNames = {title: subgroupInfo.title, subgroupImgUrl: subgroupInfo.imgLogoUrl || '', ownerImgUrl: $rootScope.userImg || ''};
                                    // step: create and entry for "subgroups-names"
                                    var groupNameRef = firebaseService.getRefSubGroupsNames().child(group.$id).child(subgroupInfo.subgroupID);
                                    groupNameRef.set(subgroupNames,  function(error) {
                                        if (error) {
                                            deferred.reject();
                                            //role back previous
                                        } else {
                                            //step: create an entry for "user-subgroup-memberships"
                                            self.asyncCreateUserSubgroupMemberships(group.$id, subgroupInfo.subgroupID, mems)
                                                .then(function() {
                                                    firebaseService.getRefGroups().child(group.$id).once('value', function(snapshot) {
                                                        var countsubgroup = snapshot.val()["subgroups-count"] + 1;
                                                        // console.log(countsubgroup, 'testing')
                                                        firebaseService.getRefGroups().child(group.$id).child('subgroups-count').set(countsubgroup, function() {
                                                            if (error) {
                                                                errorHandler();
                                                            }
                                                        });
                                                    });
                                                    // console.log($rootScope.userImg)

                                                    //save in subgroup-policies for Policies
                                                    firebaseService.getRefSubgroupPolicies().child(group.$id).child(subgroupInfo.subgroupID).set({'hasPolicy': false, 'policyID': '', 'subgroup-title': subgroupInfo.title, 'policy-title': ''});

                                                    //step : create an entry for "subgroups"
                                                    var subgroupRef = firebaseService.getRefSubGroups().child(group.$id).child(subgroupInfo.subgroupID);
                                                    subgroupRef.set({
                                                        title: subgroupInfo.title,
                                                        desc: subgroupInfo.desc,
                                                        timestamp: firebaseTimeStamp,
                                                        "members-count": response.membersCount,
                                                        "microgroups-count": 0,
                                                       "members-checked-in": {
                                                            "count": 0
                                                        },
                                                        'logo-image': {
                                                            url: subgroupInfo.imgLogoUrl || '', // pID is going to be changed with userID for single profile picture only
                                                            id: subgroupInfo.subgroupID,
                                                            'bucket-name': 'test2pwow',
                                                            source: 1, // 1 = google cloud storage
                                                            mediaType: 'image/png' //image/jpeg
                                                        },
                                                        'subgroup-owner-id': userID,
                                                        'owner-img-url': $rootScope.userImg || ''
                                                    }, function(error) {
                                                        if (error) {
                                                            //role back previous
                                                            errorHandler();
                                                        } else {
                                                            // creating flattened-groups data in firebase

                                                            var qArray = [];
                                                            var qArray2 = [];
                                                            var deffer = $q.defer();
                                                            deffer.promise
                                                                .then(function(dataArrofArr) {

                                                                    // dataArrofArr.forEach(function(arr) {
                                                                    //     if (arr[1].type == 1) {
                                                                    //         arr[0].checkedin = true
                                                                    //     } else {
                                                                    //         arr[0].checkedin = false
                                                                    //     }
                                                                    //     qArray2.push(arr[0].$save())
                                                                    // });
                                                                    // return $q.all(qArray2)
                                                                })
                                                                .then(function() {
                                                                    deferred.resolve({
                                                                        unlistedMembersArray: response.unlisted
                                                                    });
                                                                    //step  : entry for "subgroup-activity-streams"
                                                                    //                                                            debugger;

                                                                    //self.asyncRecordSubgroupCreationActivity($localStorage.loggedInUser, group, subgroupInfo).then(function () {
                                                                    //    if (response.members.length == 1) {
                                                                    //        //self.asyncRecordSubgroupMemberAdditionActivity($sessionStorage.loggedInUser, group, subgroupInfo, response.members[0])
                                                                    //        self.asyncRecordSubgroupMemberAdditionActivity($localStorage.loggedInUser, group, subgroupInfo, response.members[0])
                                                                    //            .then(function () {
                                                                    //                deferred.resolve({unlistedMembersArray: response.unlisted});
                                                                    //            });
                                                                    //    }
                                                                    //    else if (response.members.length > 1) {
                                                                    //        //self.asyncRecordManySubgroupsMembersAdditionActivity($sessionStorage.loggedInUser, group, subgroupInfo, response.members)
                                                                    //        self.asyncRecordManySubgroupsMembersAdditionActivity($localStorage.loggedInUser, group, subgroupInfo, response.members)
                                                                    //            .then(function () {
                                                                    //                deferred.resolve({unlistedMembersArray: response.unlisted});
                                                                    //            });
                                                                    //    }
                                                                    //    else {
                                                                    //        deferred.resolve({unlistedMembersArray: response.unlisted});
                                                                    //    }
                                                                    //});

                                                                })
                                                                .catch(function(d) {
                                                                    //debugger;
                                                                });
                                                            // for (var member in mems) {
                                                            //
                                                            //     var temp = $firebaseObject(firebaseService.getRefFlattendGroups().child(userID).child(group.$id + "_" + subgroupInfo.subgroupID).child(member))
                                                            //         .$loaded()
                                                            //
                                                            //     var temp1 = $firebaseObject(checkinService.getRefSubgroupCheckinCurrentByUser().child(member)).$loaded()
                                                            //
                                                            //     qArray.push($q.all([temp, temp1]))
                                                            //
                                                            //
                                                            // }
                                                            //deffer.resolve($q.all(qArray))
                                                            deffer.resolve('');

                                                        }
                                                    });

                                                }, errorHandler);
                                        }
                                    });


                                }
                            });
                        });

                    return deferred.promise;
                },
                asyncCreateSubGroupMembersJSON: function(ownerUserID, listStr, existingMembersObj) {
                    /*
                    @param ownerUserID // 'ownerid'
                    @param listStr // 'userid1,userid2'
                    @param existingMembersObj // { userid1 : {}, userid2: {}}

                    @return memberJSON {object} {
                     userId1: {
                          memberhsip-type: 1, // members
                          timestamp: timestamp
                       },
                     userid2 : {
                         memberhsip-type: 3, // members
                         timestamp: timestamp
                     }
                     }

                       */

                    var deferred = $q.defer();

                    var groupMembersJSON = {};
                    var unlistedMembers = [];
                    var members = [];

                    //this time we are including ownerid in membersJSON with membership-type: 1. unlike groupmemberJSON method
                    groupMembersJSON[ownerUserID] = {
                        "membership-type": 1, //1 means owner, 2 will mean admin, 3 means member only
                        timestamp: firebaseTimeStamp
                    };

                    if (listStr.length < 2) {
                        deferred.resolve({
                            memberJSON: groupMembersJSON,
                            unlisted: unlistedMembers,
                            members: members,
                            membersCount: 1
                        });
                    } else {
                        existingMembersObj = existingMembersObj || {};

                        var memberArray = listStr.split(",");
                        var promises = [];

                        memberArray.forEach(function(val, i) {
                            val = val.trim();
                            var promise = firebaseService.asyncCheckIfUserExists(val);
                            promise.then(function(response) {
                                if (response.exists) {
                                    /*check if requested userID is :
                                     * a valid user,
                                     * has not already been added to members list of group (if updating members list) */
                                    if (val != ownerUserID && !existingMembersObj[val]) {
                                        groupMembersJSON[val] = {
                                            "membership-type": 3, //1 means owner, 2 will mean admin, 3 means member only
                                            timestamp: firebaseTimeStamp
                                        };
                                        members.push(val);
                                        //}
                                    } else {
                                        unlistedMembers.push(val);
                                    }
                                } else {
                                    unlistedMembers.push(val);
                                }
                            });

                            promises.push(promise);
                        });

                        $q.all(promises).then(function() {
                            deferred.resolve({
                                memberJSON: groupMembersJSON,
                                membersCount: memberArray.length,
                                unlisted: unlistedMembers,
                                members: members
                            });
                        }, function() {
                            deferred.reject();
                        });
                    }

                    return deferred.promise;
                },
                asyncCreateUserSubgroupMemberships: function(groupID, subGroupID, memberJSONObj) {
                    var defer = $q.defer();
                    var promise;
                    var promises = [];
                    var userSubgroupMembershipRef = firebaseService.getRefUserSubGroupMemberships();

                    angular.forEach(memberJSONObj, function(membershipObj, memberID) {
                        promise = $q.defer();

                        userSubgroupMembershipRef.child(memberID + '/' + groupID + '/' + subGroupID)
                            .set(membershipObj, function(err) {
                                if (err) {
                                    promise.reject();
                                } else {
                                    promise.resolve();
                                }
                            });

                        promises.push(promise);
                    });

                    $q.all(promises).then(function() {
                        defer.resolve();
                    }, function() {
                        defer.reject();
                    });

                    return defer.promise;
                },
                asyncCreateGroupMembersJSON: function(ownerUserID, groupMemberList, listStr) {
                    var self = this;
                    var deferred = $q.defer();
                    var subgroupMembersJSON = {};

                    var unlistedMembers = [];
                    var members = [];

                    if (listStr.length < 2) {
                        deferred.resolve({
                            memberJSON: subgroupMembersJSON,
                            unlisted: unlistedMembers,
                            members: members
                        });
                    } else {
                        var memberArray = listStr.split(",");
                        var promises = [];
                        memberArray.forEach(function(val, i) {
                            val = val.trim();
                            var promise = firebaseService.asyncCheckIfUserExists(val);
                            promise.then(function(response) {
                                if (response.exists) {
                                    if (val != ownerUserID) {
                                        var added = false;
                                        groupMemberList.forEach(function(memberVal) {
                                            if (memberVal.userID == val) { //user must be member of the parent group
                                                var key = val;
                                                subgroupMembersJSON[key] = {
                                                    "membership-type": 3,
                                                    timestamp: firebaseTimeStamp
                                                }; //1 means member only, 2 will mean admin
                                                members.push(val);
                                                added = true;
                                            }
                                        });

                                        if (!added) {
                                            unlistedMembers.push(val);
                                        }
                                    } else {
                                        unlistedMembers.push(val);
                                    }
                                } else {
                                    unlistedMembers.push(val);
                                }
                            });

                            promises.push(promise);
                        });

                        $q.all(promises).then(function() {
                            deferred.resolve({
                                memberJSON: subgroupMembersJSON,
                                unlisted: unlistedMembers,
                                members: members
                            });
                        }, function() {
                            deferred.reject();
                        });
                    }

                    return deferred.promise;
                },
                asyncRecordSubgroupCreationActivity: function(user, group, subgroup) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(group.$id).child(subgroup.subgroupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var object = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID, //an index should be set on this
                        "url": group.$id + "/" + subgroup.subgroupID,
                        "displayName": subgroup.title
                    };

                    var target = {
                        "type": "group",
                        "id": group.$id, //an index should be set on this
                        "url": group.$id,
                        "displayName": group.title
                    };

                    var activity = {
                        language: "en",
                        verb: "subgroup-creation",
                        published: firebaseTimeStamp,
                        displayName: actor.displayName + " created " + subgroup.title + " in " + group.title,
                        actor: actor,
                        object: object,
                        target: target
                    };

                    var newActivityRef = ref.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {

                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = ref.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {

                                    } else {
                                        deferred.resolve();
                                    }
                                });
                            });


                        }
                    });

                    return deferred.promise;
                },
                asyncRecordSubgroupMemberAdditionActivity: function(user, group, subgroup, memberUserID) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(group.$id).child(subgroup.subgroupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID,
                        "url": group.$id + "/" + subgroup.subgroupID,
                        "displayName": subgroup.title,
                        "parent": {
                            "type": "group",
                            "id": group.$id,
                            "displayName": group.title,
                            "url": group.$id
                        }
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };

                        var activity = {
                            language: "en",
                            verb: "subgroup-added-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added " + object.displayName + " as a member in " + subgroup.title,
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {

                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {

                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordManySubgroupsMembersAdditionActivity: function(user, group, subgroup, membersArray) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(group.$id).child(subgroup.subgroupID);
                    var self = this;
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var object = {
                        "type": "UserCollection",
                        "totalItems": membersArray.length,
                        "items": {}
                    };

                    var target = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID,
                        "url": group.$id + "/" + subgroup.subgroupID,
                        "displayName": subgroup.title,
                        "parent": {
                            "type": "group",
                            "id": group.$id,
                            "displayName": group.title,
                            "url": group.$id
                        }

                    };

                    var promiseArray = [];
                    membersArray.forEach(function(m) {
                        promiseArray.push(firebaseService.asyncCheckIfUserExists(m));
                    });

                    $q.all(promiseArray).then(function(values) {
                        values.forEach(function(v) {
                            object.items[v.userID] = {
                                "verb": "subgroup-added-member",
                                "object": {
                                    "type": "user",
                                    "id": v.userID,
                                    "email": v.user.email,
                                    "displayName": v.user.firstName + " " + v.user.lastName
                                }
                            };
                        });


                        var activity = {
                            language: "en",
                            verb: "subgroup-added-many-members",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added members to " + subgroup.title + " team",
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {

                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {

                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                            }
                        });
                    });

                    return deferred.promise;
                },
                asyncUpdateGroupMembers: function(loggedInUserObj, groupObj, requestedMembersList, groupExistingMembersArray) {
                    var deferred = $q.defer();

                    //create an object from membersSyncArray.
                    var groupExistingMembersObj = {};
                    angular.forEach(groupExistingMembersArray, function(memberObj) {
                        groupExistingMembersObj[memberObj.userID] = true;
                    });

                    userFirebaseService.asyncCreateGroupMembersJSON(loggedInUserObj.userID, requestedMembersList, groupExistingMembersObj)
                        .then(function(response) {

                            var promises = [];

                            //Add group to each user
                            var promise;
                            var memArray = response.members;
                            memArray.forEach(function(memberID) {
                                promise = userFirebaseService.asyncAddUserMembership(memberID, groupObj.groupID, 3);
                                promises.push(promise);
                            });

                            //Add membersJSON to given group
                            var addMembersToGroupDefer = $q.defer();
                            firebaseService.getRefGroupMembers().child(groupObj.groupID).update(response.memberJSON, function(err) {
                                if (err) {
                                    //handle this scenario
                                    // console.log('adding membersJSON to group failed', err);
                                } else {
                                    addMembersToGroupDefer.resolve();
                                }
                            });

                            promises.push(addMembersToGroupDefer.promise);

                            $q.all(promises).then(function() {
                                var memberCountRef = firebaseService.getRefGroups().child(groupObj.groupID + '/' + 'members-count');
                                memberCountRef.transaction(function(currentValue) {
                                    return (currentValue || 0) + memArray.length;
                                });

                                if (memArray.length == 1) {
                                    userFirebaseService.asyncRecordGroupMemberAdditionActivity(groupObj, loggedInUserObj, response.members[0])
                                        .then(function() {
                                            deferred.resolve({
                                                unlistedMembersArray: response.unlisted
                                            });
                                        })
                                } else if (memArray.length > 1) {
                                    userFirebaseService.asyncRecordManyGroupMembersAdditionActivity(groupObj, loggedInUserObj, response.members)
                                        .then(function() {
                                            deferred.resolve({
                                                unlistedMembersArray: response.unlisted
                                            });
                                        });
                                } else {
                                    deferred.resolve({
                                        unlistedMembersArray: response.unlisted
                                    });
                                }
                            });

                        }, function() {
                            deferred.reject();
                        });

                    return deferred.promise;
                },
                addsubgroupmember: function(userID, groupID, subgroupID){
                    var defer = $q.defer();
                    var count = 0;
                    firebaseService.getRefMain().child('subgroups').child(groupID).child(subgroupID).child('members-count').once('value', function(snapshot){
                        count = snapshot.val();
                    })
                    var multipath = {};
                    multipath["user-subgroup-memberships/" + userID + "/" + groupID + "/" + subgroupID] = {
                        "membership-type": 3,
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    };
                    multipath["subgroup-members/" + groupID + "/" + subgroupID + "/" + userID] = {
                        "membership-type": 3,
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    }
                    multipath["subgroups/" + groupID + "/" + subgroupID + "/members-count"] = count + 1;
                    multipath["subgroups/" + groupID + "/" + subgroupID + "/timestamp"] = Firebase.ServerValue.TIMESTAMP;
                    firebaseService.getRefMain().update(multipath, function(err){
                        if (err) {
                            defer.reject(err);
                        } else {
                            defer.resolve();
                        }
                    })
                    return defer.promise;
                },
                approveMembership: function(groupID, loggedInUserObj, requestedMember, groupObj) {
                    var defer, userID, membershipType,
                        userMembershipObj, errorHandler;

                    defer = $q.defer();
                    membershipType = 3; //for members only, should be dynamic when make admin feature added.
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    userMembershipObj = {};
                    userMembershipObj[userID] = {
                        'membership-type': membershipType,
                        timestamp: firebaseTimeStamp
                    };

                    //add user to group-membership list
                    firebaseService.getRefGroupMembers().child(groupID)
                        .update(userMembershipObj, function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                if (requestedMember.membershipNo) {
                                    firebaseService.getRefGroupMembers().child(groupID).child(userID).setPriority(requestedMember.membershipNo);
                                }
                                //step1: change membership-type of user in user-membership list
                                firebaseService.getRefUserGroupMemberships().child(userID + '/' + groupID)
                                    .set(userMembershipObj[userID], function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            //step2: delete user request from group-membership-requests
                                            firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                                .remove(function(err) {
                                                    var groupCountRef;
                                                    if (err) {
                                                        errorHandler();
                                                    } else {
                                                        //step3: set members count in meta-data of group
                                                        groupCountRef = firebaseService.getRefGroups().child(groupID + '/members-count');
                                                        groupCountRef.once('value', function(snapshot) {
                                                            var membersCount = snapshot.val();
                                                            membersCount = (membersCount || 0) + 1;
                                                            groupCountRef.set(membersCount, function(err) {
                                                                if (err) {
                                                                    errorHandler();
                                                                } else {

                                                                    //publish an activity stream record -- START --
                                                                    var type = 'group';
                                                                    var targetinfo = {id: groupID, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                                                    var area = {type: 'membersettings', action: 'group-approve-member'};
                                                                    var group_id = groupID;
                                                                    var memberuserID = userID;
                                                                    //for group activity record
                                                                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                                                    //for group activity stream record -- END --
                                                                    defer.resolve();
                                                                    // //step4: publish an activity
                                                                    // firebaseService.getRefGroups().child(groupID).once('value', function(snapshot) {
                                                                    //         var groupObj = snapshot.val();
                                                                    //         groupObj.groupID = groupID;
                                                                    //         userFirebaseService.asyncRecordGroupMemberApproveRejectActivity('approve', groupObj, loggedInUserObj, userID)
                                                                    //             .then(function(res) {
                                                                    //                 defer.resolve(res);
                                                                    //             }, errorHandler);
                                                                    //     });
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                rejectMembership: function(groupID, loggedInUserObj, requestedMember, groupObj) {
                    var defer, userID,
                        errorHandler;
                    defer = $q.defer();
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    //step1: delete group membership request from user-membership list
                    //firebaseService.getRefUserGroupMemberships().child(userID + '/' + groupID)
                        //.remove(function(err) {
                        //    if (err) {
                        //        errorHandler();
                        //    } else {
                                //step2: delete user request from group-membership-requests
                                firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                    .remove(function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {

                                            //publish an activity stream record -- START --
                                            var type = 'group';
                                            var targetinfo = {id: groupID, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                            var area = {type: 'membersettings', action: 'group-ignore-member'};
                                            var group_id = groupID;
                                            var memberuserID = userID;
                                            //for group activity record
                                            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                            //for group activity stream record -- END --

                                            // //step3: publish an activity
                                            // firebaseService.getRefGroups().child(groupID).once('value', function(snapshot) {
                                            //         var groupObj = snapshot.val();
                                            //         groupObj.groupID = groupID;
                                            //         userFirebaseService.asyncRecordGroupMemberApproveRejectActivity('reject', groupObj, loggedInUserObj, userID)
                                            //             .then(function(res) {
                                            //                 defer.resolve(res);
                                            //             }, errorHandler);
                                            //     });
                                        }
                                    });
                        //    }
                        //});

                    return defer.promise;
                },
                changeMemberRole: function(newType, member, groupObj, loggedInUser) {
                    var defer, self, prevType,
                        errorHandler;

                    defer = $q.defer();
                    self = this;
                    prevType = member.membershipType;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    if (newType) {
                        //update membership type in user memberships
                        userFirebaseService.asyncAddUserMembership(member.userSyncObj.$id, groupObj.$id, newType)
                            .then(function() {
                                var userMem = {};
                                userMem[member.userSyncObj.$id] = {
                                    'membership-type': newType,
                                    timestamp: firebaseTimeStamp
                                };

                                //update membership type in group memberships
                                firebaseService.getRefGroupMembers().child(groupObj.$id)
                                    .update(userMem, function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {

                                            //type: '2' is Admin, '3' is Member, '-1' is block, 'null' is delete membership for this group
                                            var typeAction = { '2': 'user-membership-from-member-to-admin', '3': 'user-membership-from-admin-to-member', '-1': 'user-membership-block', '4': 'user-membership-unblock' };

                                            //incase from block to member (we check prevType, if block then allow to be member)
                                            if(prevType == '-1'){
                                                newType = '4';
                                            }

                                            //for group activity stream record -- START --
                                            var type = 'group';
                                            var targetinfo = {id: groupObj.$id, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                            var area = {type: 'membersettings', action: (newType) ? typeAction[newType] : 'group-member-removed'};
                                            var group_id = groupObj.$id;
                                            var memberuserID = member.userID;
                                            //for group activity record
                                            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                            //for group activity stream record -- END --

                                            // if create admin of group then add subgroups admin of that group -- START
                                            // if create admin of group then add subgroups admin of that group -- END
                                            if (newType === 2) {
                                                var subgroups = activityStreamService.getSubgroupsOfGroup();
                                                console.log('subgroups', subgroups[groupObj.$id]);
                                                if (subgroups[groupObj.$id] || subgroups[groupObj.$id].length > 0){
                                                    subgroups[groupObj.$id].forEach(function(val,index){
                                                        self.addRemoveAdminOfGroup(groupObj.$id, val, member.userSyncObj.$id, newType);
                                                    });
                                                }    
                                            } else {
                                                var subgroups = activityStreamService.getSubgroupsOfGroup();
                                                if (subgroups[groupObj.$id] || subgroups[groupObj.$id].length > 0) {
                                                    subgroups[groupObj.$id].forEach(function (val, index) {
                                                        self.addRemoveAdminOfGroup(groupObj.$id, val, member.userSyncObj.$id, null);
                                                    });
                                                }    
                                            }

                                            defer.resolve();

                                            // //publish an activity for membership changed.
                                            // userFirebaseService.asyncRecordMembershipChangeActivity(prevType, newType, member.userSyncObj, groupObj, loggedInUser)
                                            //     .then(function(res) {
                                            //         defer.resolve(res);
                                            //     }, errorHandler);
                                        }
                                    });

                            }, errorHandler);

                    } else {
                        self.asyncRemoveUserFromGroup(member.userSyncObj.$id, groupObj.$id)
                            .then(function() {

                                //if newType is null for Delete Member..........
                                //for group activity stream record -- START --
                                var type = 'group';
                                var targetinfo = {id: groupObj.$id, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                var area = {type: 'membersettings', action: 'group-member-removed'};
                                var group_id = groupObj.$id;
                                var memberuserID = member.userID;
                                //for group activity record
                                activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                //for group activity stream record -- END --

                                defer.resolve();

                                //publish an activity for group-member-removed.
                                // userFirebaseService.asyncRecordMemberRemoved(prevType, newType, member.userSyncObj, groupObj, loggedInUser)
                                //     .then(function(res) {
                                //         defer.resolve(res);
                                //     }, errorHandler);

                            }, errorHandler);
                        /* confirmDialogService('Are you sure to remove this user ?')
                             .then(function () {
                                 //remove user from group

                             }, function() {
                                 defer.reject('Cancelled removing user.');
                             });*/
                    }

                    return defer.promise;
                },
                asyncRemoveUserFromGroup: function(memberID, groupID) {
                    var defer, self,
                        errorHandler;

                    self = this;
                    defer = $q.defer();
                    errorHandler = function() {
                        defer.reject('Error occurred in accessing server.')
                    };

                    self.asyncRemoveUserCheckin(memberID, groupID)
                        .then(function(res) {
                            self.asyncUpdateGroupDataForRemoveUser(res, groupID)
                                .then(function() {
                                    self.asyncRemoveUserMembership(memberID, groupID)
                                        .then(function() {
                                            defer.resolve();
                                        }, errorHandler);
                                }, errorHandler);
                        }, errorHandler);

                    return defer.promise;
                },
                asyncRemoveUserCheckin: function(memberID, groupID) {
                    var defer = $q.defer();

                    //check for current check-in/out status of user
                    var userCurrentCheckinRef = checkinService.getRefCheckinCurrent().child(groupID + '/' + memberID);
                    userCurrentCheckinRef.once('value', function(snapshot) {
                        var checkinObj = snapshot.val();

                        //if user's check-in/out exists
                        if (checkinObj) {
                            //remove user check-in/out
                            userCurrentCheckinRef.remove(function(err) {
                                if (err) {
                                    defer.reject();
                                } else {
                                    defer.resolve(checkinObj);
                                }
                            });
                        } else {
                            //if not yet checked-in, skip checkin removal
                            defer.resolve(null);
                        }
                    });

                    return defer.promise;
                },
                asyncRemoveUserMembership: function(memberID, groupID) {
                    var defer, errorHandler;

                    defer = $q.defer();

                    errorHandler = function() {
                        defer.reject('Error occurred in accessing server.');
                    };

                    firebaseService.getRefGroupMembers().child(groupID + '/' + memberID)
                        .remove(function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                firebaseService.getRefUserGroupMemberships().child(memberID + '/' + groupID)
                                    .remove(function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            defer.resolve();
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                asyncUpdateGroupDataForRemoveUser: function(checkinObj, groupID) {
                    var defer = $q.defer();

                    //update group meta-data
                    var groupDataRef = firebaseService.getRefGroups().child(groupID);
                    groupDataRef.once('value', function(snapshot) {
                        var updateObj = {};
                        var dataObject = snapshot.val();

                        if (checkinObj && checkinObj.type == 1) {
                            updateObj['members-checked-in'] = {
                                   count: dataObject['members-checked-in'].count - 1
                              };
                          }


                        // if (checkinObj && checkinObj.type == 1) {
                        //     updateObj['members-checked-in'] = {
                        //         count: dataObject['members-checked-in'].count - 1
                        //     };
                        // }


                        updateObj['members-count'] = dataObject['members-count'] - 1;
                        groupDataRef.update(updateObj, function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });
                    });

                    return defer.promise;
                },
                asyncUpdateSubGroupDataForRemoveUser: function(checkinObj, groupID, userID) {
                    var defer = $q.defer();

                    // var groupDataRef = firebaseService.getRefUserSubGroupMemberships().child(userID).child(groupID).once('value', function(snapshot){});
                    //update group meta-data
                    var groupDataRef = firebaseService.getRefSubGroups().child(groupID);
                    groupDataRef.once('value', function(snapshot) {
                        var updateObj = {};
                        var dataObject = snapshot.val();

                        if (checkinObj && checkinObj.type == 1) {
                            updateObj['members-checked-in'] = {
                                   count: dataObject['members-checked-in'].count - 1
                              };
                          }


                        // if (checkinObj && checkinObj.type == 1) {
                        //     updateObj['members-checked-in'] = {
                        //         count: dataObject['members-checked-in'].count - 1
                        //     };
                        // }


                        updateObj['members-count'] = dataObject['members-count'] - 1;
                        groupDataRef.update(updateObj, function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });
                    });

                    return defer.promise;
                },
                asyncLeaveGroup: function(userObj, groupObj) {
                    var defer, errorHandler, self;

                    defer = $q.defer();
                    self = this;

                    errorHandler = function() {
                        defer.reject('could not access server data');
                    };

                    userFirebaseService.asyncRecordMemberLeft(userObj, groupObj)
                        .then(function(res) {
                            self.asyncRemoveUserFromGroup(userObj.$id, groupObj.$id)
                                .then(function() {
                                    defer.resolve(res);
                                }, errorHandler);

                        }, errorHandler);

                    return defer.promise;
                },
                asyncRemoveGroup: function(userObj, groupObj) {
                    var defer, self, errorHandler,
                        promises, dfr;

                    defer = $q.defer();
                    self = this;
                    promises = [];

                    errorHandler = function(reason) {
                        defer.reject(reason || 'could not access server data');
                    };

                    //for node: group-activity-streams > $groupid
                    self.asyncRemoveGroupActivityStreams(groupObj.$id)
                        .then(function() {

                            //for node: "group-check-in-current" and "group-check-in-records"
                            self.asyncRemoveGroupCheckin(groupObj.$id)
                                .then(function() {

                                    //for node: group-locations-defined > $groupid
                                    self.asyncRemoveGroupDefLocs(groupObj.$id)
                                        .then(function() {

                                            //for node: group-membership-requests > $groupid AND group-membership-requests-by-user
                                            self.asyncRemoveGroupMembershipRequests(groupObj.$id)
                                                .then(function() {

                                                    //for node: "group-names"
                                                    self.asyncRemoveGroupNames(groupObj.$id)
                                                        .then(function() {

                                                            //for node: "groups"
                                                            self.asyncRemoveGroupMetaDeta(groupObj.$id)
                                                                .then(function() {

                                                                    //get members list array
                                                                    self.asyncGetGroupMembersArray(groupObj.$id)
                                                                        .then(function(membersArray) {

                                                                            dfr = $q.defer();
                                                                            angular.forEach(membersArray, function(memberID) {

                                                                                //for node: group-members and user-group-memberships
                                                                                self.asyncRemoveUserMembership(memberID, groupObj.$id)
                                                                                    .then(function() {
                                                                                        dfr.resolve('You have removed "' + groupObj.title + '" group successfully.');
                                                                                    }, function() {
                                                                                        dfr.reject();
                                                                                    });

                                                                                promises.push(dfr.promise);
                                                                            });

                                                                            $q.all(promises).then(function() {
                                                                                defer.resolve('group has been removed successfully.');
                                                                            }, errorHandler);
                                                                        });
                                                                }, errorHandler);
                                                        }, errorHandler);
                                                }, errorHandler);
                                        }, errorHandler);
                                }, errorHandler);
                        }, errorHandler);

                    return defer.promise;
                },
                asyncRemoveGroupCheckin: function(groupID) {
                    //for "group-check-in-current" and "group-check-in-records"
                    var defer = $q.defer();

                    firebaseService.getRefGroupCheckinCurrent().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                firebaseService.getRefGroupCheckinRecords().child(groupID)
                                    .remove(function(err) {
                                        if (err) {
                                            defer.reject();
                                        } else {
                                            defer.resolve();
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupDefLocs: function(groupID) {
                    //for "group-locations-defined"
                    var defer = $q.defer();

                    firebaseService.getRefGroupLocsDefined().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupActivityStreams: function(groupID) {
                    //for "group-activity-streams"
                    var defer = $q.defer();

                    firebaseService.getRefGroupsActivityStreams().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupMembershipRequests: function(groupID) {
                    //for "group-membership-requests" and "group-membership-requests-by-user"
                    var defer, requestedMembers,
                        promises, dfr;

                    defer = $q.defer();
                    promises = [];

                    firebaseService.getRefGroupMembershipRequests().child(groupID)
                        .on('value', function(snapshot) {
                            requestedMembers = snapshot.val() || {};
                            requestedMembers = Object.keys(requestedMembers);

                            //if group does not have any membership-requests, skip requests removal step
                            if (!requestedMembers.length) {
                                defer.resolve();
                            } else {
                                //if group have membership-requests for approval or rejection.
                                angular.forEach(requestedMembers, function(requestedMemberID) {
                                    dfr = $q.defer();
                                    promises.push(dfr.promise);

                                    //remove requested Member's request from "group-membership-requests-by-user"
                                    firebaseService.getRefGroupMembershipRequestsByUser().child(requestedMemberID + '/' + groupID)
                                        .remove(function(err) {
                                            if (err) {
                                                dfr.reject();
                                            } else {
                                                dfr.resolve();
                                            }
                                        });
                                });

                                $q.all(promises)
                                    .then(function() {
                                        defer.resolve();
                                    }, function() {
                                        defer.reject();
                                    });
                            }
                        }, function() {
                            defer.reject('permission denied to access data.');
                        });

                    return defer.promise;

                },
                asyncRemoveGroupNames: function(groupID) {
                    //for "group-names"
                    var defer = $q.defer();

                    firebaseService.getRefGroupsNames().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupMetaDeta: function(groupID) {
                    //for "groups"
                    var defer = $q.defer();

                    firebaseService.getRefGroups().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncGetGroupMembersArray: function(groupID) {
                    //to get an array that contains userIDs of all members of group
                    var defer = $q.defer();

                    firebaseService.getRefGroupMembers().child(groupID)
                        .on('value', function(snapshot) {
                            var membersObj = snapshot.val() || {};
                            defer.resolve(Object.keys(membersObj));
                        }, function() {
                            defer.reject('permission denied to access data.');
                        });

                    return defer.promise;
                },
                addRemoveAdminOfGroup: function(groupId, subgroupId, userId, memberType) {
                    var self = this;
                    var ref = firebaseService.getRefMain();

                    var obj = (memberType) ? { 'membership-type': memberType, 'timestamp': firebaseTimeStamp } : null;

                    // Create the data we want to update
                    var updatedUserData = {};
                    updatedUserData["subgroup-members/" + groupId + '/'+ subgroupId + '/' + userId] = obj;
                    updatedUserData["user-subgroup-memberships/" + userId + '/' + groupId + '/'+ subgroupId] = obj;

                    //UPDATE MULTIPATH
                    ref.update(updatedUserData, function(err){
                        if(err){
                            console.log(err);
                        } else {
                            // console.log('done');
                        }
                    });

                    //update subgroup member count
                    self.subgroupMemberUpdate(groupId, subgroupId, userId, memberType);

                }, // addRemoveAdminOfGroup
                subgroupMemberUpdate: function(groupId, subgroupId, userId, type) {
                    var ref = firebaseService.getRefMain();

                    //if type is true then increment in subgroup member-count, else decrement in subgroup member-count

                    if (type) {
                        //checking if user id already a member of this subgroup then don't increment member-count
                        ref.child('subgroup-members').child(groupId).child(subgroupId).child(userId).once('value', function(snapshot){
                            if(snapshot.val()){
                                if(snapshot.val()['membership-type'] !== 2 && snapshot.val()['membership-type'] !== 3){
                                    ref.child('subgroups').child(groupId).child(subgroupId).once('value', function(subgroup){
                                        var count = subgroup.val()['members-count'];
                                        ref.child('subgroups').child(groupId).child(subgroupId).child('members-count').set(count+1, function(){
                                            // console.log('count updated');
                                        });
                                    });
                                }
                            } else {
                                ref.child('subgroups').child(groupId).child(subgroupId).once('value', function(subgroup){
                                    var count = subgroup.val()['members-count'];
                                    ref.child('subgroups').child(groupId).child(subgroupId).child('members-count').set(count+1, function(){
                                        // console.log('count updated');
                                    });
                                });
                            }
                        }); //ref.child('subgroup-members')
                    } else {
                        //checking if user id already a member of this subgroup then decrement member-count
                        ref.child('subgroup-members').child(groupId).child(subgroupId).child(userId).once('value', function(snapshot){
                            if(snapshot.val()){
                                if(snapshot.val()['membership-type'] === 2 || snapshot.val()['membership-type'] === 3) {
                                    ref.child('subgroups').child(groupId).child(subgroupId).once('value', function(subgroup){
                                        var count = subgroup.val()['members-count'];
                                        ref.child('subgroups').child(groupId).child(subgroupId).child('members-count').set(count-1, function(){
                                            // console.log('count updated');
                                        });
                                    });
                                }
                            } //if snapshot
                        }); //ref.child('subgroup-members')
                    } // else
                } // subgroupMemberUpdate
            }; // return
        } // factory
    ]);

/**
 * Created by ZiaKhan on 02/02/15.
 */

'use strict';

angular.module('core')
    .factory('soundService', ["ngAudio", function(ngAudio) {
        var successSound = ngAudio.load("sounds/guitar_success.mp3"); // returns NgAudioObject
        var failSound = ngAudio.load("sounds/piano_fail.mp3");

        return {
            playSuccess: function() {
                successSound.play();
            },
            playFail: function() {
                failSound.play();
            }
        };
    }]);

/**
 * Created by Shahzad on 5/15/2015.
 */

/*
 * dependency:
 * init: after successful login, call setUserPresence()
 * */
(function() {
    "use strict";

    angular
        .module('core')
        .service('userPresenceService', userPresenceService);

    userPresenceService.$inject = ['$firebaseObject', '$timeout'];

    function userPresenceService($firebaseObject, $timeout) {

        var refs = {};
        var currentConRef;
        var userPresRef;
        //initialize code

        //exports list
        return {
            init: init,
            syncUserPresence: syncUserPresence,
            getUserSyncObject: getUserSyncObject,
            getRefUsersPresense: getRefUsersPresense,
            removeCurrentConRef: removeCurrentConRef
        };

        //to set references for firebase nodes, avoid injecting firebase service to avoid circular dependency
        function init(refsObj) {
            refs.main = refsObj.main;
            refs.users = refsObj.users;

            refs.fireConnection = refsObj.main.child('.info/connected');
            refs.usersPresence = refsObj.main.child('users-presence');
        }

        function getRefUsersPresense(){
            return refs.usersPresence
        }

        function removeCurrentConRef(){
            currentConRef.remove();
            userPresRef.child('last-modified').set(Firebase.ServerValue.TIMESTAMP);
        }

        //to set user presence
        function syncUserPresence(userID) {
            //for run once
            var i = 0;
            refs.fireConnection.on('value', function(snapshot) {

                // if (snapshot.val() && i === 0) {
                if (snapshot.val()) {
                    var userPresenceRef = refs.usersPresence.child(userID);
                    userPresRef = userPresenceRef
                    //get an entry for the current connection.
                    // userPresenceRef.child('last-modified').set(Firebase.ServerValue.TIMESTAMP);
                    // userPresenceRef.child('defined-status').set(1);
                    var currentConnRef = userPresenceRef.child('connections').push();
                    currentConRef = currentConnRef;
                    var multipath = {};
                    multipath[userID + "/last-modified"] = Firebase.ServerValue.TIMESTAMP;
                    multipath[userID + "/defined-status"] = 1;
                    multipath[userID + "/connections/" + currentConnRef.key() + "/type"] = 1;
                    multipath[userID + "/connections/" + currentConnRef.key() + "/started"] = Firebase.ServerValue.TIMESTAMP;
                        /*userID : {
                            'last-modified': Firebase.ServerValue.TIMESTAMP,
                            'defined-status': 1
                        },
                        currentConnRef : {
                            type: 1, // 1 = web, 2 = ios, 3 = andriod  (changed as per sir zia's instruction, issue # 92)
                            started: Firebase.ServerValue.TIMESTAMP,
                        }*/
                    // }
                    // console.log(multipath)
                    refs.usersPresence.update(multipath)
                    // when user disconnect, remove the connection. ( we should run .remove() before .set(), to avoid ghost entries. )
                    var multipath2 = {};
                    multipath2[userID + "/last-modified"] = Firebase.ServerValue.TIMESTAMP;
                    multipath2[userID + "/defined-status"] = 0;
                    // multipath2[userID + "/connections/" + currentConnRef.key() + "/type"] = 1;
                    // multipath2[userID + "/connections/" + currentConnRef.key() + "/started"] = Firebase.ServerValue.TIMESTAMP;
                    refs.usersPresence.onDisconnect().update(multipath2)
                    currentConnRef.onDisconnect().remove(
                        //@for debugging purpose for mahmood bhai
                        //    function(err){
                        //    if ( err ) {
                        //        console.info('remove error', err);
                        //    }
                        //}
                    );

                    //var x = userPresenceRef.child('last-modified');

                    // setting up details about current connection
                    // currentConnRef.set({
                            // type: 3, // 1 = mobile, 2 = tablet, 3 = web, 4 = watch , 5 = hololens
                            // type: 1, // 1 = web, 2 = ios, 3 = andriod  (changed as per sir zia's instruction, issue # 92)
                            // started: Firebase.ServerValue.TIMESTAMP,
                            //'last-modified': 'assasa'

                        // } //@for debugging purpose for mahmood bhai
                        //    function( err ) {
                        //    if ( err ) {
                        //        console.info('push error', err);
                        //    }
                        //}
                    // );

                    // when user disconnect, update the last time user was connected
                    userPresenceRef.child('last-modified').onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
                    // userPresenceRef.child('defined-status').onDisconnect().set(0);
                    i++; //for run once (increment)
                }
            });
        }

        //to get user sync object that contains profile, and availability object.
        function getUserSyncObject(userID) {
            var userSyncObject, userRef, userPresenceRef;

            userSyncObject = {};

            // get user profile
            userRef = refs.users.child(userID);
            userSyncObject.profile = $firebaseObject(userRef);

            //get user presence
            userPresenceRef = refs.usersPresence.child(userID);
            userPresenceRef.on('value', getUserPresenceObj);

            //method to destroy user presence syncObjects
            userSyncObject.off = function() {
                userPresenceRef.off('value', getUserPresenceObj);
            };

            //handler for user presence.
            function getUserPresenceObj(snapshot) {
                var userPresenceObj, recentConnection;
                userPresenceObj = snapshot.val() || {}; //A FIX for inconsistent data in Attendance System.

                $timeout(function() {
                    userSyncObject.availability = {};

                    userSyncObject.availability.lastSeen = userPresenceObj['last-modified'];

                    if (!userPresenceObj.connections) { //if no connections
                        userSyncObject.availability.status = "Offline";
                    } else {
                        switch (userPresenceObj['defined-status']) { // 0 = offline, 1 = online, 2 = away, 3 = busy.
                            case 1:
                                userSyncObject.availability.status = 'Online';
                                break;
                            case 2:
                                userSyncObject.availability.status = 'Away';
                                break;
                            case 3:
                                userSyncObject.availability.status = 'Busy';
                                break;
                            default:
                                userSyncObject.availability.status = 'Online'; //A FIX for inconsistent data in Attendance System.
                        }

                        //find the most recent connection to show the type of device from which the user is connected
                        recentConnection = Object.keys(userPresenceObj.connections);
                        recentConnection = recentConnection[recentConnection.length - 1];

                        // 1 = web, 2 = ios, 3 = andriod  (changed as per sir zia's instruction, issue # 92)
                        switch (userPresenceObj.connections[recentConnection].type) {
                            case 1:
                                userSyncObject.availability.device = 'Web';
                                break;
                            case 2:
                                userSyncObject.availability.device = 'IOS';
                                break;
                            case 3:
                                userSyncObject.availability.device = 'Android';
                                break;
                            case 4:
                                userSyncObject.availability.device = 'iWatch';
                                break;
                            case 5:
                                userSyncObject.availability.device = 'HoloLens';
                                break;
                            default:
                                userSyncObject.availability.device = 'Unknown';
                        }

                        // switch (userPresenceObj.connections[recentConnection].type) { // 1 = mobile, 2 = tablet, 3 = web, 4 = iWatch , 5 = hololens
                        //     case 1:
                        //         userSyncObject.availability.device = 'Mobile';
                        //         break;
                        //     case 2:
                        //         userSyncObject.availability.device = 'Tablet';
                        //         break;
                        //     case 3:
                        //         userSyncObject.availability.device = 'Web';
                        //         break;
                        //     case 4:
                        //         userSyncObject.availability.device = 'iWatch';
                        //         break;
                        //     case 5:
                        //         userSyncObject.availability.device = 'HoloLens';
                        //         break;
                        //     default:
                        //         userSyncObject.availability.device = 'Unknown';
                        // }
                    }
                });
            }

            return userSyncObject;
        }
    }

})();

/**
 * Created by Shahzad on 6/9/2015.
 */

(function() {
    'use strict';
    angular.module('core')
        .factory('userHelperService', ["$q", "$http", "appConfig", "$firebaseAuth", "$location", '$firebaseArray', "firebaseService",
            function($q, $http, appConfig, $firebaseAuth, $location, $firebaseArray, firebaseService) {


                return {
                    getAllUsers: function() {
                        //return $firebaseObject(firebaseService. getRefUsers());
                        return $firebaseArray(toDoListRef)(firebaseService.getRefUsers());

                    },
                    getUserGroupMemberShip: function() {
                        //return $firebaseObject(firebaseService.getRefUserGroupMemberships());
                        return Firebase.getAsArray(firebaseService.getRefGroupMembers());

                    }



                }

            }
        ]);
})();

/**
 * Created by ZiaKhan on 15/02/15.
 */


'use strict';


angular.module('core')
    .factory('subgroupFirebaseService', ['checkinService', "$firebaseArray", "firebaseService", "$q", "$timeout", "$firebaseObject", 'userFirebaseService', 'groupFirebaseService',
        //function(firebaseService, $q, $timeout, $sessionStorage, $route, $firebaseObject,userFirebaseService,groupFirebaseService) {
        function(checkinService, $firebaseArray, firebaseService, $q, $timeout, $firebaseObject, userFirebaseService, groupFirebaseService) {
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
            return {
                getSubgroupSyncObjAsync: function(groupID, subgroupID, viewerUserID) {
                    var deferred = $q.defer();
                    var self = this;
                    var syncObj = {
                        subgroupsSyncArray: [],
                        membersSyncArray: [],
                        pendingMembershipSyncArray: [],
                        activitiesSyncArray: [],
                        groupMembersSyncArray: []
                    };

                    syncObj.self = this;
                    syncObj.viewerUserID = viewerUserID;
                    syncObj.groupID = groupID;
                    syncObj.subgroupID = subgroupID;
                    syncObj.userSubgroupMembershipRef = firebaseService.getRefUserSubGroupMemberships().child(viewerUserID).child(groupID).child(subgroupID);
                    syncObj.userGroupMembershipRef = firebaseService.getRefUserGroupMemberships().child(viewerUserID).child(groupID);
                    syncObj.subgroupSyncObj = $firebaseObject(firebaseService.getRefSubGroups().child(groupID).child(subgroupID));
                    syncObj.groupObj =
                        syncObj.userGroupMembershipRef.once("value", function(groupMembershipSnapshot) {


                            syncObj.userSubgroupMembershipRef.once("value", function(subgroupMembershipSnapshot) {

                                syncObj.groupMembership = groupMembershipSnapshot.val();
                                syncObj.subgroupMembership = subgroupMembershipSnapshot.val();

                                if (syncObj.subgroupMembership) { //if has team membership
                                    var teamMembershipType = subgroupMembershipSnapshot.val()["membership-type"];
                                    syncObj.membershipType = teamMembershipType;
                                    syncObj.timestamp = syncObj.subgroupMembership["timestamp"];
                                    if (teamMembershipType > 0 && teamMembershipType <= 3) {
                                        self.addListeners(syncObj);
                                    }


                                    syncObj.userSubgroupMembershipRef.on("child_changed", self.subgroupMembershipChanged, syncObj);
                                    syncObj.userSubgroupMembershipRef.on("child_removed", self.subgroupMembershipDeleted, syncObj);
                                } else { //doesnot have team membership but because he is an owner or admin of space he gets a membership
                                    if (syncObj.groupMembership) { //not a team member but does he have a space membership
                                        var groupMembershipType = groupMembershipSnapshot.val()["membership-type"];

                                        if (groupMembershipType == 1 || groupMembershipType == 2) { //space owner and admins have access to all teams
                                            syncObj.membershipType = groupMembershipType;
                                            if (groupMembershipType == 1) {
                                                syncObj.timestamp = syncObj.subgroupSyncObj.timestamp; //space owner is a member from the time team was created
                                            } else {
                                                syncObj.timestamp = subgroupMembershipSnapshot.val()["timestamp"]; //space admin is a member from when he became space admin
                                            }

                                            self.addListeners(syncObj);

                                            syncObj.userGroupMembershipRef.on("child_changed", self.groupMembershipChanged, syncObj);
                                            syncObj.userGroupMembershipRef.on("child_removed", self.groupMembershipDeleted, syncObj);

                                        } else {
                                            syncObj.membershipType = -100; //space member but not a team member yet
                                            syncObj.userSubgroupMembershipRef.on("child_added", self.subgroupMembershipAddedLater, syncObj);
                                        }

                                    } else {
                                        syncObj.membershipType = -1000; //right now not even a member of the parent space
                                        //listen to if membership added later
                                        //syncObj.userSpaceMembershipRef.on("child_added", self.spaceMembershipAddedLater, syncObj); //not needed if he does not have space membership he will not have access to this page
                                    }


                                }

                                deferred.resolve(syncObj);
                            });
                        }, syncObj);

                    return deferred.promise;
                },
                removeSubgroupMembershipHandlers: function() {
                    this.userSubgroupMembershipRef.off("child_changed", this.self.subgroupMembershipChanged, this);
                    this.userSubgroupMembershipRef.off("child_removed", this.self.subgroupMembershipDeleted, this);
                },
                removeGroupMembershipHandlers: function() {
                    this.userGroupMembershipRef.off("child_changed", this.self.groupMembershipChanged, this);
                    this.userGroupMembershipRef.off("child_removed", this.self.groupMembershipDeleted, this);
                    this.self.userSubgroupMembershipRef.off("child_added", this.self.subgroupMembershipAddedLater, this);
                },
                reloadController: function() {
                    /* $timeout(function () {
                         // 0 ms delay to reload the page.
                         $route.reload();
                     }, 0);*/
                },
                addListeners: function(syncObj) {
                    if (syncObj.membershipType >= 1) {
                        syncObj.groupMembershipRef = groupFirebaseService.syncGroupMembers(syncObj.groupID, syncObj.groupMembersSyncArray);
                        syncObj.subgroupMembershipRef = syncObj.self.syncSubgroupMembers(syncObj.groupID, syncObj.subgroupID, syncObj.membersSyncArray, syncObj);
                        syncObj.groupActivitiesRef = syncObj.self.syncSubgroupActivities(syncObj.groupID, syncObj.subgroupID, syncObj.activitiesSyncArray, syncObj);
                    }

                    if (syncObj.membershipType == 1 || syncObj.membershipType == 2) {
                        syncObj.teamPendingMembershipRequestsRef = syncObj.self.syncSubgroupPendingMembershipRequests(syncObj.groupID, syncObj.subgroupID, syncObj.pendingMembershipSyncArray, syncObj);
                    }
                },
                removeListeners: function() {
                    if (this.membershipType >= 1) {

                    }

                    if (this.membershipType == 1 || this.membershipType == 2) {

                    }
                },
                subgroupMembershipAddedLater: function(snapshot) {
                    if ((this.spaceID + ">" + this.teamID) == snapshot.key()) { //has become a member now
                        this.self.removeGroupMembershipHandlers.apply(this);
                        this.self.removeListeners.apply(this);
                        this.self.reloadController.apply(this);
                    }
                },
                groupMembershipChanged: function(snapshot) {
                    var newMembershipType = snapshot.val();
                    if (newMembershipType != this.groupMembership.membershipType) { //membership type has changed
                        this.self.removeGroupMembershipHandlers.apply(this);
                        this.self.removeListeners.apply(this);
                        this.self.reloadController.apply(this);
                    }
                },
                subgroupMembershipChanged: function(snapshot) {
                    var newMembershipType = snapshot.val();
                    if (newMembershipType != this.subgroupMembership.membershipType) { //membership type has changed
                        this.self.removeSubgroupMembershipHandlers.apply(this);
                        this.self.removeListeners.apply(this);
                        this.self.reloadController.apply(this);
                    }
                },
                groupMembershipDeleted: function(snapshot) { //is no longer a space member
                    this.self.removeGroupMembershipHandlers.apply(this);
                    this.self.removeListeners.apply(this);
                    this.self.reloadController.apply(this);

                },
                subgroupMembershipDeleted: function(snapshot) { //is no longer a team member
                    this.self.removeSubgroupMembershipHandlers.apply(this);
                    this.self.removeListeners.apply(this);
                    this.self.reloadController.apply(this);

                },

                syncSubgroupMembers: function(groupId, subgroupID, memberArray) {
                    //var ref = firebaseService.getRefGroupMembers().child(spaceID + ">" + teamID);
                    var ref = firebaseService.getRefSubGroupMembers().child(groupId + "/" + subgroupID);
                    ref.on('child_added', this.subgroupUserMembershipAdded, memberArray);
                    ref.on('child_changed', this.subgroupUserMembershipChanged, memberArray);
                    ref.on('child_removed', this.subgroupUserMembershipDeleted, memberArray);
                    return ref;
                },

                subgroupUserMembershipAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            membershipType: snapshot.val()["membership-type"],
                            timestamp: snapshot.val()["timestamp"],
                            userSyncObj: userSyncObj
                        });
                    });
                },
                subgroupUserMembershipChanged: function(snapshot) {
                    var userID = snapshot.key();
                    var membershipObj = snapshot.val();
                    this.forEach(function(obj) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                obj.membershipType = membershipObj["membership-type"];
                            });
                        }
                    });
                },
                subgroupUserMembershipDeleted: function(snapshot) {
                    var self = this;
                    var userID = snapshot.key();
                    this.forEach(function(obj, i) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                self.splice(i, 1);
                            });
                        }
                    });
                },
                syncSubgroupActivities: function(groupID, subgroupID, activitiesSyncArray) {
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroupID).orderByPriority();
                    ref.on("child_added", this.groupActivityAdded, {
                        array: activitiesSyncArray,
                        groupID: groupID,
                        subgroupID: subgroupID,
                        self: this
                    });
                    return ref;
                },
                groupActivityAdded: function(snapshot) {
                    var self = this;
                    var activity = snapshot.val();
                    $timeout(function() {
                        if (activity) {
                            self.array.push(activity);
                        }
                    });
                },

                syncSubgroupPendingMembershipRequests: function(groupID, subgroupID, pendingMembershipSyncArray) {
                    var ref = firebaseService.getRefSubgroupMembershipRequests().child(groupID + "/" + subgroupID);
                    ref.on("child_added", this.subgroupMembershipRequestAdded, pendingMembershipSyncArray);
                    ref.on("child_removed", this.subgroupMembershipRequestDeleted, pendingMembershipSyncArray);
                    return ref;
                },
                subgroupMembershipRequestAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            message: snapshot.val()["message"],
                            timestamp: snapshot.val()["timestamp"],
                            userSyncObj: userSyncObj
                        });
                    });
                },
                subgroupMembershipRequestDeleted: function(snapshot) {
                    var self = this;
                    var userID = snapshot.key();
                    this.forEach(function(obj, i) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                self.splice(i, 1);
                            });
                        }
                    });
                },
                asyncAddUserMembershipToSubgroup: function(userID, groupID, subgroupID, typeNum) {
                    var that = this;
                    var deferred = $q.defer();
                    var timestampRef = firebaseService.getRefSubGroupMembers().child(groupID + '/' + subgroupID + '/' + userID + '/timestamp');

                    timestampRef.once("value", function(snapshot) {
                        var timestamp = snapshot.val() || firebaseTimeStamp;
                        var userMem = {};

                        userMem[subgroupID] = {
                            "membership-type": typeNum,
                            timestamp: timestamp
                        };

                        var userMemRef = firebaseService.getRefUserSubGroupMemberships().child(userID).child(groupID);
                        userMemRef.update(userMem, function(error) {
                            if (error) {
                                deferred.reject();
                            } else {
                                deferred.resolve();
                            }
                        });
                    });

                    return deferred.promise;
                },
                asyncUpdateSubgroupMembers: function(loggedInUserObj, subgroupObj, requestedMembersList, subgroupExistingMembersArray, groupData) {
                    var deferred = $q.defer();
                    var that = this;
                    //create an object from membersSyncArray.
                    var subgroupExistingMembersObj = {};
                    angular.forEach(subgroupExistingMembersArray, function(memberObj) {
                        subgroupExistingMembersObj[memberObj.userID] = true;
                    });

                    userFirebaseService.asyncCreateGroupMembersJSON(loggedInUserObj.userID, requestedMembersList, subgroupExistingMembersObj)
                        .then(function(response) {

                            var promises = [];

                            //Add group to each user
                            var promise;
                            var memArray = response.members;
                            memArray.forEach(function(memberID) {
                                promise = that.asyncAddUserMembershipToSubgroup(memberID, subgroupObj.groupID, subgroupObj.subgroupID, 3);
                                promises.push(promise);
                            });

                            //Add membersJSON to given group
                            var addMembersToGroupDefer = $q.defer();
                            firebaseService.getRefSubGroupMembers().child(subgroupObj.groupID).child(subgroupObj.subgroupID).update(response.memberJSON, function(err) {
                                if (err) {
                                    //handle this scenario
                                    console.log('adding membersJSON to group failed', err);
                                } else {
                                    addMembersToGroupDefer.resolve();
                                }
                                console.log('user2 added')
                            });

                            promises.push(addMembersToGroupDefer.promise);

                            $q.all(promises).then(function() {
                                var memberCountRef = firebaseService.getRefSubGroups().child(subgroupObj.groupID + '/' + subgroupObj.subgroupID + '/' + 'members-count');
                                memberCountRef.transaction(function(currentValue) {
                                    return (currentValue || 0) + memArray.length;
                                });
                                // debugger;
                                var qArray = [];
                                var qArray2 = [];
                                var deffer = $q.defer();
                                deffer.promise
                                    .then(function(dataArrofArr) {

                                        dataArrofArr.forEach(function(arr) {
                                            if (arr[1].type == 1) {
                                                arr[0].checkedin = true
                                            } else {
                                                arr[0].checkedin = false
                                            }
                                            qArray2.push(arr[0].$save())
                                        });
                                        return $q.all(qArray2)
                                    })
                                    .then(function() {
                                        deferred.resolve({
                                            unlistedMembersArray: response.unlisted
                                        });
                                        //step  : entry for "subgroup-activity-streams"
                                        // debugger;

                                    })
                                    .catch(function(d) {
                                        console.log(d);
                                    })
                                // for (var member in memArray) {
                                //
                                //     var temp = $firebaseObject(firebaseService.getRefFlattendGroups().child(loggedInUserObj.userID).child(subgroupObj.groupID + "_" + subgroupObj.subgroupID).child(member))
                                //         .$loaded().then(function() {
                                //             var temp1 = $firebaseObject(checkinService.getRefSubgroupCheckinCurrentByUser().child(member)).$loaded().then(function() {
                                //                 qArray.push($q.all([temp, temp1]))
                                //             })
                                //         })
                                // }
                                deffer.resolve($q.all(qArray));





                                /*  if(memArray.length == 1) {

                                      //userFirebaseService.asyncRecordGroupMemberAdditionActivity(subgroupObj, loggedInUserObj, response.members[0])
                                      groupFirebaseService.asyncRecordSubgroupMemberAdditionActivity(loggedInUserObj.userID, subgroupObj.groupID ,subgroupObj.$id, memArray[0] )
                                          .then(function(){
                                              deferred.resolve({unlistedMembersArray: response.unlisted});
                                          })
                                  }
                                  else if (memArray.length > 1) {

                                      groupFirebaseService.asyncRecordManySubgroupsMembersAdditionActivity(loggedInUserObj, groupData, subgroupObj, response.members)
                                          .then(function(){
                                              deferred.resolve({unlistedMembersArray: response.unlisted});
                                          });
                                  }
                                  else {
                                      deferred.resolve({unlistedMembersArray: response.unlisted});
                                  }*/
                            });

                        }, function() {
                            deferred.reject();
                        });

                    return deferred.promise;
                },
                getFirebaseGroupObj: function(groupId) {

                    var ref = firebaseService.getRefGroups().child(groupId);
                    return $firebaseObject(ref)
                },
                getFirebaseGroupSubGroupMemberObj: function(groupid, subgroupid) {

                    var ref = firebaseService.getRefSubGroupMembers().child(groupid).child(subgroupid);
                    return $firebaseArray(ref)
                },
                approveMembership: function(groupID, subgroupID, loggedInUserObj, requestedMember) {
                    var defer, userID, membershipType,
                        userMembershipObj, errorHandler;

                    defer = $q.defer();
                    membershipType = 3; //for members only, should be dynamic when make admin feature added.
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    userMembershipObj = {};
                    userMembershipObj[userID] = {
                        'membership-type': membershipType,
                        timestamp: firebaseTimeStamp
                    };

                    //add user to subgroup-membership list
                    firebaseService.getRefGroupMembers().child(groupID)
                        .update(userMembershipObj, function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                //step1: change membership-type of user in user-membership list
                                //firebaseService.getRefUserGroupMemberships().child(userID + '/' + groupID)
                                firebaseService.getRefUserSubGroupMemberships().child(userID + '/' + groupID + '/' + subgroupID)
                                    .set(userMembershipObj[userID], function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            //step2: delete user request from subgroup-membership-requests
                                            //firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                            firebaseService.getRefSubgroupMembershipRequests().child(groupID + '/' + subgroupID + '/' + userID)
                                                .remove(function(err) {
                                                    var groupCountRef;
                                                    if (err) {
                                                        errorHandler();
                                                    } else {
                                                        //step3: set members count in meta-data of subgroup
                                                        //groupCountRef = firebaseService.getRefGroups().child(groupID + '/members-count');
                                                        groupCountRef = firebaseService.getRefSubGroups().child(groupID + '/' + subgroupID + '/members-count');
                                                        groupCountRef.once('value', function(snapshot) {
                                                            var membersCount = snapshot.val();
                                                            membersCount = (membersCount || 0) + 1;
                                                            groupCountRef.set(membersCount, function(err) {
                                                                if (err) {
                                                                    errorHandler();
                                                                } else {
                                                                    //step4: publish an activity
                                                                    firebaseService.getRefSubGroups().child(groupID).child(subgroupID)
                                                                        .once('value', function(snapshot) {
                                                                            var groupObj = snapshot.val();
                                                                            groupObj.groupID = groupID;
                                                                            groupObj.subgroupID = subgroupID;
                                                                            userFirebaseService.asyncRecordSubGroupMemberApproveRejectActivity('approve', groupObj, loggedInUserObj, userID)
                                                                                .then(function(res) {
                                                                                        defer.resolve(res);
                                                                                    },
                                                                                    errorHandler);
                                                                        });
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                rejectMembership: function(groupID, subgroupID, loggedInUserObj, requestedMember) {
                    var defer, userID,
                        errorHandler;

                    defer = $q.defer();
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    //step1: delete group membership request from user-membership list
                    //firebaseService.getRefUserGroupMemberships().child( userID + '/' + groupID)
                    firebaseService.getRefUserSubGroupMemberships().child(userID + '/' + groupID + '/' + subgroupID)
                        .remove(function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                //step2: delete user request from subgroup-membership-requests
                                //firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                firebaseService.getRefSubgroupMembershipRequests().child(groupID + '/' + subgroupID + '/' + userID)
                                    .remove(function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            //step3: publish an activity
                                            //firebaseService.getRefGroups().child(groupID)
                                            firebaseService.getRefSubGroups().child(groupID).child(subgroupID)
                                                .once('value', function(snapshot) {
                                                    var subgroupOjb = snapshot.val();
                                                    subgroupOjb.groupID = groupID;
                                                    subgroupOjb.subgroupID = subgroupID;
                                                    //userFirebaseService.asyncRecordGroupMemberApproveRejectActivity('reject', groupObj, loggedInUserObj, userID)
                                                    userFirebaseService.asyncRecordSubGroupMemberApproveRejectActivity('reject', subgroupOjb, loggedInUserObj, userID)
                                                        .then(function(res) {
                                                            defer.resolve(res);
                                                        }, errorHandler);
                                                });
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                }



            };
        }
    ]);

/*
var s = {
    "user-subgroup-memberships" : {
        "$userid": {
            ".read": "(auth.uid == $userid)",
            ".validate": "(root.child('users/' + $userid).exists())",
            "$groupid" : {
                ".read": "root.child('user-group-memberships').child(auth.uid).child($groupid).exists() && root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                ".write": "root.child('user-group-memberships').child(auth.uid).child($groupid).exists() && root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                "$subgroupid": {
                    ".read": "root.child('user-subgroup-memberships').child(auth.uid).child($groupid).exists() && root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                    ".write": "root.child('user-subgroup-memberships').child(auth.uid).child($groupid).exists() && root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                    ".validate": "newData.hasChildren(['membership-type', 'timestamp'])",
                    "membership-type": {
                        ".validate": "newData.isNumber() && newData.val() == -1 || newData.val() == 0 || newData.val() == 1 || newData.val() == 2 || newData.val() == 3"

                    },
                    "timestamp": {
                        ".validate": "newData.isNumber() && newData.val() <= now"
                    }
                }

            }
        }
    }
}*/

 /**
 * Created by Shahzad on 1/21/2015.
 */

(function() {
    'use strict';

    angular
        // .module('checkin')
        .module('core')
        .factory('checkinService', checkinService);

    checkinService.$inject = ['ProgressReportService', 'activityStreamService', '$q', '$geolocation', 'firebaseService', 'userService', "$firebaseObject", '$firebaseArray'];

    function checkinService(ProgressReportService, activityStreamService, $q, $geolocation, firebaseService, userService, $firebaseObject, $firebaseArray) {

        /*private variables*/
        var refs, fireTimeStamp;

        //firebase unix-epoch time
        fireTimeStamp = Firebase.ServerValue.TIMESTAMP;

        refs = {
            main: firebaseService.getRefMain()
        };

        refs.refGroupCheckinCurrent = refs.main.child('group-check-in-current');
        refs.refGroupCheckinRecords = refs.main.child('group-check-in-records');
        refs.refGroupLocationsDefined = refs.main.child('group-locations-defined');

        refs.refSubGroupCheckinCurrent = refs.main.child('subgroup-check-in-current');
        refs.refSubGroupCheckinRecords = refs.main.child('subgroup-check-in-records');
        refs.refSubGroupLocationsDefined = refs.main.child('subgroup-locations-defined');
        refs.refSubGroupCheckinCurrentByUser = refs.main.child('subgroup-check-in-current-by-user');

        function getLocation(groupID, subgroupID) {
            var defer = $q.defer();
            // var locationRef = new Firebase(refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID).toString());
            // locationRef.orderByValue().on("value", function(snapshot) {
            //     snapshot.forEach(function(data) {
            //         //console.log(data.val());
            //         refs.$currentSubGroupLocationsObject = data.val();
            //     });
            //     defer.resolve();
            // });
                defer.resolve();
            return defer.promise;
        }


        //step 1 (calling from Controller)
        function ChekinUpdateSatatus(group, userId, checkoutFlag, cb){
            //var groupObj = {groupId: group.pId, subgroupId: group.subgroupId, userId: userId};
            $geolocation.getCurrentPosition({
                timeout: 60000,
                maximumAge: 250,
                enableHighAccuracy: true
            }).then(function(location){
                // console.log('location', location)
                 if(location.coords) {
                    var locationObj = {lat: location.coords.latitude, lng: location.coords.longitude};
                     subgroupHasPolicy(group.groupId, group.subgroupId, function(hasPolicy, Policy){
                        if(hasPolicy) {
                            //hasPolicy true
                            checkinPolicy(Policy, locationObj, function(result, msg, teamLocationTitle){
                                if(result){
                                    saveFirebaseCheckInOut(group, checkoutFlag, locationObj, Policy, teamLocationTitle, function(result, cbMsg, reportMsg){
                                        //console.log('group', group); //group = {groupId: "hotmaill", subgroupId: "yahooemail", userId: "usuf52"}
                                        cb(result, cbMsg, reportMsg, group);
                                    });
                                } else {
                                    cb(false, msg, null, null);
                                }
                            });
                        } else {
                            //hasPolicy false
                            saveFirebaseCheckInOut(group, checkoutFlag,  locationObj, Policy, null, function(result, cbMsg, reportMsg){
                                cb(result, cbMsg, null, null);
                            });
                        }
                    });
                 } else {
                     cb(false, 'Please allow your location (not getting current location)!', null, null);
                 }
            });
        }

        function subgroupHasPolicy(groupID, subgroupID, cb){
            //firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).once('value', function(snapshot) {
            firebaseService.getRefSubgroupPolicies().child(groupID).child(subgroupID).once('value', function(snapshot) {
                if(snapshot.val() && snapshot.val().hasPolicy && snapshot.val().hasPolicy === true) {
                    firebaseService.getRefPolicies().child(groupID).child(snapshot.val().policyID).once('value', function(policy){
                        cb(true, policy.val());
                    }); //getting policy
                } else {//self.subGroupHasPolicy if true
                    cb(false, false);
                }
            }); //firebaseService.getRefSubGroupsNames()
        } //subgroupHasPolicy

        //calculating Distance
        function CalculateDistance(lat1, lon1, lat2, lon2, unit) {
            //:::    unit = the unit you desire for results                               :::
            //:::           where: 'M' is statute miles (default)                         :::
            //:::                  'K' is kilometers                                      :::
            //:::                  'N' is nautical miles                                  :::
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            // var radlon1 = Math.PI * lon1 / 180;
            // var radlon2 = Math.PI * lon2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") {
                dist = dist * 1.609344;
            }
            if (unit == "N") {
                dist = dist * 0.8684;
            }
            return dist;
        }

        //checking Policy is Subgroup Has Policy (is that timebased or locationbased)
        function checkinPolicy(Policy, currentLocationObj, callback) {
            if(Policy && Policy.locationBased) {  //checking if location Based

                //checking distance (RADIUS)
                var distance = CalculateDistance(Policy.location.lat, Policy.location.lng, currentLocationObj.lat, currentLocationObj.lng, 'K');
                // console.log('distance:' + distance);
                // console.log('distance in meter:' + distance * 1000);

                if ((distance * 1000) < Policy.location.radius) {  //checking lcoation radius
                    // callback(false, 'Current Location does not near to the Team Location');
                    checkinTimeBased(Policy, function(d, msg) {  //policy has also timeBased
                        callback(d, msg, Policy.location.title);     //if result true (checkin allow)
                    }); //checking if time based
                } else { // if within radius
                    checkinTimeBased(Policy, function(d, msg) {  //policy has also timeBased
                        callback(d, msg, false);     //if result true (checkin allow)
                    }); //checking if time based
                } //if within radius

            } else if(Policy && Policy.timeBased) { //policy has timeBased
                checkinTimeBased(Policy, function(d, msg) {
                    callback(d, msg, false);      //if result true (checkin allow)
                }); //checking if time based
            } else {    //checking others like if dailyReport
                callback(true, '', false);      //result true (checkin allow) (might be only dailyReport has checked)
            }
        } //checkinLocationBased
        //checkinTimeBased
        function checkinTimeBased(Policy, callback) {
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            //if timeBased true
            if(Policy && Policy.timeBased) {
                var today = new Date();
                var Schduleday = days[today.getDay()];

                //(self.subGroupPolicy.schedule[Schduleday] && self.subGroupPolicy.schedule[Schduleday][today.getHours()]) ?  console.log('t') : console.log('f');
                if(Policy.schedule[Schduleday] && Policy.schedule[Schduleday][today.getHours()]) {
                    //if allow then checkin
                    callback(true, '');
                } else {   //checking allow in days with hours
                    callback(false, 'You Don\'t have to permission to checkin at this day/hour');
                }

            } else {//timeBased false
                callback(true, '');    //if not timebased then return true....
            }
        } //checkinTimeBased

        //checkinDailyProgress
        function checkinDailyProgress(groupObj, checkoutFlag, Policy, cb){
            if (Policy && Policy.progressReport) {

                var uObject = { groupId: groupObj.groupId, subgroupId: groupObj.subgroupId, userId: groupObj.userId };
                ProgressReportService.createProgressReport(uObject, Policy, checkoutFlag).then(function(data) {
                    cb(data.result, data.message);
                });

                // //checking daily progress report is exists or not -- START --
                // //firebaseService.getRefMain().child('progress-reports-by-users').child(groupObj.userId).child(groupObj.groupId).child(groupObj.subgroupId).orderByChild('date')
                // firebaseService.getRefMain().child('subgroup-progress-reports').child(groupObj.groupId).child(groupObj.subgroupId).child(groupObj.userId).orderByChild('date')
                // .startAt(new Date().setHours(0,0,0,0)).endAt(new Date().setHours(23,59,59,0)).once('value', function(snapshot){
                //     if(snapshot.val() === null) { //if null then create daily report dummy
                //         //cerating Dummy Report Object on Checkin....
                //         var progressRprtObj = firebaseService.getRefMain().child('subgroup-progress-reports').child(groupObj.groupId).child(groupObj.subgroupId).child(groupObj.userId).push({
                //             date: Firebase.ServerValue.TIMESTAMP,
                //             //date: new Date().setHours(0,0,0,0),
                //             questionID: Policy.latestProgressReportQuestionID,
                //             policyID: Policy.policyID,
                //             answers: ''
                //         });
                //         //for group activity stream record -- START --
                //         var type = 'progressReport';
                //         var targetinfo = {id: progressRprtObj.key(), url: groupObj.groupId+'/'+groupObj.subgroupId, title: groupObj.groupId+'/'+groupObj.subgroupId, type: 'progressReport' };
                //         var area = {type: 'progressReport-created'};
                //         var group_id = groupObj.groupId+'/'+groupObj.subgroupId;
                //         var memberuserID = groupObj.userId;
                //         var _object = null;
                //         //for group activity record
                //         activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, _object);
                //         //for group activity stream record -- END --

                //         cb(false, 'notSubmitted');
                //     } else {
                //         for(var obj in snapshot.val()) {
                //             //console.log(snapshot.val()[obj])
                //             if(snapshot.val()[obj].answers === "" && checkoutFlag === true) {  //now checking if answers has given or not on checkout
                //                 //if not submited report then show msg
                //                 cb(false, 'notSubmitted');
                //             } else {
                //                 //if submited report then nuthing
                //                 cb(true, null);
                //             }
                //         }
                //     }
                // });
                // // checking daily progress report is exists or not -- END --


            } else {//if(Policy && Policy.dailyReport)
                //if not assign any daily report policy (Daily Report policy has false)
                cb(true, '');
            }

        }//checkinDailyProgress



        function saveFirebaseCheckInOut(groupObj, checkoutFlag, locationObj, Policy, teamLocationTitle, cb){
            // groupObj = {groupId: '', subgroupId: '', userId: ''}
            var multipath = {};
            var dated = fireTimeStamp;
            var ref = firebaseService.getRefMain();         //firebase main reference
            var refGroup = firebaseService.getRefGroups();  //firebase groups reference
            var refSubGroup = firebaseService.getRefSubGroups();  //firebase groups reference

            //generate key
            var newPostRef = firebaseService.getRefsubgroupCheckinRecords().child(groupObj.groupId).child(groupObj.subgroupId).child(groupObj.userId).push();
            var newPostKey = newPostRef.key();

            var checkinMessage = (checkoutFlag) ? "Checked-out" : "Checked-in";
            var checkinResultMsg = (checkoutFlag) ? "Checkout Successfully" : "Checkin Successfully";
            var statusType = (checkoutFlag) ? 2 : 1;
            var _teamLocationTitle = (teamLocationTitle ? teamLocationTitle : 'Other');
            multipath["subgroup-check-in-records/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId+"/"+newPostKey] = {
                "identified-location-id": _teamLocationTitle,
                "location": {
                    "lat": locationObj.lat,
                    "lon": locationObj.lng
                },
                "message": checkinMessage,
                "source-device-type": 1,
                "source-type": 1,
                "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
            };
            multipath["subgroup-check-in-current-by-user/"+groupObj.userId] = {
                "groupID": groupObj.groupId,
                "source-device-type": 1,
                "source-type": 1,
                "subgroupID": groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
            };
            multipath["subgroup-check-in-current/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId] = {
                "identified-location-id": "Other",
                "location": {
                    "lat": locationObj.lat,
                    "lon": locationObj.lng
                },
                "message": checkinMessage,
                "record-ref": newPostKey,
                "source-device-type": 1,
                "source-type": 1,
                "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
            };
            //multipath["groups/"+groupObj.groupId+"/members-checked-in/count"] = 0;
            refGroup.child(groupObj.groupId).child('members-checked-in/count').once('value', function(snapshot){
                multipath["groups/"+groupObj.groupId+"/members-checked-in/count"] = (checkoutFlag) ? (snapshot.val() - 1) : (snapshot.val() + 1);
                refSubGroup.child(groupObj.groupId).child(groupObj.subgroupId).child('members-checked-in/count').once('value', function(snapshot){
                    multipath["subgroups/"+groupObj.groupId+"/"+groupObj.subgroupId+"/members-checked-in/count"] = (checkoutFlag) ? (snapshot.val() - 1) : (snapshot.val() + 1);
                    ref.update(multipath, function(err){
                        if(err) {
                            // console.log('err', err);
                            cb(false, 'Please contact to your administrator', null);
                        }
                        //checking Daily Progress Report
                        checkinDailyProgress(groupObj, checkoutFlag, Policy, function(rst, mes) {
                            if (rst) {
                                //calling callbAck....
                                cb(true, checkinResultMsg, null);
                            } else {
                                cb(true, checkinResultMsg, mes);
                            }
                        });
                    }); //ref update
                }); //getting and update members-checked-in count - subgroup
            }); //getting and update members-checked-in count - group
        } //saveFirebaseCheckInOut



        return {

            getRefUsers: firebaseService.getRefUsers,
            getRefGroups: firebaseService.getRefGroups,
            getRefUserGroupMemberships: firebaseService.getRefUserGroupMemberships,
            getRefUserSubGroupMemberships: firebaseService.getRefUserGroupMemberships,
            createCurrentRefs: function(groupID, userID) {
                refs.$currentGroupLocations = Firebase.getAsArray(refs.refGroupLocationsDefined.child(groupID));
                refs.refCurrentGroupCheckinCurrent = refs.refGroupCheckinCurrent.child(groupID);

                var userCheckinRecords = refs.refGroupCheckinRecords.child(groupID + '/' + userID);
                refs.$userCheckinRecords = Firebase.getAsArray(userCheckinRecords);
            },
            hasSubGroupCurrentLocation: function(groupID, subGroupID){
                var defer = $q.defer();
                var hasLocation = false;
                // $firebaseArray(refs.refSubGroupLocationsDefined.child(groupID + "/" + subGroupID))
                //     .$loaded().then(function(data){
                //         // console.log(data[0].location)
                //         if(data[0] && data[0].location){
                //             hasLocation = true;
                //             defer.resolve(hasLocation);
                //         }
                //     });
                //
                // refs.refSubGroupLocationsDefined.child(groupID + "/" + subGroupID).on('child_changed', function(snapshot){
                //     // console.log(snapshot.val().location);
                //     if(snapshot.val() && snapshot.val().location){
                //         hasLocation = true;
                //         defer.resolve(hasLocation);
                // }
                // })
                defer.resolve('');
                return defer.promise;
            },
            createCurrentRefsBySubgroup: function(groupID, subgroupID, userID) {
                var defer = $q.defer();
                // getLocation(groupID, subgroupID).then(function(data) {
                //     //refs.$currentSubGroupLocations = Firebase.getAsArray( refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID ) );
                //     refs.$currentSubGroupLocations = $firebaseArray(refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID));
                //     //refs.refCurrentSubGroupCheckinCurrent = refs.refSubGroupCheckinCurrent.child( groupID).child(subgroupID);
                //     var userCheckinRecords = refs.refSubGroupCheckinRecords.child(groupID + '/' + subgroupID + '/' + userID);
                //     refs.$userCheckinRecords = Firebase.getAsArray(userCheckinRecords);
                //     defer.resolve('test');
                // });
                defer.resolve('');
                return defer.promise;
            },
            getRefSubgroupCheckinCurrentByUser: function() {
                return refs.refSubGroupCheckinCurrentByUser;
            },
            getFireAsObject: function(ref) {
                return $firebaseObject(ref);
            },
            getRefGroupLocationsDefined: function(groupID) {
                return refs.refGroupLocationsDefined.child(groupID);
            },
            getRefCheckinCurrent: function() {
                return refs.refGroupCheckinCurrent;
            },
            getRefCheckinCurrentBySubgroup: function() {
                return refs.refSubGroupCheckinCurrent;
            },
            getRefGroupCheckinCurrent: function(groupID) {
                return refs.refGroupCheckinCurrent.child(groupID);
            },
            getRefSubGroupCheckinCurrent: function(userID, groupID, subgroupId) {
                return refs.refSubGroupCheckinCurrent.child(userID + '/' + groupID + '/' + subgroupId);
            },
            getFireCurrentGroupLocations: function() {
                return refs.$currentGroupLocations;
            },
            getFireCurrentSubGroupLocations: function() {
                return refs.$currentSubGroupLocations;
            },
            getFireCurrentSubGroupLocationsObject: function() {
                return refs.$currentSubGroupLocationsObject;
            },
            getFireGroup: function(groupID) {
                var refGroups = this.getRefGroups();
                return this.getFireAsObject(refGroups.child(groupID));
            },
            geoLocationSupport: function() {
                return typeof window.navigator !== 'undefined' && typeof window.navigator.geolocation !== 'undefined';
            },
            getCurrentLocation: function() {
                return $geolocation.getCurrentPosition({
                    timeout: 60000,
                    maximumAge: 250,
                    enableHighAccuracy: true
                });
            },
            updateUserStatusBySubGroup: function(groupID, subgroupId, userID, statusObj, definedLocations, groupObj) {
                var defer = $q.defer();
                var errorCallback = function(err) {
                    defer.reject('error occurred in connecting to the server', err);
                };

                var self = this;

                var identifiedLocation = statusObj.location ? this.getDefinedLocationByLatLng(statusObj.location, definedLocations).$id : 'Other';

                var checkinObj = {

                    'subgroup-url': groupID + '/' + subgroupId,
                    'timestamp': fireTimeStamp,
                    'type': +statusObj.type, // 1 = in, 2 = out
                    'source-type': 1, //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                    'source-device-type': 1, // 1 = Web, 2 = iPhone, 3 = Android
                    //'source-device-address': 'ip address or mobile number',
                    'location': statusObj.location, //not present in case of beacon based check in and out or the user does not select or allow data
                    'identified-location-id': identifiedLocation

                };

                // console.log(checkinObj)

                checkinObj.message = statusObj.message || (statusObj.type == 1 ? 'Checked-in' : 'Checked-out');

                var userCheckinCurrent = refs.refSubGroupCheckinCurrent.child(groupID + '/' + subgroupId + '/' + userID);
                var $userCheckinCurrent = $firebaseObject(userCheckinCurrent);

                $userCheckinCurrent
                    .$loaded()
                    .then(function() {
                        var userCheckinRecordsRef = refs.refSubGroupCheckinRecords.child(groupID + '/' + subgroupId + '/' + userID);
                        var _ref = new Firebase(userCheckinRecordsRef.toString());
                        var _userCheckinREcordsRef = $firebaseArray(_ref);
                        // console.log(checkinObj)
                        _userCheckinREcordsRef.$add(checkinObj)
                            .then(function(snapShot) {
                                var temp = $firebaseObject(refs.refSubGroupCheckinCurrentByUser.child(userID))
                                    .$loaded().then(function(snapshot) {
                                        // console.log('before')
                                        // console.log(snapshot)
                                        snapshot.timestamp = fireTimeStamp;
                                        snapshot.type = statusObj.type; // 1 = in, 2 = out
                                        snapshot.groupID = groupID;
                                        snapshot.subgroupID = subgroupId;
                                        snapshot['source-device-type'] = 1; // 1 = Web, 2 = iPhone, 3 = Android
                                        snapshot['source-type'] = 1; //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                                        // snapshot['record-ref'] = snapShot.key(); //report manjan
                                        // console.log('after')
                                        // console.log(snapshot)
                                        snapshot.$save().then(function(d) {

                                            checkinObj['record-ref'] = snapShot.key();
                                            angular.extend($userCheckinCurrent, checkinObj);
                                            $userCheckinCurrent.$save()
                                                .then(function() {
                                                    self.updateSubGroupCount(groupID, subgroupId, checkinObj.type)
                                                        .then(function() {
                                                            self.updateGroupCount(groupID, checkinObj.type)
                                                                .then(function() {
                                                                    defer.resolve('Status updated successfully.');
                                                            /*self.asyncRecordUserCheckSubGroupActivity(checkinObj, userID, groupID,subgroupId, groupObj, definedLocations)
                                                             .then(function () {
                                                             defer.resolve('Status updated successfully.');
                                                             }, errorCallback);*/
                                                            }, errorCallback);
                                                        }, errorCallback);

                                                }, errorCallback);

                                        }, errorCallback);

                                    }, errorCallback);

                            }, errorCallback);

                    }, errorCallback);

                return defer.promise;
            },
            updateUserStatus: function(groupID, userID, statusObj, definedLocations, groupObj) {
                var defer = $q.defer();
                var errorCallback = function(err) {
                    defer.reject('error occurred in connecting to the server', err);
                };

                var self = this;

                var identifiedLocation = statusObj.location ? this.getDefinedLocationByLatLng(statusObj.location, definedLocations).$id : 'Other';

                var checkinObj = {
                    //id: 'autoGeneratedTimestampBasedRecordID', // from record
                    'group-url': groupID,
                    'timestamp': fireTimeStamp,
                    'type': +statusObj.type, // 1 = in, 2 = out
                    'source-type': 1, //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                    'source-device-type': 1, // 1 = Web, 2 = iPhone, 3 = Android
                    //'source-device-address': 'ip address or mobile number',
                    'location': statusObj.location, //not present in case of beacon based check in and out or the user does not select or allow data
                    'identified-location-id': identifiedLocation
                };

                checkinObj.message = statusObj.message || (statusObj.type == 1 ? 'Checked-in' : 'Checked-out');

                var userCheckinCurrent = refs.refGroupCheckinCurrent.child(groupID + '/' + userID);
                var $userCheckinCurrent = $firebaseObject(userCheckinCurrent);

                $userCheckinCurrent
                    .$loaded()
                    .then(function() {

                        var userCheckinRecordsRef = refs.refGroupCheckinRecords.child(groupID + '/' + userID);
                        var $userCheckinRecords = Firebase.getAsArray(userCheckinRecordsRef);

                        var recRef = $userCheckinRecords.$add(checkinObj);
                        checkinObj.id = recRef.key();

                        angular.extend($userCheckinCurrent, checkinObj);
                        $userCheckinCurrent.$save()
                            .then(function() {
                                self.updateGroupCount(groupID, checkinObj.type)
                                    .then(function() {
                                        self.asyncRecordUserCheckGroupActivity(checkinObj, userID, groupID, groupObj, definedLocations)
                                            .then(function() {
                                                defer.resolve('Status updated successfully.');

                                            }, errorCallback);

                                    }, errorCallback);

                            }, errorCallback);

                    }, errorCallback);

                return defer.promise;
            },
            updateGroupCount: function(groupID, checkinType) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefGroups().child(groupID + '/members-checked-in');
                var $checkin = $firebaseObject(groupCheckedIn);

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ($checkin.count || 0) + (checkinType == 1 ? 1 : -1);
                        $checkin.$save().then(function() {
                            defer.resolve();
                        }, function() {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });

                return defer.promise;
            },
            updateAllSubGroupCount: function(groupID, subgroupID, numberofuser) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefSubGroups().child(groupID + '/' + subgroupID + '/members-checked-in');
                var $checkin = $firebaseObject(groupCheckedIn);

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ($checkin.count || 0) - numberofuser;
                        $checkin.$save().then(function() {
                            defer.resolve();
                        }, function() {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });
                return defer.promise;
            },
            updateSubGroupCount: function(groupID, subgroupID, checkinType) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefSubGroups().child(groupID + '/' + subgroupID + '/members-checked-in');
                var $checkin = $firebaseObject(groupCheckedIn);

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ($checkin.count || 0) + (checkinType == 1 ? 1 : -1);
                        $checkin.$save().then(function() {
                            defer.resolve();
                        }, function() {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });

                return defer.promise;
            },
            asyncRecordUserCheckGroupActivity: function(checkinObj, userID, groupID, groupObj, definedLocations) {
                var deferred = $q.defer();

                var currentUser = userService.getCurrentUser();
                var locationName = this.getLocationName(checkinObj, definedLocations);
                var groupActivityRef = firebaseService.getRefGroupsActivityStreams().child(groupID);

                var actor = {
                    type: 'user',
                    id: userID, //this is the userID, and an index should be set on this
                    email: currentUser.email,
                    displayName: currentUser.firstName + ' ' + currentUser.lastName,
                    image: null
                };

                var object = {
                    type: 'location',
                    id: null,
                    url: null,
                    displayName: locationName,
                    image: null
                };

                var target = {
                    type: 'group',
                    id: groupID, //an index should be set on this
                    url: groupID,
                    displayName: groupObj.title
                };

                var displayName = actor.displayName +
                    (checkinObj.type == 1 ? ' checked-in' : ' checked-out') +
                    ' at "' + locationName +
                    '" location of ' + groupObj.title + '.';

                var activity = {
                    language: 'en',
                    verb: checkinObj.type == 1 ? 'check-in' : 'check-out',
                    published: fireTimeStamp,
                    displayName: displayName,
                    actor: actor,
                    object: object,
                    target: target
                };

                var newActivityRef = groupActivityRef.push();
                newActivityRef.set(activity, function(err) {
                    if (err) {
                        deferred.reject();
                        console.log('error occurred in check-in activity', err);
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = groupActivityRef.child(activityID);
                        activityEntryRef.once('value', function(snapshot) {
                            var timestamp = snapshot.val();
                            newActivityRef.setPriority(0 - timestamp.published, function(error) {
                                if (error) {
                                    deferred.reject();
                                    console.log('error occurred in check-in activity', error);
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });

                return deferred.promise;
            },
            asyncRecordUserCheckSubGroupActivity: function(checkinObj, userID, groupID, subgroupID, groupObj, definedLocations) {
                var deferred = $q.defer();

                var currentUser = userService.getCurrentUser();
                var locationName = this.getLocationName(checkinObj, definedLocations);
                var subGroupActivityRef = firebaseService.getRefSubGroupsActivityStreams().child(groupID + "/" + subgroupID); //"subgroup-activity-streams"

                var actor = {
                    type: 'user',
                    id: currentUser.userID, //this is the userID, and an index should be set on this
                    email: currentUser.email,
                    displayName: currentUser.firstName + ' ' + currentUser.lastName,
                    image: null
                };

                var object = {
                    type: 'location',
                    id: null,
                    url: null,
                    displayName: locationName,
                    image: null
                };

                var target = {
                    type: 'group',
                    id: subgroupID, //an index should be set on this
                    url: subgroupID,
                    displayName: groupObj.title
                };

                var displayName = actor.displayName +
                    (checkinObj.type == 1 ? ' checked-in' : ' checked-out') +
                    ' at "' + locationName +
                    '" location of ' + groupObj.title + '.';

                var activity = {
                    language: 'en',
                    verb: checkinObj.type == 1 ? 'check-in' : 'check-out',
                    published: fireTimeStamp,
                    displayName: displayName,
                    actor: actor,
                    object: object,
                    target: target
                };

                var newActivityRef = subGroupActivityRef.push();
                newActivityRef.set(activity, function(err) {
                    if (err) {
                        deferred.reject();
                        console.log('error occurred in check-in activity', err);
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = subGroupActivityRef.child(activityID);
                        activityEntryRef.once('value', function(snapshot) {
                            var timestamp = snapshot.val();
                            newActivityRef.setPriority(0 - timestamp.published, function(error) {
                                if (error) {
                                    deferred.reject();
                                    console.log('error occurred in check-in activity', error);
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });

                return deferred.promise;
            },
            addLocation: function(groupID, userID, locationObj) {
                var defer = $q.defer();

                var newLocation = {
                    'group-url': groupID,
                    'title': locationObj.title,
                    'type': 1, // 1 = Geo location, 2 = Beacon
                    'location': {
                        'lat': locationObj.lat,
                        'lon': locationObj.lng,
                        'radius': locationObj.radius
                    },
                    'defined-by': userID, //only admins or owners can define a office location
                    'timestamp': fireTimeStamp
                };

                var ref = refs.$currentGroupLocations.$add(newLocation);
                if (ref.key()) {
                    defer.resolve('Location has been added to "' + groupID + '".');
                } else {
                    defer.reject('Error occurred in saving on server.');
                }

                return defer.promise;
            },
            addLocationBySubgroup: function(groupID, subgroupID, userID, locationObj, multiple, recordId) {

                var defer = $q.defer();

                var newLocation = {
                    'subgroup-url': groupID + '/' + subgroupID,
                    'title': locationObj.title,
                    'type': 1, // 1 = Geo location, 2 = Beacon
                    'location': {
                        'lat': locationObj.locationObj.lat,
                        'lon': locationObj.locationObj.lng,
                        'radius': locationObj.locationObj.radius
                    },
                    'defined-by': userID, //only admins or owners can define a office location
                    'timestamp': fireTimeStamp
                };

                var syncRef;
                if (!multiple && refs.$currentSubGroupLocations.length) {
                    //syncRef = refs.$currentSubGroupLocations.$set( refs.$currentSubGroupLocations[0].$id , newLocation)
                    angular.extend(refs.$currentSubGroupLocations[0], newLocation);
                    refs.$currentSubGroupLocations.$save(0)
                        .then(function() {
                            defer.resolve('Location has been added.');
                        }, function() {
                            defer.reject('Error occurred in saving on server.');
                        });

                } else {

                    refs.$currentSubGroupLocations.$add(newLocation)
                        .then(function() {
                            defer.resolve('Location has been added.');
                        }, function() {
                            defer.reject('Error occurred in saving on server.');

                        });
                    /*if( syncRef.key() ){
                        defer.resolve('Location has been added to "' + subgroupID + '".');
                    } else {
                        defer.reject('Error occurred in saving on server.');
                    }*/
                }



                return defer.promise;
            },
            //for Admins: get the predefined location timestampID, from which user checked-in or checked-out.
            getDefinedLocationByLatLng: function(userLoc, definedLocations, radius) {
                var distance, currentLatLon,
                    location, newLocLatLng;

                //setting default in case no location matches.
                location = {
                    title: 'Other',
                    $id: 'Other'
                };

                //if no radius provided to calculate distance. e.g user check-in/out from any location.
                radius = radius || 0;

                newLocLatLng = new L.LatLng(userLoc.lat, userLoc.lon || userLoc.lng);

                angular.forEach(definedLocations, function(definedLoc) {
                    currentLatLon = new L.LatLng(definedLoc.location.lat, definedLoc.location.lon);
                    distance = newLocLatLng.distanceTo(currentLatLon);

                    if (distance <= definedLoc.location.radius + radius) {
                        location = definedLoc;
                    }
                });

                return location;
            },

            //for Admins: get the predefined location name, from which user checked-in or checked-out.
            getLocationName: function(userStatusObj, definedLocations) {

                //handle if no previous check-in found and got null.
                if (!userStatusObj) {
                    return;
                }

                var locationID = 'Other';
                var locID = userStatusObj['identified-location-id'];

                angular.forEach(definedLocations, function(definedLoc) {
                    if (locID === definedLoc.$id) {
                        locationID = definedLoc.title;
                    }
                });

                return locationID;
            },

            getGroupTitle: function(GroupID){
                var title;
                refs.main.child('groups').child(GroupID).once('value', function(snapshot){
                    // console.log(snapshot.val().title)
                    if (snapshot.val()) {
                        title = snapshot.val().title ? snapshot.val().title : '';
                    }
                });
                return title;
            },
            getSubGroupTitle: function(GroupID, subGroupID){
                var title;
                refs.main.child('subgroups').child(GroupID).child(subGroupID).once('value', function(snapshot){
                    console.log('SUB TITLE2', GroupID, subGroupID, snapshot.val().title, snapshot.val())
                    if (snapshot.val()) {
                        title = snapshot.val().title ? snapshot.val().title : '';
                    }
                });
                return title;
            }, //getSubGroupTitle
            getSubGroupTitleCb: function(GroupID, subGroupID, cb){
                refs.main.child('subgroups').child(GroupID).child(subGroupID).once('value', function(snapshot){
                    console.log('SUB TITLE2', GroupID, subGroupID, snapshot.val().title, snapshot.val())
                    if (snapshot.val()) {
                        var title = snapshot.val().title ? snapshot.val().title : '';
                        cb(title);
                    }
                });
            }, //getSubGroupTitle
            ChekinUpdateSatatus: ChekinUpdateSatatus

        }; //return
    } //checkin service function
})();

angular.module('core')
    .directive('groupcardDirective', function () {
    return {
        restrict: 'E',
        scope: {
        	group: '='
        },
        templateUrl: 'directives/groupcardDirective.html'
	};
});

angular.module('core')
    .directive('subgroupcardDirective', function () {
    return {
        restrict: 'E',
        scope: {
        	subgroup: '='
        },
        templateUrl: 'directives/subgroupcardDirective.html',
        controller: function($scope, $stateParams, checkinService) {
        	checkinService.hasSubGroupCurrentLocation($stateParams.groupID, $scope.subgroup.$id).then(function(has){
        		$scope.hasLocation = has;
        	})
        } //controller
	};
});

/**
 * Created by Shahzad on 4/10/2015.
 */

//directive to validate userID asynchronously from server, over singup page.

(function() {
    'use strict';

    angular
        .module('core')
        .directive("checkUserId", checkUserId)
        .directive("checkUserPassword", checkUserPassword);

    checkUserId.$inject = ['$http', '$q', 'appConfig'];

    function checkUserId($http, $q, appConfig) {

        //hits a GET to server, to check userID availability.
        var asyncCheckUserId = function(modelValue) {
            var defer = $q.defer();

            $http.get(appConfig.apiBaseUrl + '/api/checkuserid/' + modelValue)
                .success(function(data) {
                    if (data.statusCode === 1) {
                        defer.resolve();
                    } else if (data.statusCode === 2) {
                        defer.reject();
                    } else {
                        defer.resolve();
                    }
                })
                .error(function(data) {
                    //handle this case
                    defer.resolve();
                });

            return defer.promise;
        };

        return {
            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {

                ngModel.$asyncValidators.checkUserId = asyncCheckUserId;
            }
        };
    }

    function checkUserPassword($http, $q, appConfig) {
        var el;

        //hits a GET to server, to check userID availability.
        var asyncCheckUserPassword = function(modelValue) {
            var defer = $q.defer();
            var dataToCheck = {
                userID: el.scope().personalSettings.userData.$id,
                password: modelValue
            }
            if (modelValue) {
                $http.post(appConfig.apiBaseUrl + '/api/checkpassword', dataToCheck)
                    .success(function(data) {
                        console.log('1', data);
                        if (data.statusCode === 1) {
                            defer.resolve();

                        } else {
                            defer.reject();
                        }
                    })
                    .error(function(data) {
                        console.log('2', data);
                        //handle this case
                        defer.reject();
                    });
            }
            return defer.promise;
        };

        return {
            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {
                //debugger
                el = element;
                ngModel.$asyncValidators._oldPassword = asyncCheckUserPassword;
            }
        };
    }

})();

/**
 * Created by Shahzad on 4/10/2015.
 */

//Can be used to validate form fields for confirmPassword, confirmEmail and etc.

(function() {
    'use strict';

    angular
        .module('core')
        .directive("compareTo", compareTo)
        .directive("compareToo", compareToo)
        .directive("compareAgainst", compareAgainst);

    function compareTo() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function(modelValue) {
                    console.log(modelValue);
                    if(modelValue) {
                      return modelValue !== scope.otherModelValue;
                    } else {
                       return true
                    }
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }

    function compareToo() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareToo"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareToo = function(modelValue) {
                  return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }

    function compareAgainst() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareAgainst"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareAgainst = function(modelValue) {
                    if(modelValue) {
                      return modelValue !== scope.otherModelValue;
                    } else {
                       return true
                    }
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }

})();

/**
 * Created by Shahzad on 4/10/2015.
 */

//directive to validate userID asynchronously from server, over singup page.

(function() {
    'use strict';

    angular
        .module('core')
        .directive("checkGroupExistance", checkGroupExistance);

    checkGroupExistance.$inject = ['firebaseService', '$q', 'appConfig'];

    function checkGroupExistance(firebaseService, $q, appConfig) {
        var path;
        //hits a GET to server, to check userID availability.
        var asyncCheckGroupExistance = function(modelValue, b, v) {
            var defer = $q.defer();

            firebaseService.asyncCheckIfGroupExists(setChild(modelValue)).then(function(response) {
                if (response.exists) {
                    defer.reject(); // reject if group already exixts
                } else {
                    defer.resolve()
                }
            });
            return defer.promise;
        };

        function setChild(modelValue) {
            if (path) {
                return path + '/' + modelValue
            } else {
                return modelValue
            }

        }
        return {

            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {
                path = attributes['grouppath']
                ngModel.$asyncValidators.checkGroupExistance = asyncCheckGroupExistance;
            }
        };
    }

})();

/**
 * Created by ZiaKhan on 05/12/14.
 */

// Invoke 'strict' JavaScript mode
'use strict';

// Set the main application name
//var mainApplicationModuleName = 'Panacloud.WOW';// Theory behind this software: http://hq.teamfit.co/its-a-team-of-teams-world-now/
var mainApplicationModuleName = 'myApp';// Theory behind this software: http://hq.teamfit.co/its-a-team-of-teams-world-now/
var mainApplicationModule = angular.module(mainApplicationModuleName, [
    'components',
    'core'


]).run(['authService',function(authService){
    // alert('run');
    // authService.resolveUserPage();
}]);
mainApplicationModule.value('appConfig', {
    'apiBaseUrl': 'https://teamofteams.herokuapp.com',
    //'apiBaseUrl': 'http://localhost:3000',
    'myFirebase': 'https://panacloud.firebaseio.com',
    'firebaseAuth': false,
    'serverPostApi':{
        userProfilePictureUpload:'api/groupProfilepicture',
        groupProfilePictureUpload:'api/groupProfilepicture'
    }
});

// Configure the hashbang URLs using the $locationProvider services
/*mainApplicationModule.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);*/

/*
mainApplicationModule.config (['$componentLoaderProvider', '$locationProvider', function ($componentLoaderProvider, $locationProvider) {
    $componentLoaderProvider.setTemplateMapping(function (name) {
        var dashName = dashCase(name);
        return '/components/' + dashName + '/' + dashName + '.html';
    });
    $locationProvider.hashPrefix('!');
}])
*/
/*
mainApplicationModule.config (['$locationProvider', function ($locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}])
*/

// mainApplicationModule.constant('angularMomentConfig', {
//     preprocess: 'unix' // optional https://github.com/urish/angular-moment
// });

// Fix Facebook's OAuth bug
//if (window.location.hash === '#_=_') window.location.hash = '#!';

// // Manually bootstrap the AngularJS application
// angular.element(document).ready(function() {
//     angular.bootstrap(document, [mainApplicationModuleName]);
// });

/**
 * Created by Shahzad on 5/21/2015.
 */

(function() {
  'use strict';
  angular.module("myApp")
    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
      // alert('config')
      $locationProvider.html5Mode(true).hashPrefix('!');
      var navLoginbar = {
        templateUrl: 'components/nav-loginbar/nav-loginbar.html',
        controller: 'NavLoginbarController',
        controllerAs: 'navLoginbar'
      };
      var navToolbar = {
        templateUrl: 'components/nav-toolbar/nav-toolbar.html',
        controller: 'NavToolbarController',
        controllerAs: 'navToolbar'
      };
      $stateProvider.state('home', {
        url: '/',
        views: {
          'nav': navLoginbar,
          'main': {
            templateUrl: 'components/home/home.html',
            controller: 'HomeController',
            controllerAs: 'home'
          }
        }
      });
      $stateProvider.state('signin', {
        url: '/signin',
        views: {
          'nav': navLoginbar,
          'main': {
            templateUrl: 'components/signin/signin.html',
            controller: 'SigninController',
            controllerAs: 'signin'
          }
        },
        resolve: {
          user: function($state, userService) {
            return userService.getUserPresenceFromLocastorage();
          }
        }
      });
      $stateProvider.state('forgot', {
        url: '/forgot',
        views: {
          'nav': navLoginbar,
          'main': {
            templateUrl: 'components/forgot/forgot.html',
            controller: 'ForgotController',
            controllerAs: 'forgot'
          }
        }
      });
      $stateProvider.state('signup', {
        url: '/signup',
        views: {
          'nav': navLoginbar,
          'main': {
            templateUrl: 'components/sign-up/sign-up.html',
            controller: 'SignUpController',
            controllerAs: 'signUp'
          }
        }
      });
      $stateProvider.state('user', {
        // url: '/user',
        abstract: true,
        views: {
          'nav': navToolbar,
          'main': {
            template: '<ui-view></ui-view>'
          }
        },
        resolve: {
          resolveuser: function(authService) {
            return authService.resolveUserPage();
          }
        }
      });
      $stateProvider.state('user.dashboard', {
        url: '/user/:userID',
        templateUrl: 'components/user/user.html',
        controller: 'UserController',
        controllerAs: 'user',
        resolve: {
          resolvedashboard: function(authService, $stateParams) {
            return authService.resolveDashboard($stateParams.userID);
          }
        }
      });
      $stateProvider.state('user.personal-settings', {
        url: '/profile/:userID',
        templateUrl: 'components/personal-settings/personal-settings.html',
        controller: 'PersonalSettingsController',
        controllerAs: 'personalSettings',
      });
      $stateProvider.state('user.join-group', {
        url: '/search',
        templateUrl: 'components/join-group/join-group.html',
        controller: 'JoinGroupController',
        controllerAs: 'joinGroup'
      });
      $stateProvider.state('user.create-group', {
        url: '/create',
        templateUrl: 'components/create-group/create-group.html',
        controller: 'CreateGroupController',
        controllerAs: 'createGroup'
      });
      $stateProvider.state('user.group', {
        url: '/:groupID',
        templateUrl: 'components/group/group.html',
        controller: 'GroupController',
        controllerAs: 'group'
      });
      $stateProvider.state('user.group.activity', {
        url: '/tab/activity',
        templateUrl: 'components/activity/activity.html',
        controller: 'ActivityController',
        controllerAs: 'activity',
      });
      $stateProvider.state('user.group.subgroup-activity', {
        url: '/:subgroupID/tab/activity',
        templateUrl: 'components/activity/activity.html',
        controller: 'ActivityController',
        controllerAs: 'activity',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      $stateProvider.state('user.group.report', {
        url: '/tab/report',
        templateUrl: 'components/report/report.html',
        controller: 'ReportController',
        controllerAs: 'report',
      });
      $stateProvider.state('user.group.subgroup-report', {
        url: '/:subgroupID/tab/report',
        templateUrl: 'components/report/report.html',
        controller: 'ReportController',
        controllerAs: 'report',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      $stateProvider.state('user.group.manualattendace', {
        url: '/tab/manualattendace',
        templateUrl: 'components/manualattendace/manualattendace.html',
        controller: 'ManualAttendaceController',
        controllerAs: 'manualattendace',
      });
      $stateProvider.state('user.group.subgroup-manualattendace', {
        url: '/:subgroupID/tab/manualattendace',
        templateUrl: 'components/manualattendace/manualattendace.html',
        controller: 'ManualAttendaceController',
        controllerAs: 'manualattendace',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      $stateProvider.state('user.group.progressreport', {
        url: '/tab/progressreport',
        templateUrl: 'components/progressreport/progressreport.html',
        controller: 'ProgressReportController',
        controllerAs: 'progressreport',
      });
      $stateProvider.state('user.group.subgroup-progressreport', {
        url: '/:subgroupID/tab/progressreport?u',
        templateUrl: 'components/progressreport/progressreport.html',
        controller: 'ProgressReportController',
        controllerAs: 'progressreport',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      $stateProvider.state('user.group.chat', {
        url: '/tab/chat?channelID?channelTitle',
        templateUrl: 'components/chat/chat.html',
        controller: 'ChatController',
        controllerAs: 'chat',
      });
      $stateProvider.state('user.group.subgroup-chat', {
        url: '/:subgroupID/tab/chat?channelID?channelTitle',
        templateUrl: 'components/chat/chat.html',
        controller: 'ChatController',
        controllerAs: 'chat',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      // firepad States
      $stateProvider.state('user.group.collaborator', {
        url: '/tab/collaborator?docID',
        templateUrl: 'components/collaborator/collaborator.html',
        controller: 'CollaboratorController',
        controllerAs: 'collaborator',
      });
      $stateProvider.state('user.group.subgroup-collaborator', {
        url: '/:subgroupID/tab/collaborator?docID',
        templateUrl: 'components/collaborator/collaborator.html',
        controller: 'CollaboratorController',
        controllerAs: 'collaborator',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      // end firepad states
      $stateProvider.state('user.group.membershipcard', {
        url: '/tab/membershipcard',
        templateUrl: 'components/membershipcard/membershipcard.html',
        controller: 'MembershipcardController',
        controllerAs: 'membershipcard',
      });
      $stateProvider.state('user.group.subgroup-membershipcard', {
        url: '/:subgroupID/tab/membershipcard',
        templateUrl: 'components/membershipcard/membershipcard.html',
        controller: 'MembershipcardController',
        controllerAs: 'membershipcard',
        resolve: {
            getsubgroupID : function(groupService, $stateParams){
                groupService.setSubgroupIDPanel($stateParams.subgroupID);
            }
        }
      });
      $stateProvider.state('user.edit-group', {
        url: '/:groupID/setting/edit',
        templateUrl: 'components/edit-group/edit-group.html',
        controller: 'EditGroupController',
        controllerAs: 'editGroup'
      });
      $stateProvider.state('user.user-setting', {
        url: '/:groupID/setting/members',
        templateUrl: 'components/user-setting/user-setting.html',
        controller: 'UserSettingController',
        controllerAs: 'userSetting'
      });
      $stateProvider.state('user.create-subgroup', {
        url: '/:groupID/setting/teams',
        templateUrl: 'components/create-sub-group/create-sub-group.html',
        controller: 'CreateSubGroupController',
        controllerAs: 'createSubGroup'
      });
      $stateProvider.state('user.policy', {
        url: '/:groupID/setting/policies',
        templateUrl: 'components/policy/policy.html',
        controller: 'PolicyController',
        controllerAs: 'policy',
      });
      $stateProvider.state('user.create-channels', {
        url: '/:groupID/create-channels',
        templateUrl: 'components/create-channels/create-channels.html',
        controller: 'CreateChannelsController',
        controllerAs: 'createChannels'
      });
      $stateProvider.state('user.create-teams-channels', {
        url: '/:groupID/:teamID/create-teams-channels',
        templateUrl: 'components/create-teams-channels/create-teams-channels.html',
        controller: 'CreateTeamsChannelsController',
        controllerAs: 'createTeamsChannels'
      });
      $stateProvider.state('user.quiz', {
        url: '/:userID/quiz',
        templateUrl: 'components/quiz/quiz.html',
        controller: 'QuizController',
        controllerAs: 'quiz'
      });
      $stateProvider.state('user.group-subgroup', {
        url: '/:groupID/:subgroupID',
        templateUrl: 'components/group/group.html',
        controller: 'GroupController',
        controllerAs: 'group'
      });
      $urlRouterProvider.otherwise('/');
    })
    .controller('AppController', ['$rootScope', 'authService', AppController]);

  function AppController($router) {}
})();