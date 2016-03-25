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
