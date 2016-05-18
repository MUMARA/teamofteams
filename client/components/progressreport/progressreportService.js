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
				.on("value", function (snapshot) {
					console.log('watch', snapshot.key(), snapshot.val());
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
			console.log('watch', report.reportID)
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
