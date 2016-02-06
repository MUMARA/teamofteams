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
						getSubGroupReportFromFirebase(val, groupID, subgroupID);
					}
	    		});
    		} else {
    			userArray.forEach(function(val, indx){
	    			if(val.groupID == groupID) {
						getGroupReportFromFirebase(val, groupID);
					}
	    		});
    		}
    	} //getReports
    	function getSubGroupReportFromFirebase(user, groupID, subgroupID){
    		firebaseService.getRefDailyProgressReport().child(user.id).child(groupID).child(subgroupID).orderByChild("date").limitToLast(10)
    		.on("value", function(snapshot){
    			var _flag = false;
				// console.log('key', snapshot.key());
				// console.log('val', snapshot.val());
    			
    			if(dailyProgressReport.length > 0) {

					dailyProgressReport.forEach(function(val, index) {
						if(snapshot.val()) {
							for(var key in snapshot.val()) {
								if(val.reportID == key) {
									console.log(val.reportID, key)
									dailyProgressReport[index]['answers'] = snapshot.val()[key]['answers'];
									_flag = true;
									break;
								}
							}
						}

						if(_flag) {
							return
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
								}
							}
						}

					});

    			} else {
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
					getGroupReportFromFirebase(val, groupID);
				}
    		});
    	}
    	function getGroupReportFromFirebase(user, groupID){
    		firebaseService.getRefDailyProgressReport().child(user.id).child(groupID).orderByChild("date").limitToLast(10)
    		.on("value", function(snapshot){
    			var _flag = false;
    			
    			if(dailyProgressReport.length > 0) {

					dailyProgressReport.forEach(function(val, index) {
						if(snapshot.val()) {
							for(var k in snapshot.val()) {
								for(var key in snapshot.val()[k]) {
									// console.log('Obj', snapshot.val()[k][key], key);
									if(val.reportID == key) {
									dailyProgressReport[index]['answers'] = snapshot.val()[k][key]['answers'];
									_flag = true;
									break;
								}
								}
								
							}
						}

						if(_flag) {
							return
						}

						if(dailyProgressReport.length == index+1) {
							if(snapshot.val()) {
								var obj = {};
								for(var k in snapshot.val()) {
									for(var key in snapshot.val()[k]){
										obj = snapshot.val()[k][key];
										obj['reportID'] = key;
										obj['userID'] = user.id;
										obj['fullName'] = user.fullName;
										obj['profileImage'] = user.profileImage;
										obj['groupID'] = user.groupID;
										obj['subgroupID'] = user.subgroupID;
										dailyProgressReport.push(obj);

									}
									
								}
							}
						}

					});

    			} else {
    				if(snapshot.val()) {
						var obj = {};
						for(var k in snapshot.val()) {
							for(var key in snapshot.val()[k]){
								obj = snapshot.val()[k][key];
								obj['reportID'] = key;
								obj['userID'] = user.id;
								obj['fullName'] = user.fullName;
								obj['profileImage'] = user.profileImage;
								obj['groupID'] = user.groupID;
								obj['subgroupID'] = user.subgroupID;
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

        return {
        	getSubGroupDailyProgressReport: getSubGroupDailyProgressReport,
        	updateReport: updateReport,
        	getGroupDailyProgressReport: getGroupDailyProgressReport
        }
    }; //ProgressReportService
})();
