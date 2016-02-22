 /**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.policy', ['core'])
        .factory('policyService', ['firebaseService', '$q', "messageService", function(firebaseService, $q, dataService, messageService) {

        	//Getting SubGroup Names of given GroupID -- START --
        	var subGroupNames = [];
    	    function setSubGroupNames(groupID) {
                subGroupNames = [];

                firebaseService.getRefSubgroupPolicies().child(groupID).on('child_added',function(subGroups, prevChildKey){
                    //after getting names checking subgroup has policy or nothing
                    subGroupNames.push({
                        subgroupID: subGroups.key(),
                        subgroupTitle: (subGroups.val().title) ? subGroups.val().title : subGroups.key(),
                        hasPolicy: false,
                        policyID: (subGroups.val().policyID) ? subGroups.val().policyID : ''
                    });
                }); //getRefSubgroupPolicies

                firebaseService.getRefSubgroupPolicies().child(groupID).on('child_changed', function(snapshot){
                        subGroupNames.forEach(function(value, index){
                            if(value.subgroupID == snapshot.key()){
                                subGroupNames[index]['policyID'] = snapshot.val().policyID;
                            }
                        });
                });

                // //getting subgroup names
                // firebaseService.getRefSubGroupsNames().child(groupID).on('child_added', function(subGroups, prevChildKey) {
                //     //subGroupNames.push({subgroupID: subGroups.key(), subgroupTitle: (subGroups.val().title) ? subGroups.val().title : subGroups.key(), hasPolicy: (subGroups.val().hasPolicy) ? subGroups.val().hasPolicy : false });
                //     subGroupNames.push({
                //         subgroupID: subGroups.key(),
                //         subgroupTitle: (subGroups.val().title) ? subGroups.val().title : subGroups.key(),
                //         hasPolicy: false,
                //         policyID: (subGroups.val().policyID) ? subGroups.val().policyID : ''
                //     });
                //     console.log('subGroupNames.length', subGroupNames.length);
                // }); //getRefSubGroupsNames
            }
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

                // var questionObj = obj["progressReportQuestions"];   //setting progressReportQuestions from 'obj'
                // delete obj["progressReportQuestions"];              //delete progressReportQuestions from 'obj'

                //Saving on firebase by using multi path update
                var multiPathUpdate = {};

                //add policy in policies node
                //multiPathUpdate["policies/"+groupID+"/"+newPolicyKey] = obj;

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
                if(obj['progressReport']){
                     var newQuestionRef = refNodes.ref.child("policies").child(groupID).child(newPolicyKey).child('progressReportQuestions').push();
                     var newQuestionID = newQuestionRef.key();
                     multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/latestProgressReportQuestionID"] = newQuestionID;
                     multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/progressReportQuestions/"+newQuestionID] = obj['progressReportQuestions'];
                     //obj['latestProgressReportQuestionID'] = newQuestionID;
                     //multiPathUpdate["policies/"+groupID+"/"+newPolicyKey+"/progressReportQuestions/"+newQuestionID] = questionObj;
                }

                //getting subgroups which are selected....
                selectedTeams.forEach(function(val, indx){
                    //add property hasPolicy in subgroupNames..
                    // multiPathUpdate["subgroup-policies/"+groupID+"/"+val.subgroupID+"/hasPolicy"] = true;
                    // multiPathUpdate["subgroup-policies/"+groupID+"/"+val.subgroupID+"/policyID"] = newPolicyKey;
                    multiPathUpdate["subgroup-policies/"+groupID+"/"+val.subgroupID] = {"hasPolicy": true, "policyID": newPolicyKey ,"title" : obj['title'] };

                    //add policy id into subgroup node
                    multiPathUpdate["subgroups/"+groupID+"/"+val.subgroupID+"/policyID"] = newPolicyKey;

                    //add policy into subgroup-locations-defined
                    // if(obj.locationBased){
                    //     var tmpObj = obj;
                    //     tmpObj["location"] = obj.location;
                    //     tmpObj["subgroup-url"] = groupID+"/"+val.subgroupID;
                    //     tmpObj["type"] = 1
                    //     delete tmpObj["location"];
                    //     delete tmpObj["schedule"];
                    //     delete tmpObj["timeBased"];
                    //     multiPathUpdate["subgroup-locations-defined/"+groupID+"/"+val.subgroupID+"/"+newPolicyKey] = tmpObj;
                    //     multiPathUpdate["subgroup-locations-defined/"+groupID+"/"+val.subgroupID+"/"+newPolicyKey+"/title"] = obj.location.title || '';
                    // }
                }); //selectedTeams.forEach

                //getting subgroup Members...
                for(var group in selectedTeamMembers) {
                    selectedTeamMembers[group].forEach(function(v, i){
                        //adding obj into user-policies userid -> groupid -> subgroupid node
                        multiPathUpdate["user-policies/"+v.userID+"/"+v.groupID+"/"+v.subgroupID] = {"hasPolicy": true, "policyID": newPolicyKey ,"title" : obj['title'] };
                        //multiPathUpdate["user-policies/"+v.userID+"/"+v.groupID+"/"+v.subgroupID] = obj;
                    }); //selectedTeamMembers[group].forEach
                } //for selectedTeamMembers

                // console.log(multiPathUpdate)

               	//Multi-Path update Queery
                refNodes.ref.update(multiPathUpdate, function(err) {
                    if(err) {
                        console.log("Error updating Date:", err);
                    } else {
                        //adding questions obj if progressReport is true    (for daily progress questions)
                    	cb(newQuestionID);
                    }
                });
			}

            // function pushProgressReportQuestions(groupID, policyID, newQuestionID, qobj, cb){
            //     var ref = firebaseService.getRefMain();
            //     var multiPathUpdate = {};
            //     //saving question object
            //     multiPathUpdate["policies/"+groupID+"/"+policyID+"/progressReportQuestions/"+newQuestionID] = qobj;
            //     ref.update(multiPathUpdate, function(err){
            //         if(err) {
            //             console.log("Error updating Question Object:", err);
            //         } else {
            //             console.log('added questions');
            //         	cb();
            //         }
            //     });
            // }
			//Save data in firebase using Multi-Path	-- END --

            //if member assign into any team, if policy has exists on that team then also assigned to member -- START --

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
                });
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
