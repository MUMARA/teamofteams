/**
 * Created on 2/2/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport', ['core'])
    .factory('ProgressReportService', ['activityStreamService', 'firebaseService', ProgressReportService]);
    function ProgressReportService(activityStreamService, firebaseService) {

    	var dailyProgressReport = [];

    	//getting daily progress report
    	function getReports(userArray, groupID, subgroupID){
    		if(subgroupID){
	    		userArray.forEach(function(val, indx){
	    			if(val.groupID == groupID && val.subgroupID == subgroupID) {
						getSubGroupReportFromFirebase(val, groupID, subgroupID, 1);
					}
	    		});
    		} else {
    			userArray.forEach(function(val, indx){
	    			if(val.groupID == groupID) {
						getGroupReportFromFirebase(val, groupID, 1);
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
							//console.log('questions', snapshot.val().questions, snapshot.key(), snapshot.val().questions);
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
								// console.log(val.reportID, key)
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
    				if(snapshot.val()) {
						var obj = {};
						for(var key in snapshot.val()) {
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
    		// console.log('report', report)
    		firebaseService.getRefDailyProgressReport().child(report.userID).child(report.groupID).child(report.subgroupID).child(report.reportID).update({'answers': report.answers}, function(err){
				if(err){
					// console.log('err', err)
					cb(false);
				} else {

                    //for group activity stream record -- START --
                    var type = 'progressReport';
                    var targetinfo = {id: report.reportID, url: report.groupID+'/'+report.subgroupID, title: report.groupID+'/'+report.subgroupID, type: 'progressReport' };
                    var area = {type: 'progressReport-updated'};
                    var group_id = report.groupID+'/'+report.subgroupID;
                    var memberuserID = report.userID;
                    var _object = null;
                    //for group activity record
                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, _object);
                    //for group activity stream record -- END --

                    cb(true);
                }
    		});
    	} //updateReport
    	function getGroupReports(userArray, groupID){
    		userArray.forEach(function(val, indx){
    			if(val.groupID == groupID) {
					getGroupReportFromFirebase(val, groupID, 1);
				}
    		});
    	}
			function getGroupReportByDateFromFirebase(user, groupID, subgroupID,startDate ,endDate) {

					firebaseService.getRefDailyProgressReport().child(user.id).child(groupID).child(subgroupID).orderByChild("date").startAt(startDate.setHours(0,0,0,0)).endAt(endDate.setHours(23,59,59,0))
						.on("value", function(snapshot){
						if(snapshot.val()){

						var _flag = false;
					// console.log('key', snapshot.key());
					// console.log('val', snapshot.val());

						if(dailyProgressReport.length > 0) {
						dailyProgressReport.forEach(function(val, index) {
							if(snapshot.val()) {
								for(var key in snapshot.val()) {
									// console.log(val.reportID, key)
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
										dailyProgressReport.push(obj);
										getReportQuestion(groupID, subgroupID, snapshot.val()[key]['questionID'], key);

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

    	function getSingleSubGroupReport(user, groupID, subgroupID){
    		dailyProgressReport = [];
    		getSubGroupReportFromFirebase(user, groupID, subgroupID, 1);
    		return dailyProgressReport;

    	} //getSingleSubGroupReport

     function getGroupReportByDates(userArray, groupID,startDate ,endDate) {
			 //console.log(userArray);
			  dailyProgressReport = [];
				userArray.forEach(function(val, indx){
				//	console.log(val)
					if(val.groupID == groupID) {
						getGroupReportByDateFromFirebase(val, groupID, val.subgroupID,startDate ,endDate);
					}
				})

		 	 return dailyProgressReport;
		 }
        return {
        	getSubGroupDailyProgressReport: getSubGroupDailyProgressReport,
        	updateReport: 					updateReport,
        	getGroupDailyProgressReport: 	getGroupDailyProgressReport,
        	getSingleSubGroupReport: 		getSingleSubGroupReport,
			getGroupReportByDates : 		getGroupReportByDates
        }
    }; //ProgressReportService
})();
