/**
 * Created by haseeb on 5/30/2015.
 */

angular.module('core')
    .directive('dragZone',function ($rootScope) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            function handleFileSelect(evt) {

                evt.stopPropagation();
                evt.preventDefault();
                var files = evt.dataTransfer.files; // FileList object.
                $rootScope.$emit('File:Received', {files:files});
            }

            function handleDragOver(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
            }
            $element[0].addEventListener('dragover', handleDragOver, false);
            $element[0].addEventListener('drop', handleFileSelect, false);
        }
    }
}).directive('cropperDirective',function($compile,$timeout,$rootScope,$mdDialog,$timeout,$interval){
        return {
            scope:{},
            restrict : 'AE',
            transclude : true,
            link:function(scope,elements,attr){
                $rootScope.ShowCropperEl=false;
                /*debugger
                scope.my;*/

                var cropperThat = scope;
                cropperThat.image={src:'',name:''};
                cropperThat.model = {img:''};
                //cropperThat.$parent.my.model.img = cropperThat.image;
                //cropperThat.my.model.img = cropperThat.image;
                scope.$watch('model.img',function(newVal,oldVal) {
                    // console.log('value has been changed'+oldVal);
                    // console.log('value has been changed'+newVal);
                    $rootScope.newImg = newVal;
                },true);
                cropperThat.selectFile= function (_this) {
                    var file = _this.files[0];
                    if(!file){
                        return false;
                    }
                    var reader = new FileReader();
                    cropperThat.image.name=file.name.replace(" ", '');
                    cropperThat.image.name=cropperThat.image.name.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '');
                    reader.readAsDataURL(file);
                    reader.onload= function () {
                        // console.log(reader.result);
                        var $image = $('#fileCropEl');
                        var canvasData,cropBoxData;
                        cropperThat.image.src=reader.result;
                        $rootScope.$digest();
                        //console.log($image[0].src);
                        $image.cropper({

                            autoCropArea: 0.70,
                            strict: true,
                            guides: false,
                            highlight: false,
                            dragCrop: false,
                            movable: true,
                            resizable: false,
                            zoomable:false,
                            built: function () {
                                $image.cropper('setCanvasData', canvasData);
                                $image.cropper('setCropBoxData', cropBoxData);
                            }
                        });
                        $rootScope.ShowCropperEl=true;
                        $rootScope.$$phase || $rootScope.$digest();
                    };
                };
                cropperThat.crop= function () {
                    var cropperArea = $('#fileCropEl');
                    cropperThat.model.img=cropperArea.cropper("getCroppedCanvas").toDataURL();


                    cropperArea.cropper('destroy');
                    $rootScope.ShowCropperEl=false;
                    $rootScope.$$phase || $rootScope.$digest();
                    //scope.$apply(attr.confirmAction);


                };

                cropperThat.reset= function () {
                    $('#fileCropEl').cropper("reset");
                };
                cropperThat.close= function () {
                    $('#fileCropEl').cropper('destroy');
                    $rootScope.ShowCropperEl=false;
                    $rootScope.$$phase || $rootScope.$digest();

                };
            },
            replace:true,
            templateUrl : "directives/my-cropper.html"
        }
    });