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
    		userArray.forEach(function(val, indx){
    			if(val.groupID == groupID && val.subgroupID == subgroupID) {
    				console.log('true');
					getFromFirebase(val, groupID, subgroupID);
				}
    		});
    	}
    	function getFromFirebase(user, groupID, subgroupID){
    		firebaseService.getRefDailyProgressReport().child(user.id).child(groupID).child(subgroupID).orderByChild("date").limitToLast(10)
    		.on("value", function(snapshot){
				console.log('key', snapshot.key());
				console.log('val', snapshot.val());
    			
    			if(dailyProgressReport.length > 0) {

					dailyProgressReport.forEach(function(val, index) {
						console.log('ssdssssssssss');
						if(snapshot.val()) {
							for(var key in snapshot.val()) {
								if(val.reportID == key) {
									dailyProgressReport[index]['answers'] = snapshot.val()[key]['answers'];
									return dailyProgressReport;
								}
							}
						}

						if(dailyProgressReport.length == index+1) {
							console.log('xxxxxxxxxxxxxx');
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
    	}
    	function getDailyProgressReport(userArray, groupID, subgroupID) {
    		dailyProgressReport = [];
    		getReports(userArray, groupID, subgroupID);
    		return dailyProgressReport;
    	}
    	function updateReport(report) {
    		console.log(report)
    		firebaseService.getRefDailyProgressReport().child(report.userID).child(report.groupID).child(report.subgroupID).child(report.reportID).update({'answers': report.answers}, function(err){
				if(err){
					console.log('err', err)	
				}
				console.log('done', 'finished')	
    			
    		});
    	}

        return {
        	getDailyReport: getDailyProgressReport,
        	updateReport: updateReport
        }
    }; //ProgressReportService
})();
