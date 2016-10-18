;(function () {
    'use strict';

    angular.module('com.td.dcts.esoLoginApp').config(['tdCoreRouterProvider', function (tdCoreRouterProvider) {
        tdCoreRouterProvider.define('td-eso-login-app.loginForm', {
            url: '/loginForm',
            templateUrl: 'td-eso-login-app/states/login-form/login-form.html',
            data: {
                requiresAuth: true
            },
            params: {
                productId: null
            },
            controller: 'loginController',
            resolve: {
                translations: function (requireTranslations) {
                    return requireTranslations('login');
                }
            }
        });


    }]);

    angular.module('com.td.dcts.esoLoginApp').controller("loginController", ['$scope', '$state', '$stateParams', '$rootScope', 'tdEsoLoginService', 'tdEsoAlertService', 'tdEsoClientSessionService',
    function ($scope, $state, $stateParams, $rootScope, tdEsoLoginService, tdEsoAlertService, tdEsoClientSessionService) {

        $scope.selectedProduct = "BCC-123";
        $scope.rememberMeChk = false;
        $scope.rememberedIdList = null;
        $scope.signInWithNewCard = true;
        $scope.username = null;

        tdEsoLoginService.getRememberedUserIds().then(function (response) {
            console.log(response);
            if(response !== null) {
                var data = response.data;
                if(data.length > 0) {
                    $scope.rememberMeChk = true;
                    $scope.rememberedIdList = data;
                    $scope.selectedOption = $scope.rememberedIdList[0];
                    $scope.signInWithNewCard = false;
                } else {
                    $scope.signInWithNewCard = true;
                }
            }
        }, function (error) {
            console.log(error);
        });

        $scope.toggleSignInNewCard = function(show) {
            $scope.signInWithNewCard = show;
        };

        $scope.forgotPassword = function() {
            $state.go('td-eso-login-app.forgotPassStart');
        };
        $scope.validateUser = function () {
        	// Reset the error messages
        	tdEsoAlertService.resetAppErrorCodes();
            //$scope.errorMsgs = "";
            //this is required. need to keep this array empty otherwise will get error when same error code pushed into the array. Eg: Go-Back
            //$rootScope.appErrorCodes=[];
            var requestObj = {};
            requestObj.authenticationIdentity = {};
            requestObj.authenticationIdentity.authenticationMethodTypeCd = "KBF";
            requestObj.authenticationIdentity.authenticationMethodSubtypeCd = "credential";
            requestObj.authenticationIdentity.accessAuthenticationIdentifierTypeCd = "loginid";
            if(!$scope.signInWithNewCard) {
                requestObj.authenticationIdentity.accessAuthenticationIdentifierId = $scope.selectedOption.loginId;
            } else {
                requestObj.authenticationIdentity.accessAuthenticationIdentifierId = this.username;
            }

            requestObj.authenticationIdentity.secretVal = this.password;
            requestObj.authenticationIdentity.rememberMe = this.rememberMeChk;

            requestObj.deviceInfo = {};
            /* jshint ignore:start */
            requestObj.deviceInfo.devicePrintVal = encode_deviceprint();
            /* jshint ignore:end */
            requestObj.authenticationTokenTypeCd = "oauth";
            console.log("Printing Request");
            console.log(requestObj);
            tdEsoLoginService.validateUser(requestObj).then(function (response) {
            	// Reset the error messages
                tdEsoAlertService.resetExpErrorCodes();

                var data = {};
                data.response = response.data;
                data.productId = $scope.selectedProduct;

                //$rootScope.$broadcast('com.td.dcts.esoLoginApp_return_success', data);
                if (data.response.nextStateName === "CHALLENGE") {
                    $state.go('td-eso-login-app.mfaChallenge', {
                        "questionData": data.response
                    });
                }
                if (data.response.nextStateName === "COMPLETE") {
                    $rootScope.$emit('com.td.dcts.esoLoginApp_login_success', data);
                }
                if(data.response.nextStateName ==="PASSWORD_EXPIRED"){
                    $state.go('td-eso-login-app.passwordReset', {
                        "isTempPasswordLogin": true,
                        "oldPassword": requestObj.authenticationIdentity.secretVal
                    });
                }

            }, function (error) {
                // error handler
                //$scope.showerror = true;
            	tdEsoAlertService.resetExpErrorCodes();
                tdEsoAlertService.throwServiceErrorToExp(error);
            });
        };

        $scope.moveToGettingStarted = function() {
            //Need to bind the required details to store it in client session and needs update in tdEsoClientSessionService app
            var userDetails = {
                "firstname" : this.fname,
                "lastname" : this.lname,
                "email" : this.email
            };
            tdEsoClientSessionService.setPersonalInfo(userDetails);
            // call OCA server to store user data to session and get the client credentials token
            tdEsoLoginService.loginN2B(userDetails).then(function (response) {
            	// Reset the error messages
                console.log(response);
                tdEsoAlertService.resetExpErrorCodes();
                $state.go("td-eso-experience.getStarted");

            }, function (error) {
                // error handler
                //$scope.showerror = true;
            	tdEsoAlertService.resetExpErrorCodes();
                tdEsoAlertService.throwServiceErrorToExp(error);
            });
        };

        /*$scope.easywebValidationFunction = function () {
            var ex = new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])', 'g');
            return !ex.test($scope.loginForm.accesscard.$viewValue);
        };*/

        /*$scope.validateUser = function () {
         $state.go('td-eso-login-app.auth', {"productId": $scope.selectedProduct});
         };*/
        $scope.moveToGreetings = function () {
            $state.go('td-eso-experience.greeting', {"productId": $scope.selectedProduct});
        };
        $scope.moveToN2C = function () {
            $rootScope.$emit('com.td.dcts.moveToN2C', {"productId": $scope.selectedProduct});
        };
    }]);

}());