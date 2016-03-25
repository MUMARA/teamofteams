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