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
                firebaseService.getRefSubGroupsNames().child(groupID).on('child_added', function(subGroups, prevChildKey) {
                     // console.log(subGroups.key());
                     // console.log(subGroups.val());
                    //subGroupNames.push({subgroupID: subGroups.key(), subgroupTitle: (subGroups.val().title) ? subGroups.val().title : subGroups.key(), hasPolicy: (subGroups.val().hasPolicy) ? subGroups.val().hasPolicy : false });
                    subGroupNames.push({subgroupID: subGroups.key(), subgroupTitle: (subGroups.val().title) ? subGroups.val().title : subGroups.key(), hasPolicy: false, policyID: (subGroups.val().policyID) ? subGroups.val().policyID : '' });
                });
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
                firebaseService.getRefPolicies().child(groupID).on('child_added', function(subGroups, prevChildKey) {
                    console.log(subGroups.key());
                    console.log(subGroups.val());
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
			function answer(obj, groupID, selectedTeams, selectedTeamMembers, cb, policyID) {
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
                multiPathUpdate["policies/"+groupID+"/"+newPolicyKey] = obj;

                //getting subgroups which are selected....
                selectedTeams.forEach(function(val, indx){
                    //add property hasPolicy in subgroupNames..
                    multiPathUpdate["subgroups-names/"+groupID+"/"+val.subgroupID+"/hasPolicy"] = true;
                    multiPathUpdate["subgroups-names/"+groupID+"/"+val.subgroupID+"/policyID"] = newPolicyKey;
                    //add policy id into subgroup node
                    multiPathUpdate["subgroups/"+groupID+"/"+val.subgroupID+"/policyID"] = newPolicyKey;
                }); //selectedTeams.forEach

                //getting subgroup Members...
                for(var group in selectedTeamMembers) {
                    selectedTeamMembers[group].forEach(function(v, i){
                        //adding obj into user-policies userid -> groupid -> subgroupid node
                        multiPathUpdate["user-policies/"+v.userID+"/"+v.groupID+"/"+v.subgroupID] = obj;
                    }); //selectedTeamMembers[group].forEach
                } //for selectedTeamMembers

                // console.log(multiPathUpdate)

               	//Multi-Path update Queery
                refNodes.ref.update(multiPathUpdate, function(err){
                    if(err) {
                        console.log("Error updating Date:", err);
                    } else {
                    	cb();
                    }
                });

			}
			//Save data in firebase using Multi-Path	-- END --


            return {
                getSubGroupNames: 	getSubGroupNames,
                getSubGroupMembers: getSubGroupMembers,
                getGroupPolicies: 	getGroupPolicies,
                answer: 			answer
            }
        }]);

})();
