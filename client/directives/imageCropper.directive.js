/**
 * Created by haseeb on 5/30/2015.
 */

angular.module('core')
    .directive('dragZone',function ($rootScope) {
    return {
        restrict: 'AE',
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
}).directive('imageCropper',function($compile,$timeout,$rootScope){
        return {
            scope:{},
            restrict : 'AE',
            transclude : true,
            link:function(scope,elements,attr){
                $rootScope.ShowCropperEl=false;
                var cropperThat = scope;
                cropperThat.image={src:'',name:''};
                $rootScope.croppedImage = cropperThat.image;
                cropperThat.model = {img:''}
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
                        console.log(reader.result);
                        var $image = $('#fileCropEl');
                        var canvasData,cropBoxData;
                        cropperThat.image.src=reader.result;
                        $rootScope.$digest();
                        console.log($image[0].src);
                        $image.cropper({

                            autoCropArea: 100,
                            strict: false,
                            guides: false,
                            highlight: false,
                            dragCrop: false,
                            movable: false,
                            resizable: false,
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
                    $rootScope.ShowCropperEl=false;
                    $rootScope.$$phase || $rootScope.$digest();

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
            templateUrl : "directives/templates/my-cropper.html"
        }
    });