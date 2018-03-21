
# The Primo New UI Customization Workflow Development Environment


##Package documentation

The development package allows you to configure :

- css

- images

- html

- JavaScript

- The root directory of the package should be named either by the `viewCode` or `CENTRAL_PACKAGE` in case of a consortia level package
- Whether you develop a consortia level package or a view level package the process remains the same
- Once deployed the hierarchy is as follows:
    1. For css - use the cascading ability of css and load the consortia level (CENTRAL_PACKAGE) css first and the view level css afterwards
    2. For images and html - the system checks for every file if it exists in each level - and prefers the view level file if exists
    3. For JavaScript - the two package types define 2 different Angular modules:
        - ```var app = angular.module('viewCustom', ['angularLoad']);```
        - ```var app = angular.module('centralCustom', ['angularLoad']);```

  and loads both of the modules,

- For each configuration type there is a specified folder in the custom package folder (that can be downloaded form your Primo Back Office)
- In each folder you will find a specific README.md file with recipes/examples.


To create a new component to work with current primo-ui

(function(){
     angular.module('viewCustom')
        .controller('customYourCtrl',['$scope',function ($scope) {
            let vm=this;
            vm.$onit=()=>{
               // write your code here

               console.log(vm);

               $scope.$watch('vm.parentCtrl',()=>{
                    console.log(vm.parentCtrl);
               });
            }



        }]);

        angular.module('viewCustom')
        .component('customYourComponentName',{
            bindings:{parentCtrl:'<'},
            controller: 'customYourCtrl',
            controllerAs:'vm',
            templateUrl:'/primo-explore/custom/01HVD_IMAGES/html/custom-yourfilename.html'
        });

)}();











