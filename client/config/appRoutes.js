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
                    user: function($state, userService){
                        // return userService.getUserPresenceFromLocastorage()
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
                        template: '<div ui-view></div>'
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
            $stateProvider.state('user.profile', {
                url: '/profile/:userID',
                // templateUrl: 'components/user/user.html',
                template: '<h1>Profile</h1>'
                // controller: 'UserController',
                // controllerAs: 'user',
            });
            $stateProvider.state('user.join-group', {
                url: '/join-group',
                templateUrl: 'components/join-group/join-group.html',
                controller: 'JoinGroupController',
                controllerAs: 'joinGroup'
            });
            $stateProvider.state('user.group', {
                url: '/:groupID',
                templateUrl: 'components/group/group.html',
                controller: 'GroupController',
                controllerAs: 'group'
            });
            $stateProvider.state('user.create-group', {
                url: '/:userID/create-group',
                templateUrl: 'components/create-group/create-group.html',
                controller: 'CreateGroupController',
                controllerAs: 'createGroup'
            });
            $stateProvider.state('user.edit-group', {
                url: '/:groupID/edit-group',
                templateUrl: 'components/edit-group/edit-group.html',
                controller: 'EditGroupController',
                controllerAs: 'editGroup'
            });
            $stateProvider.state('user.create-subgroup', {
                url: '/:groupID/create-subgroup',
                templateUrl: 'components/create-sub-group/create-sub-group.html',
                controller: 'CreateSubGroupController',
                controllerAs: 'createSubGroup'
            });
            /*$stateProvider.state('user.subgroup', {
                url: '/:groupID/subgroup',
                templateUrl: 'components/subgroup/subgroup.html',
                controller: 'SubgroupController',
                controllerAs: 'subgroup'
            });*/
            $stateProvider.state('user.geo-fencing', {
                url: '/:groupID/geo-fencing',
                templateUrl: 'components/geo-fencing/geo-fencing.html',
                controller: 'GeoFencingController',
                controllerAs: 'geoFencing'
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
            $stateProvider.state('user.user-setting', {
                url: '/:groupID/user-setting',
                templateUrl: 'components/user-setting/user-setting.html',
                controller: 'UserSettingController',
                controllerAs: 'userSetting'
            });
            $stateProvider.state('user.personal-settings', {
                url: '/:userID/personal-settings',
                templateUrl: 'components/personal-settings/personal-settings.html',
                controller: 'PersonalSettingsController',
                controllerAs: 'personalSettings',
            });
            $stateProvider.state('user.quiz', {
                url: '/:userID/quiz',
                templateUrl: 'components/quiz/quiz.html',
                controller: 'QuizController',
                controllerAs: 'quiz'
            });
            $urlRouterProvider.otherwise('/');
        })
        .controller('AppController', ['$rootScope', 'authService', AppController]);

    function AppController($router) {}
})();

/*
    AppController.$routeConfig = [{
        // Define url for this route
        path: '/',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navLoginbar',
            'main': 'home'
        }
    }, {
        // Define url for this route
        path: '/signin',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navLoginbar',
            'main': 'signin'
        }
    }, {
        // Define url for this route
        path: '/forgotpassword',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navLoginbar',
            'main': 'forgot'
        }
    }, {
        // Define url for this route
        path: '/signup',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navLoginbar',
            'main': 'signUp'
        }
    }, {
        // Define url for this route
        path: '/user/:userID',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'user'
        }

    }, {
        // Define url for this route
        path: '/user/:userID/create-group',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'createGroup'
        }

    }, {
        // Define url for this route
        path: '/pages/group/:groupID',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'group'
        }

    }, {
        // Define url for this route
        path: '/pages/group/:groupID/create-subgroup',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'createSubGroup'
        }

    }, {
        // Define url for this route
        path: '/pages/group/:groupID/subgroup',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'subgroup'
        }

    }, {
        // Define url for this route
        path: '/pages/joinGroup',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'joinGroup'
        }

    }, {
        // Define url for this route
        path: '/pages/personalSettings',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'personalSettings'
        }

    }, {
        // Define url for this route
        path: '/pages/group/:groupID/user-setting',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'userSetting'
        }
    }, {
        // Define url for this route
        path: '/pages/group/:groupID/edit-group',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'editGroup'
        }
    }, {
        // Define url for this route
        path: '/pages/group/:groupID/geoFencing',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'geoFencing'
        }
    }, {
        // Define url for this route
        path: '/pages/group/:groupID/create-channels',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'createChannels'
        }
    }, {
        // Define url for this route
        path: '/pages/group/:groupID/:teamID/create-teams-channels',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'createTeamsChannels'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quiz'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizAddBook',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAddBook'
        }


    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizAddChapter/:id',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAddChapter'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizAddTopic/:id',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAddTopic'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizAddQuestion/:id',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAddQuestion'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizCreate',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizCreate'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizAttempt',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAttempt'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quiz-attempting',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAttempting'
        }
    }, {
        // Define url for this route
        path: '/pages/group/:groupID/quizAttempt',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAttempt'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizAssign',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizAssign'
        }
    }, {
        // Define url for this route
        path: '/user/:userID/quiz/quizResult',

        // Map components to viewports for this route
        components: {

            // Load home component in main viewport
            'nav': 'navToolbar',
            'main': 'quizResult'
        }
    }]
*/
//function AppController($router) {


/*            $router.config([
                {
                    // Define url for this route
                    path: '/',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navLoginbar',
                        'main': 'home'
                    }
                },
                {
                    // Define url for this route
                    path: '/signin',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navLoginbar',
                        'main': 'signin'
                    }
                },
                {
                    // Define url for this route
                    path: '/forgotpassword',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navLoginbar',
                        'main': 'forgot'
                    }
                },
                {
                    // Define url for this route
                    path: '/signup',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navLoginbar',
                        'main': 'signup'
                    }
                },
                {
                    // Define url for this route
                    path: '/user/:userID',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'user'
                    }

                },
                {
                    // Define url for this route
                    path: '/user/:userID/create-group',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'createGroup'
                    }

                },
                {
                    // Define url for this route
                    path: '/pages/group/:groupID',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'group'
                    }

                },
                {
                    // Define url for this route
                    path: '/pages/group/:groupID/create-subgroup',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'createSubGroup'
                    }

                },
                {
                    // Define url for this route
                    path: '/pages/group/:groupID/subgroup',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'subgroup'
                    }

                },
                {
                    // Define url for this route
                    path: '/pages/joinGroup',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'joinGroup'
                    }

                },
                {
                    // Define url for this route
                    path: '/pages/personalSettings',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'personalSettings'
                    }

                },{
                    // Define url for this route
                    path: '/pages/group/:groupID/user-setting',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'userSetting'
                    }
                },
                {
                    // Define url for this route
                    path: '/pages/group/:groupID/edit-group',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'editGroup'
                    }
                },
                {
                    // Define url for this route
                    path: '/pages/group/:groupID/geoFencing',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'geoFencing'
                    }
                },
                {
                    // Define url for this route
                    path: '/pages/group/:groupID/create-channels',

                    // Map components to viewports for this route
                    components: {

                        // Load home component in main viewport
                        'nav': 'navToolbar',
                        'main': 'createChannels'
                    }
                }
            ]);*/
// }
/* AppController.prototype.canActivate =function(){
     alert('IM mainCtrl');
     return authService.resolveUserPage();
 }*/


// })();
