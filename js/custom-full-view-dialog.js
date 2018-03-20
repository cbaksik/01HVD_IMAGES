/**
 * Created by samsan on 5/17/17.
 * A custom modal dialog when a user click on thumbnail on search result list page
 */


(function () {

    angular.module('viewCustom')
    .controller('customFullViewDialogController', ['items','$mdDialog','prmSearchService', function (items, $mdDialog,prmSearchService) {
        // local variables
        let vm = this;
        let sv=prmSearchService;
        vm.item={};
        vm.item = items.item;
        vm.searchData = items.searchData;

        sv.setItem(items);
        vm.closeDialog=function() {
            $mdDialog.hide();
        };
    }]);


})();

