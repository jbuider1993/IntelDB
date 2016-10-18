describe('login start screen Spec', function () {

	'use strict';

	var $rootscope,$state,$compile,compiledElement,resolve,mockErrorMessages,$httpBackend,isLoginSuccess,isLoginFail,
	loginSuccessMock,loginErrorMock,
	tdEsoLoginService,requestObject,isLoginSuccessComplete,loginSuccessMockComplete,tdEsoClientSessionService,
	loginController,$scope,isgetUserSuccess,userIDSMock,userIDSMockError,usersuccessDataMock,userErrorDataMock,isloginN2B;

	var setMockData = function()
	{
		mockErrorMessages = {
			"global.appointment" : "https://www.tdcanadatrust.com/oab/OABLandingPage/OABLocationSearch.form?lang=en",
			"global.privacysecurity" : "https://www.td.com/privacy-and-security/privacy-and-security/index.jsp",
			"global.legal" : "https://www.td.com/to-our-customers/",
			"global.accessibility" : "http://www.tdcanadatrust.com/customer-service/accessibility/accessibility-at-td/index.jsp",
			"global.contactus" : "https://www.tdcanadatrust.com/customer-service/contact-us/email/contact.jsp",
			"global.livechat" : "https://dev.chat.td.com/system/templates/chat/td_ct/chat.html?entryPointId=1020&templateName=td_ct&languageCode=en&countryCode=US&osorefnum=1463706846FVL8&ver=v11&eglvrefname=&null&aId=EG98836525&sId=B5f11e8b53-7960-4067-b99f-dae84bf6a2a5&uId=B50179c1a1-fb5f-482e-a994-670ed7a65552&referer=https%3A%2F%2Fapply.td.com%2Fwaw%2Foso%2Fproduct%2Fsubmitcart.htm",
			"global.helplineNumber":"tel:18009832582",
			"global.tdCopyrights": "&copy;2016 TD Canada Trust, N.A. All Rights Reserved",
			"1880" : "Account locked out",
		    "1740" : "Try a different set of userid/password credentials in order to log in.",
		    "1744" : "The user has answered their challenge question wrong 3 times.",
		    "1882" : "The user is locked out of the system because they failed to answer their challenge question too many times.",
		    "1743" : "The user's HTTP session is expired.",
		    "1701" : "The user is attempting to log into an application they do not have access to.",  
		    "1741" : "The user is trying to log into one of our online applications from a blacklisted country.",
		    "1742" : "The user is trying to log into one of our online applications from a blacklisted IP address.",
		    "1751" : "An OAuth token could not be created for the user.",
		    "1752" : "An Open token could not be created for the user. ",
			"1753" : "The customer could not be authenticated due to an incorrect challenge response",
		    "global.SystemError": "System error."
		};

		loginSuccessMock = {
			"data": {
				"authenticationFactors": [{
					"challenge": {
						"questionTxt": "What is the first name of the person you went to your prom with?",
						"questionId": "Q3.1",
						"questionTypeCd": "challenge"
					}
				}],
				"links": [{
					"rel": "abort authentication",
					"href": "http://jboss-vm-2d258.dynamic.dcts.cloud.td.com:8080/v1/customers/authentication/abort"
				}, {
					"rel": "authenticate",
					"href": "http://jboss-vm-2d258.dynamic.dcts.cloud.td.com:8080/v1/customers/authentication"
				}],
				"nextStateName": "CHALLENGE"
			}
		};

		loginSuccessMockComplete = {
			"data": {
				"authenticationFactors": [{
					"challenge": {
						"questionTxt": "What is the first name of the person you went to your prom with?",
						"questionId": "Q3.1",
						"questionTypeCd": "complete"
					}
				}],
				"links": [{
					"rel": "abort authentication",
					"href": "http://jboss-vm-2d258.dynamic.dcts.cloud.td.com:8080/v1/customers/authentication/abort"
				}, {
					"rel": "authenticate",
					"href": "http://jboss-vm-2d258.dynamic.dcts.cloud.td.com:8080/v1/customers/authentication"
				}],
				"nextStateName": "COMPLETE"
			}
		};
		loginErrorMock={"data":{
		    "status": {
		        "serverStatusCode": "401",
		        "severity": "Error",
		        "additionalStatus": [{
			        "statusCode": 1740,
			        "serverStatusCode": "AUTHENTICATION_FAILED",
			        "severity": "Error",
			        "statusDesc": "The customer could not be authenticated due to an incorrect login ID or password"
		        }]
		    }
		}
		};

		  userIDSMock = {"data":{
		    "rememberedIdentity" : [
		        {
		            "rememberedId" : "JS******AS",
		            "key" : "JS******AS-1469644084616",
		            "loginId" : "JSTESTLOGIN"
		        },
		         {
		            "rememberedId" : "AB******AB",
		            "key" : "JS******AS-1469644084616",
		            "loginId" : "JSTESTING"
		        }
		    ],
		    "links" : [
		    
		    ]
		}};

		userIDSMockError = {"data":{"Error":"Error"}};

		usersuccessDataMock = {
			 "authenticationFactors": [{
			        "challenge": {
			            "questionTxt": "What is the first name of the person you went to your prom with?",
			            "questionId": "Q3.1",
			            "questionTypeCd": "challenge"
			        }
			    }],
			    "links": [{
			        "rel": "abort authentication",
			        "href": "http://jboss-vm-2d258.dynamic.dcts.cloud.td.com:8080/v1/customers/authentication/abort"
			    }, {
			        "rel": "authenticate",
			        "href": "http://jboss-vm-2d258.dynamic.dcts.cloud.td.com:8080/v1/customers/authentication"
			    }],
			    "nextStateName": "CHALLENGE"
			};

			userErrorDataMock = {
				    "status": {
				        "serverStatusCode": "401",
				        "severity": "Error",
				        "additionalStatus": [{
					        "statusCode": 1740,
					        "serverStatusCode": "AUTHENTICATION_FAILED",
					        "severity": "Error",
					        "statusDesc": "The customer could not be authenticated due to an incorrect login ID or password"
				        }]
				    }
				};

		requestObject = {"authenticationIdentity":{"authenticationMethodTypeCd":"KBF","authenticationMethodSubtypeCd":"credential","accessAuthenticationIdentifierTypeCd":"loginid","accessAuthenticationIdentifierId":"asf","secretVal":"asf","deviceInfo":{"devicePrintVal":"version%3D1%26pm%5Ffpua%3Dmozilla%2F5%2E0%20%28windows%20nt%206%2E1%3B%20wow64%3B%20rv%3A37%2E0%29%20gecko%2F20100101%20firefox%2F37%2E0%7C5%2E0%20%28Windows%29%7CWin32%26pm%5Ffpsc%3D24%7C1920%7C1080%7C1040%26pm%5Ffpsw%3Dpdf%7Cpdf%26pm%5Ffptz%3D%2D5%26pm%5Ffpln%3Dlang%3Den%2DUS%7Csyslang%3D%7Cuserlang%3D%26pm%5Ffpjv%3D0%26pm%5Ffpco%3D1"},"authenticationTokenTypeCd":"oauth"}};
	};

	beforeEach(function () {

    module('com.td.dcts.esoLoginApp');

    module('com.td.oca.coreResource');  

	module('com.td.dcts.esoLoginApp',function($provide){
	$provide.factory('tdEsoLoginService',function($q){
		var getRememberedUserIds = jasmine.createSpy('getRememberedUserIds').andCallFake(function(){
		var userIDSMockData = userIDSMock;
		var userIDSMockErrorData = userIDSMockError;
		 if (isgetUserSuccess) {
		    return $q.when(userIDSMockData);
		  }	
		 else
		  {
		   	return $q.reject(userIDSMockErrorData);
		  }
		
		 });

	  var validateUser = jasmine.createSpy('validateUser').andCallFake(function(){
	  var loginSuccessData = loginSuccessMock;
	  var loginErrorData = loginErrorMock;
	  var loginSuccessDataComplete = loginSuccessMockComplete;
   		  
		  if (isLoginSuccess) {
		        return $q.when(loginSuccessData);
		      }
		  else if (isLoginSuccessComplete) {
		        return $q.when(loginSuccessDataComplete);
		      }
		  else if(isLoginFail)
		      {
		          return $q.reject(loginErrorData);
		      }
		  });

	 
		var loginN2B = jasmine.createSpy('loginN2B').andCallFake(function(){
		var usersuccessData = usersuccessDataMock;
		var userErrorData = userErrorDataMock;
		 if (isloginN2B) {
		    return $q.when(usersuccessData);
		  }	
		 else
		  {
		   	return $q.reject(userErrorData);
		  }
		
		 });

		return {
	      getRememberedUserIds: getRememberedUserIds,
	      validateUser: validateUser,
	      loginN2B:loginN2B
	 
	    };
	 }); 
	});
	module('com.td.dcts.esoClientSession',function($provide){
	  $provide.factory('tdEsoClientSessionService',function($q){
	  var setPersonalInfo = jasmine.createSpy('setPersonalInfo').andCallFake(function(){
	  var loginSuccessData = loginSuccessMock;
	  var loginErrorData = loginErrorMock;
	  var loginSuccessDataComplete = loginSuccessMockComplete;
   		  
	  if (isLoginSuccess) {
	        return $q.when(loginSuccessData);
	      }
	  if (isLoginSuccessComplete) {
	        return $q.when(loginSuccessDataComplete);
	      }
	  else if(isLoginFail)
	      {
	          return $q.reject(loginErrorData);
	      }
	  });
	  return {
	      setPersonalInfo: setPersonalInfo	 
	    };
	 }); 
	});
    inject(function (_$rootScope_, _$state_,_$compile_,_$resolve_,_$httpBackend_,_tdEsoLoginService_,_$controller_,_tdEsoClientSessionService_) {
      $rootscope=_$rootScope_;
       $scope = $rootscope.$new();
			$state = _$state_;
			$compile=_$compile_;
			resolve = _$resolve_;
			$httpBackend = _$httpBackend_;
			tdEsoLoginService=_tdEsoLoginService_;
			tdEsoClientSessionService=_tdEsoClientSessionService_;
			
			loginController = _$controller_('loginController', 
				{ '$scope': $scope, resolve: {
                translations: function () {
                    return 'login';
                }
            }});

			setMockData();
	});

	});


	it('should get error messages mock', function () {
   
  	 isgetUserSuccess = true;
  	 $httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr_CA/global').respond(mockErrorMessages);
  	 $httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr/global').respond(mockErrorMessages);
  	 $httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en_CA/global').respond(mockErrorMessages);
  	 $httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en/global').respond(mockErrorMessages);
     compiledElement = $compile('<div data-td-eso-login></div>')($rootscope);  
     compiledElement = $compile('<form novalidate name="loginForm" ng-controller="loginController"><div><input required ng-model="formData.accesscard" td-ui-validate-function="easywebValidationFunction" name="accesscard"> </div> <div><input required type="password"  name="password" ng-model="formData.password"></div> <div class="td-col-sm-6 td-col-sm-offset-3"><button id="btnValidateUser" data-td-ui-primary data-td-ui-block td-ui-size="compact" ng-disabled="loginForm.$invalid" class="td-margin-top-30 btnContiniueLogin" disabled="disabled" ng-click="validateUser()" translate="login.ContinueBtn"></button> </div> </form>')($rootscope);
     $rootscope.$digest();
    
	});

	it('should call validate user method - success scenario- challenge', function () {
   var responseItems;
	isLoginSuccess=true;
	isgetUserSuccess = true;	
	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en/global').respond(mockErrorMessages);
	compiledElement = $compile('<form novalidate name="loginForm" ng-controller="loginController"><div><input required ng-model="formData.accesscard" td-ui-validate-function="easywebValidationFunction" name="accesscard"> </div> <div><input required type="password"  name="password" ng-model="formData.password"></div> <div class="td-col-sm-6 td-col-sm-offset-3"><button id="btnValidateUser" data-td-ui-primary data-td-ui-block td-ui-size="compact" ng-disabled="loginForm.$invalid" class="td-margin-top-30 btnContiniueLogin" disabled="disabled" ng-click="validateUser()" translate="login.ContinueBtn"></button> </div> </form>')($rootscope);
    $rootscope.$digest();
 	compiledElement.find('#btnValidateUser').click();
	tdEsoLoginService.validateUser(requestObject).then(function(data) {
    	responseItems= data;
	});
    expect(tdEsoLoginService.validateUser).toHaveBeenCalled();
  	});

it('should call validate user method - success scenario - complete', function () {
   var responseItems;
   isgetUserSuccess = true;
	isLoginSuccess=false;
	isLoginSuccessComplete = true;	
	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en/global').respond(mockErrorMessages);
	compiledElement = $compile('<form novalidate name="loginForm" ng-controller="loginController"><div><input required ng-model="formData.accesscard" td-ui-validate-function="easywebValidationFunction" name="accesscard"> </div> <div><input required type="password"  name="password" ng-model="formData.password"></div> <div class="td-col-sm-6 td-col-sm-offset-3"><button id="btnValidateUser" data-td-ui-primary data-td-ui-block td-ui-size="compact" ng-disabled="loginForm.$invalid" class="td-margin-top-30 btnContiniueLogin" disabled="disabled" ng-click="validateUser()" translate="login.ContinueBtn"></button> </div> </form>')($rootscope);
    $rootscope.$digest();
    spyOn($rootscope, '$emit');
    compiledElement.find('#btnValidateUser').click();
	tdEsoLoginService.validateUser(requestObject).then(function(data) {
    	responseItems= data;
    	$rootscope.$broadcast('com.td.dcts.esoLoginApp_login_success', data);
     	$rootscope.$digest();
	});
	expect(tdEsoLoginService.validateUser).toHaveBeenCalled();
   
	});

	it('should call validate user method - error scenario', function () {
    var responseItems;
    isgetUserSuccess = true;
	isLoginSuccess=false;
	isLoginSuccessComplete = false;
	isLoginFail=true;
	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en/global').respond(mockErrorMessages);
  	compiledElement = $compile('<form novalidate name="loginForm" ng-controller="loginController"><div><input required ng-model="formData.accesscard" td-ui-validate-function="easywebValidationFunction" name="accesscard"> </div> <div><input required type="password"  name="password" ng-model="formData.password"></div> <div class="td-col-sm-6 td-col-sm-offset-3"><button id="btnValidateUser" data-td-ui-primary data-td-ui-block td-ui-size="compact" ng-disabled="loginForm.$invalid" class="td-margin-top-30 btnContiniueLogin" disabled="disabled" ng-click="validateUser()" translate="login.ContinueBtn"></button> </div> </form>')($rootscope);
    $rootscope.$digest();
    compiledElement.find('#btnValidateUser').click();
	tdEsoLoginService.validateUser(requestObject).then(function(data) {
    	responseItems= data;  
	});
    expect(tdEsoLoginService.validateUser).toHaveBeenCalled();        
	});

it('should call move to greetings', function () {

	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/fr/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en_CA/global').respond(mockErrorMessages);
  	$httpBackend.whenGET('/td-eso-login-app/v1/content/getProperties/en/global').respond(mockErrorMessages);
  	compiledElement = $compile('<form novalidate name="loginForm" ng-controller="loginController"><div><a id="moveToGreetings" td-ui-link="tertiary" class="go-back td-margin-top-5" ng-click="moveToGreetings()"></a></div><div><a id="moveToN2C" href="" td-ui-link="tertiary" ng-click="moveToN2C()" translate="login.NoEasywebBtn"></a></div></form>')($rootscope);
    $rootscope.$digest();    
    compiledElement.find('#moveToN2C').click();   
	});




}); 