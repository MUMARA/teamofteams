/**
 * Created on 2/2/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport', ['core'])
    .factory('ProgressReportService', ['firebaseService', ProgressReportService]);
    function ProgressReportService(firebaseService) {

    	var dailyProgressReport = [];

    	//getting daily progress report
    	function getReports(userArray, groupID, subgroupID){
    		if(subgroupID){
	    		userArray.forEach(function(val, indx){
	    			if(val.groupID == groupID && val.subgroupID == subgroupID) {
						getSubGroupReportFromFirebase(val, groupID, subgroupID, 10);
					}
	    		});
    		} else {
    			userArray.forEach(function(val, indx){
	    			if(val.groupID == groupID) {
						getGroupReportFromFirebase(val, groupID, 10);
					}
	    		});
    		}
    	} //getReports
		function getReportQuestion(groupID, subgroupID, questionID, ObjectIndex){
			firebaseService.getRefSubgroupPolicies().child(groupID).child(subgroupID).once('value', function(policyObj){
				if(policyObj.val() && policyObj.val().hasPolicy === true){
					firebaseService.getRefPolicies().child(groupID).child(policyObj.val().policyID).child('progressReportQuestions').child(questionID)
					.once('value', function(snapshot){
						if(snapshot.val()){
							// console.log('questions', snapshot.val().questions, snapshot.key(), snapshot.val().questions);
							//adding questions into dailyProgressReport object of user report
							dailyProgressReport.forEach(function(val, index){
								if(val.reportID == ObjectIndex){
									dailyProgressReport[index]['questions'] = snapshot.val().questions;
								}
							});
						}
					});
				}
			});
		}//getReportQuestion
    	function getSubGroupReportFromFirebase(user, groupID, subgroupID, limit){
    		firebaseService.getRefDailyProgressReport().child(user.id).child(groupID).child(subgroupID).orderByChild("date").limitToLast(limit)
    		.on("value", function(snapshot){
    			var _flag = false;
				// console.log('key', snapshot.key());
				// console.log('val', snapshot.val());

    			if(dailyProgressReport.length > 0) {
					dailyProgressReport.forEach(function(val, index) {
						if(snapshot.val()) {
							for(var key in snapshot.val()) {
								console.log(val.reportID, key)
								if(val.reportID === key) {
									//getReportQuestion(groupID, subgroupID, dailyProgressReport[index]['questionID'], null);
									dailyProgressReport[index]['answers'] = snapshot.val()[key]['answers'];
									_flag = true;
									break;
								}
							}
						}

						if(_flag) {
							return;
						}

						if(dailyProgressReport.length == index+1) {
							if(snapshot.val()) {
								var obj = {};
								for(var key in snapshot.val()) {
									obj = snapshot.val()[key];
									obj['reportID'] = key;
									obj['userID'] = user.id;
									obj['fullName'] = user.fullName;
									obj['profileImage'] = user.profileImage;
									obj['groupID'] = user.groupID;
									obj['subgroupID'] = user.subgroupID;
                                    getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);
									dailyProgressReport.push(obj);
								}
							}
						}

					});

    			} else {
    				if(snapshot.val()) {
						var obj = {};
						for(var key in snapshot.val()) {
							console.log('subkey', key)
							obj = snapshot.val()[key];
							obj['reportID'] = key;
							obj['userID'] = user.id;
							obj['fullName'] = user.fullName;
							obj['profileImage'] = user.profileImage;
							obj['groupID'] = user.groupID;
							obj['subgroupID'] = user.subgroupID;
                            getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);
							dailyProgressReport.push(obj);
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
    		// console.log(report)
    		firebaseService.getRefDailyProgressReport().child(report.userID).child(report.groupID).child(report.subgroupID).child(report.reportID).update({'answers': report.answers}, function(err){
				if(err){
					console.log('err', err)
					cb(false);
				}

				cb(true);

    		});
    	} //updateReport
    	function getGroupReports(userArray, groupID){
    		userArray.forEach(function(val, indx){
    			if(val.groupID == groupID) {
					getGroupReportFromFirebase(val, groupID, 10);
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
                                        getReportQuestion(user.groupID, k, snapshot.val()[k][key]['questionID'], key);
                                        dailyProgressReport.push(obj);
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
                                getReportQuestion(user.groupID, k, snapshot.val()[k][key]['questionID'], key);
                                dailyProgressReport.push(obj);

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

    	function getSingleSubGroupReport(user, groupID, subgroupID){
    		dailyProgressReport = [];
    		getSubGroupReportFromFirebase(user, groupID, subgroupID, 1);
    		return dailyProgressReport;

    	} //getSingleSubGroupReport


        return {
        	getSubGroupDailyProgressReport: getSubGroupDailyProgressReport,
        	updateReport: 					updateReport,
        	getGroupDailyProgressReport: 	getGroupDailyProgressReport,
        	getSingleSubGroupReport: 		getSingleSubGroupReport
        }
    }; //ProgressReportService
})();
