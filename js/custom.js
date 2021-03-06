(function(){
"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
    angular.module('viewCustom', ['angularLoad', 'cl.paging']);
})();
/**
 * Created by samsan on 3/19/18.
 * This custom alert component is used for home page on the right side splash
 * If you need to turn off or on, just set status in json file to on or off
 */

(function () {
    angular.module('viewCustom').controller('customAlertCtrl', ['prmSearchService', '$scope', function (prmSearchService, $scope) {
        var vm = this;
        var cs = prmSearchService;
        vm.apiUrl = {};
        vm.alertMsg = {};

        vm.$onInit = function () {
            vm.apiUrl = cs.getApi();
            $scope.$watch('vm.apiUrl.alertUrl', function () {
                if (vm.apiUrl.alertUrl) {
                    cs.getAjax(vm.apiUrl.alertUrl, '', 'get').then(function (res) {
                        vm.alertMsg = res.data;
                    }, function (err) {
                        console.log(err);
                    });
                }
            });
        };
    }]);

    angular.module('viewCustom').component('customAlert', {
        bindings: { parentCtrl: '<' },
        controller: 'customAlertCtrl',
        controllerAs: 'vm',
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-alert.html'
    });
})();

/**
 * Created by samsan on 7/26/17.
 */

(function () {

    angular.module('viewCustom').controller('customFavoriteActionDialogController', ['items', 'position', 'flexsize', 'record', '$mdDialog', '$location', 'prmSearchService', function (items, position, flexsize, record, $mdDialog, $location, prmSearchService) {
        // local variables
        var vm = this;
        var sv = prmSearchService;
        vm.imageUrl = '/primo-explore/custom/01HVD_IMAGES/img/ajax-loader.gif';
        vm.item = items;
        vm.position = position;
        vm.flexSize = flexsize;
        vm.selectedAction = position.action;
        vm.activeAction = position.action;
        vm.displayCloseIcon = false;
        vm.searchdata = $location.search();

        if (vm.item.pnx.links.thumbnail) {
            vm.imageUrl = vm.item.pnx.links.thumbnail[0];
        }

        vm.openTab = function ($event, action) {
            vm.selectedAction = action;
            vm.activeAction = action;
        };

        vm.unpin = function (index, recordid) {
            vm.position.pin = true;
            vm.position.recordId = recordid;
            $mdDialog.hide();
        };

        // open modal dialog when click on thumbnail image
        vm.openDialog = function ($event, item) {
            // set data to build full display page
            var itemData = { 'item': '', 'searchData': '' };
            itemData.item = item;
            itemData.searchData = vm.searchdata;
            sv.setItem(itemData);

            // modal dialog pop up here
            $mdDialog.show({
                title: 'Full View Details',
                target: $event,
                clickOutsideToClose: true,
                focusOnOpen: true,
                escapeToClose: true,
                bindToController: true,
                templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-full-view-dialog.html',
                controller: 'customFullViewDialogController',
                controllerAs: 'vm',
                fullscreen: true,
                multiple: true,
                openFrom: { left: 0 },
                locals: {
                    items: itemData
                },
                onComplete: function onComplete(scope, element) {
                    sv.setDialogFlag(true);
                },
                onRemoving: function onRemoving(element, removePromise) {
                    sv.setDialogFlag(false);
                }
            });
            return false;
        };

        // When a user press enter by using tab key
        vm.openDialog2 = function (e, item) {
            if (e.which === 13 || e.which === 1) {
                vm.openDialog(e, item);
            }
        };

        vm.closeDialog = function () {
            $mdDialog.hide();
        };
    }]);
})();
/**
 * Created by samsan on 7/25/17.
 */

(function () {

    angular.module('viewCustom').controller('customFavoriteListController', ['prmSearchService', '$mdDialog', '$mdMedia', '$location', 'prmFavoriteWebSql', '$state', function (prmSearchService, $mdDialog, $mdMedia, $location, prmFavoriteWebSql, $state) {

        var sv = prmSearchService;
        var websql = prmFavoriteWebSql;
        var vm = this;
        vm.searchdata = {};
        vm.chooseAll = false;
        vm.itemList = []; // store pin favorite list
        vm.pinItems = []; // origin pin items
        vm.rightLabelClick = false;
        vm.flexSize = { 'col1': 5, 'col2': 15, 'col3': 55, 'col4': 25 };
        vm.records = [];
        vm.params = $location.search();
        vm.logInID = sv.getLogInID();
        vm.authInfo = sv.getAuth();

        // ajax call to get favorite data list
        vm.getData = function () {
            if (vm.parentCtrl.favoritesService && vm.parentCtrl.favoritesService.recordsId) {
                var url = vm.parentCtrl.favoritesService.restBaseURLs.pnxBaseURL + '/U';
                var param = { 'recordIds': '' };
                param.recordIds = vm.parentCtrl.favoritesService.recordsId.join();
                vm.records = vm.parentCtrl.favoritesService.records;
                if (vm.records.length > 0) {
                    sv.getAjax(url, param, 'get').then(function (result) {
                        if (result.status === 200) {
                            if (result.data.length > 0) {
                                vm.itemList = sv.convertData(result.data);
                                vm.pinItems = angular.copy(vm.itemList); // make copy data to avoid using binding data
                                vm.unCheckAll();
                            }
                        } else {
                            console.log('**** It cannot get favorite item list data because it has problem with DB server ***');
                        }
                    }, function (err) {
                        console.log(err);
                    });
                }
            }
        };

        //check if there is a label base on the records
        vm.isLabel = function (recordid) {
            var flag = false;
            if (sv.getLogInID()) {
                for (var i = 0; i < vm.records.length; i++) {
                    if (vm.records[i].recordId === recordid) {
                        flag = true;
                        i = vm.records.length;
                    }
                }
            }
            return flag;
        };

        // unpin each item
        vm.unpin = function (index, recordid) {
            if (sv.getLogInID()) {
                var url = vm.parentCtrl.favoritesService.restBaseURLs.favoritesBaseURL;
                var param = { 'delete': { 'records': [{ 'recordId': '' }] } };
                param.delete.records[0].recordId = recordid;
                sv.postAjax(url, param).then(function (result) {
                    if (result.status === 200) {
                        vm.itemList.splice(index, 1);
                        vm.pinItems = angular.copy(vm.itemList);
                    } else {
                        console.log('*** It cannot unpin this item because it has problem with DB server ***');
                    }
                }, function (err) {
                    console.log(err);
                });
            } else {
                console.log('*** I am not login **');
                // user not login, delete local web sql db
                websql.removePinItem(index, vm.areaName, vm.callback);
            }
        };

        vm.unpinAll = function () {
            var url = vm.parentCtrl.favoritesService.restBaseURLs.favoritesBaseURL;
            var param = { 'delete': { 'records': [{ 'recordId': '' }] } };
            var recordids = [];
            var k = 0;
            // add all checked items into recordids so it can send all of them as post
            for (var i = 0; i < vm.itemList.length; i++) {
                if (vm.itemList[i].checked) {
                    recordids[k] = { 'recordId': 0 };
                    if (vm.itemList[i].pnx.control) {
                        recordids[k].recordId = vm.itemList[i].pnx.control.recordid[0];
                        k++;
                    }
                }
            }
            param.delete.records = recordids;
            sv.postAjax(url, param).then(function (result) {
                if (result.status === 200) {
                    // remove item from the list if the delete is successfully
                    var unCheckItems = [];
                    for (var i = 0; i < vm.itemList.length; i++) {
                        if (vm.itemList[i].checked === false) {
                            unCheckItems.push(vm.itemList[i]);
                        }
                    }
                    vm.itemList = unCheckItems;
                    vm.pinItems = angular.copy(unCheckItems);
                    vm.chooseAll = false;
                } else {
                    console.log('**** It cannot unpin these items because it has problem with DB server ***');
                }
            }, function (err) {
                console.log(err);
            });
        };

        vm.checkAll = function () {
            if (vm.chooseAll === false) {
                for (var i = 0; i < vm.itemList.length; i++) {
                    vm.itemList[i].checked = true;
                }
            } else {
                vm.unCheckAll();
            }
        };

        vm.unCheckAll = function () {
            for (var i = 0; i < vm.itemList.length; i++) {
                vm.itemList[i].checked = false;
            }
        };

        // open modal dialog when click on thumbnail image
        vm.openDialog = function ($event, item) {
            // set data to build full display page
            var itemData = { 'item': '', 'searchData': '' };
            itemData.item = item;
            itemData.searchData = vm.searchdata;
            sv.setItem(itemData);

            // modal dialog pop up here
            $mdDialog.show({
                title: 'Full View Details',
                target: $event,
                clickOutsideToClose: true,
                focusOnOpen: true,
                escapeToClose: true,
                bindToController: true,
                templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-full-view-dialog.html',
                controller: 'customFullViewDialogController',
                controllerAs: 'vm',
                fullscreen: true,
                multiple: false,
                openFrom: { left: 0 },
                locals: {
                    items: itemData
                },
                onComplete: function onComplete(scope, element) {
                    sv.setDialogFlag(true);
                },
                onRemoving: function onRemoving(element, removePromise) {
                    sv.setDialogFlag(false);
                }
            });
            return false;
        };

        // When a user press enter by using tab key
        vm.openDialog2 = function (e, item) {
            if (e.which === 13 || e.which === 1) {
                vm.openDialog(e, item);
            }
        };

        vm.openActionDialog = function ($event, item, divid, index, action) {

            var el = angular.element(document.querySelector('#' + divid));
            vm.position = { 'width': 0, 'height': 0, 'top': 0, 'left': 0, index: index, 'action': 'none', 'pin': false };
            if (el) {
                vm.position.width = el[0].clientWidth + 40 + 'px';
                vm.position.height = el[0].clientHeight + 100;
                vm.position.left = el[0].offsetLeft;
                vm.position.top = el[0].offsetTop - 40 + 'px';
            }

            vm.position.action = action;

            $mdDialog.show({
                parent: document.querySelector('#' + divid),
                title: 'Action dialog',
                target: $event,
                clickOutsideToClose: true,
                focusOnOpen: true,
                escapeToClose: true,
                bindToController: true,
                templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-favorite-action-dialog.html',
                controller: 'customFavoriteActionDialogController',
                controllerAs: 'vm',
                fullscreen: false,
                hasBackdrop: false,
                multiple: true,
                disableParentScroll: false,
                openFrom: { left: '100px' },
                closeTo: { width: '100%' },
                locals: {
                    items: item,
                    position: vm.position,
                    flexsize: vm.flexSize,
                    record: vm.records[index]
                },
                onShowing: function onShowing(scope, element) {},
                onRemoving: function onRemoving(element, removePromise) {
                    // unpin item if a user click on pin on modal dialog
                    if (vm.position.pin) {
                        vm.unpin(vm.position.index, vm.position.recordId);
                    }
                }
            });
            return false;
        };

        // callback to get data when it access webSQL
        vm.callbackOpenDB = function (db) {
            if (vm.areaName) {
                websql.getPinItem(vm.areaName, vm.callback);
            }
        };
        vm.callback = function (data) {
            vm.itemList = sv.convertData(data);
            vm.pinItems = angular.copy(vm.itemList);
        };

        vm.$onInit = function () {
            websql.init(vm.callbackOpenDB);
        };

        // get update records when a user add labels
        vm.$doCheck = function () {
            vm.logInID = sv.getLogInID();
            if (vm.parentCtrl.favoritesService) {
                if (sv.getLogInID()) {
                    vm.records = vm.parentCtrl.favoritesService.records;
                    if (vm.parentCtrl.favoritesService.selectedLabels) {
                        if (vm.parentCtrl.favoritesService.selectedLabels.length > 0) {
                            vm.itemList = sv.convertData(vm.parentCtrl.favoritesService.items);
                            vm.rightLabelClick = true;
                        }
                    } else if (vm.itemList.length < vm.pinItems.length && vm.rightLabelClick) {
                        vm.itemList = angular.copy(vm.pinItems);
                        vm.rightLabelClick = false;
                    }
                }
            }
        };

        vm.$onChanges = function () {

            vm.authInfo = sv.getAuth();
            if (vm.authInfo.authenticationService.userSessionManagerService) {
                vm.areaName = vm.authInfo.authenticationService.userSessionManagerService.areaName;
            }

            // format the size to fit smaller screen
            if ($mdMedia('xs')) {
                vm.flexSize.col1 = 100;
                vm.flexSize.col2 = 100;
                vm.flexSize.col3 = 100;
                vm.flexSize.col4 = 100;
            } else if ($mdMedia('sm')) {
                vm.flexSize.col1 = 5;
                vm.flexSize.col2 = 20;
                vm.flexSize.col3 = 50;
                vm.flexSize.col4 = 25;
            }
            if (sv.getLogInID()) {
                vm.getData();
            }
        };
    }]);

    angular.module('viewCustom').component('customFavoriteList', {
        bindings: { parentCtrl: '<' },
        controller: 'customFavoriteListController',
        controllerAs: 'vm',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/custom-favorite-list.html'
    });
})();
/**
 * Created by samsan on 3/20/18.
 */

(function () {

    // custom filter to remove $$U infront of url in pnx.links
    angular.module('viewCustom').filter('urlFilter', function () {
        return function (url) {
            var newUrl = '';
            var pattern = /^(\$\$U)/;
            if (url) {
                newUrl = url[0];
                if (pattern.test(newUrl)) {
                    newUrl = newUrl.substring(3, newUrl.length);
                }
            }

            return newUrl;
        };
    });

    // extract [6 images] from pnx.display.lds28 field
    angular.module('viewCustom').filter('countFilter', function () {
        return function (qty) {
            var nums = '';
            var pattern = /[\[\]]+/g;
            if (qty) {
                nums = qty.replace(pattern, '');
            }

            return nums;
        };
    });

    // truncate word to limit 60 characters
    angular.module('viewCustom').filter('truncatefilter', function () {
        return function (str) {
            var newstr = str;
            var index = 45;
            if (str) {
                if (str.length > 45) {
                    newstr = str.substring(0, 45);
                    for (var i = newstr.length; i > 20; i--) {
                        var text = newstr.substring(i - 1, i);
                        if (text === ' ') {
                            index = i;
                            i = 20;
                        }
                    }
                    newstr = str.substring(0, index) + '...';
                }
            }

            return newstr;
        };
    });

    // truncate word to limit 60 characters
    angular.module('viewCustom').filter('mapXmlFilter', ['customMapXmlKeys', function (customMapXmlKeys) {
        var cMap = customMapXmlKeys;
        return function (key) {
            var newKey = cMap.mapKey(key);
            return newKey.charAt(0).toUpperCase() + newKey.slice(1);
        };
    }]);
})();

/**
 * Created by samsan on 5/17/17.
 * A custom modal dialog when a user click on thumbnail on search result list page
 */

(function () {

    angular.module('viewCustom').controller('customFullViewDialogController', ['$mdDialog', 'items', function ($mdDialog, items) {
        // local variables
        var vm = this;
        vm.item = items.item;
        vm.searchData = items.searchData;

        vm.closeDialog = function () {
            $mdDialog.hide();
        };
    }]);
})();

/**
 * Created by samsan on 3/26/18.
 * This header will use for image component page and image detail page
 */

(function () {

    angular.module('viewCustom').controller('customHeaderCtrl', [function () {
        var vm = this;
    }]);

    angular.module('viewCustom').component('customHeader', {
        bindings: { parentCtrl: '<' },
        controller: 'customHeaderCtrl',
        controllerAs: 'vm',
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-header.html'
    });
})();

/**
 * Created by samsan on 3/20/18.
 * It use for intercept http request so it would change the search default limit to 50
 */

(function () {
    // override the limit=10 when a user refresh page at search result list
    angular.module('viewCustom').config(['$httpProvider', function ($httpProvider) {

        $httpProvider.interceptors.push(function () {
            return {
                'request': function request(config) {
                    // override the default page size limit
                    if (config.params) {
                        if (config.params.limit === 10) {
                            config.params.limit = 50;
                        }
                    }
                    if (config.method === 'POST' && config.url === '/primo_library/libweb/webservices/rest/v1/actions/email') {
                        // override request parameters if a user click on pagination
                        var pageObj = JSON.parse(window.localStorage.getItem('pageInfo'));

                        // add parameters to email link
                        var url = config.data.records[0].deeplink;
                        var urlStr = new URL(window.location.href);
                        var offset = 0;
                        if (urlStr.searchParams.get('offset')) {
                            offset = urlStr.searchParams.get('offset');
                        }
                        var searchString = '';
                        if (urlStr.searchParams.get('searchString')) {
                            searchString = urlStr.searchParams.get('searchString');
                        } else if (pageObj.searchString) {
                            searchString = pageObj.searchString;
                        }
                        var sortby = 'rank';
                        if (urlStr.searchParams.get('sortby')) {
                            sortby = urlStr.searchParams.get('sortby');
                        }
                        var q = '';
                        if (urlStr.searchParams.get('q')) {
                            q = urlStr.searchParams.get('q');
                        } else if (pageObj.query) {
                            q = pageObj.query;
                        }
                        // override the url parameter
                        if (pageObj.userClick) {
                            offset = pageObj.offset;
                            searchString = pageObj.searchString;
                            q = pageObj.query;
                        }
                        url += '&sortby=' + sortby + '&offset=' + offset + '&searchString=' + searchString + '&q=' + q;
                        config.data.records[0].deeplink = encodeURI(url);
                    }
                    return config;
                },

                'response': function response(_response) {
                    return _response;
                }
            };
        });
    }]);
})();

/**
 * Created by samsan on 9/28/17.
 * This service find out the xml key, sort them, display them in order
 */

(function () {

    angular.module('viewCustom').service('customMapXmlKeys', [function () {
        var serviceObj = {};

        // filter the xml key node
        serviceObj.keys = [{ 'lds01': 'HOLLIS Number' }, { 'lds04': 'Variant Title' }, { 'lds07': 'Publication Info' }, { 'lds08': 'Permalink' }, { 'lds13': 'Notes' }, { 'lds22': 'Style / Period' }, { 'lds23': 'Culture' }, { 'lds24': 'Related Work' }, { 'lds25': 'Related Information' }, { 'lds26': 'Repository' }, { 'lds27': 'Use Restrictions' }, { 'lds30': 'Form / Genre' }, { 'lds31': 'Place' }, { 'lds44': 'Associated Name' }, { 'associatedName': 'Associated Name' }, { 'creationdate': 'Creation Date' }, { 'creator': 'Author / Creator' }, { 'format': 'Description' }, { 'freeDate': 'Date' }, { 'itemIdentifier': 'Identifier' }, { 'placeName': 'Place' }, { 'production': 'Publication info' }, { 'relatedWork': 'Related Work' }, { 'relatedInformation': 'Related Information' }, { 'rights': 'Copyright' }, { 'state': 'Edition' }, { 'topic': 'Subject' }, { 'workType': 'Form / Genre' }, { 'useRestrictions': 'Use Restrictions' }, { 'hvd_associatedName': 'Image Associated Name' }, { 'hvd_classification': 'Image Classification' }, { 'hvd_copyright': 'Image Copyright' }, { 'hvd_creator': 'Image Creator' }, { 'hvd_culture': 'Image Culture' }, { 'hvd_description': 'Image Description' }, { 'hvd_dimensions': 'Image Dimensions' }, { 'hvd_freeDate': 'Image Date' }, { 'hvd_itemIdentifier': 'Image Identifier' }, { 'hvd_materials': 'Image Materials' }, { 'hvd_notes': 'Image Notes' }, { 'hvd_note': 'Image Notes' }, { 'hvd_placeName': 'Image Place' }, { 'hvd_production': 'Image Publication info' }, { 'hvd_relatedInformation': 'Image Related info' }, { 'hvd_relatedWork': 'Image Related Work' }, { 'hvd_repository': 'Harvard Repository' }, { 'hvd_state': 'Image Edition' }, { 'hvd_style': 'Image Style' }, { 'hvd_title': 'Image Title' }, { 'hvd_topic': 'Image Subject' }, { 'hvd_useRestrictions': 'Image Use Restrictions' }, { 'hvd_workType': 'Image Type' }, { '_attr': 'Image ID' }, { '_text': 'TEXT' }];

        // remove hvd_ from the key
        serviceObj.mapKey = function (key) {
            var myKey = key;

            for (var i = 0; i < serviceObj.keys.length; i++) {
                var obj = serviceObj.keys[i];
                if (Object.keys(obj)[0] === key) {
                    myKey = serviceObj.keys[i][key];
                }
            }

            return myKey;
        };

        // do not show these items
        serviceObj.removeList = ['lds03', 'lds08', 'lds20', 'lds37', 'structuredDate', 'image', 'source', 'altComponentID'];
        serviceObj.getRemoveList = function () {
            return serviceObj.removeList;
        };

        //re-arrange sorting order
        serviceObj.order = ['title', 'lds04', 'creator', 'creationdate', 'edition', 'lds07', 'format', 'lds13', 'subject', 'lds31', 'lds23', 'lds22', 'lds30', 'identifier', 'lds44', 'lds24', 'lds25', 'lds27', 'rights', 'lds26', 'lds01'];

        serviceObj.sort = function (listKey) {
            var keys = [];
            for (var i = 0; i < serviceObj.order.length; i++) {
                var key = serviceObj.order[i];
                var index = listKey.indexOf(key);
                if (index !== -1) {
                    keys.push(key);
                }
            }

            return keys;
        };

        // re-arrange sorting component order
        serviceObj.orderList = ['title', 'creator', 'freeDate', 'state', 'production', 'description', 'physicalDescription', 'materials', 'dimensions', 'notes', 'note', 'topic', 'placeName', 'location', 'culture', 'style', 'workType', 'classification', 'itemIdentifier', 'associatedName', 'relatedWork', 'relatedInformation', 'useRestrictions', 'copyright', 'repository'];
        serviceObj.getOrderList = function (listKey) {
            var keys = [];
            var hvdKeys = [];
            var key = '';
            var pattern = /^(hvd_)/i;
            // find hvd key
            for (var j = 0; j < listKey.length; j++) {
                key = listKey[j];
                if (pattern.test(key)) {
                    hvdKeys.push(key);
                }
            }

            for (var i = 0; i < serviceObj.orderList.length; i++) {
                key = serviceObj.orderList[i];
                var index = listKey.indexOf(key);
                if (index !== -1) {
                    keys.push(key);
                }
            }

            if (hvdKeys.length > 0) {
                for (var i = 0; i < serviceObj.orderList.length; i++) {
                    var keyMap = serviceObj.orderList[i];
                    key = 'hvd_' + keyMap;
                    var index = hvdKeys.indexOf(key);
                    if (index !== -1) {
                        keys.push(key);
                    }
                }
            }
            if (listKey.length > 0) {
                var index = listKey.indexOf('_attr');
                if (index !== -1) {
                    keys.push('_attr');
                }
            }

            return keys;
        };

        return serviceObj;
    }]);
})();
/**
 * Created by samsan on 10/13/17.
 * Find out xml value base on xml key. It loop through tree structure
 */

(function () {

    angular.module('viewCustom').service('customMapXmlValues', [function () {
        var serviceObj = {};

        // get relatedInformation value
        serviceObj.getRelatedInformation = function (nodeValue) {
            var str = '';
            var keys = Object.keys(nodeValue);
            if (keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var values = nodeValue[key];
                    if (values) {
                        var nodeKeys = Object.keys(values);
                        var text = '';
                        var url = '';
                        var index = nodeKeys.indexOf('_text');
                        if (index !== -1) {
                            text = values['_text'];
                        }
                        var index2 = nodeKeys.indexOf('_attr');
                        if (index2 !== -1) {
                            var href = values['_attr'];
                            if (href) {
                                var nodeKeys2 = Object.keys(href);
                                var index3 = nodeKeys2.indexOf('href');
                                if (index3 !== -1) {
                                    url = values['_attr']['href']['_value'];
                                }
                            }
                        }
                        if (url && text) {
                            str = '<a href="' + url + '" target="_blank">' + text + '</a><br/>';
                        }
                    }
                }
            }
            if (str) {
                str = str.replace(/<br\/>$/, '');
            }

            return str;
        };

        // get associatedName value
        serviceObj.getAssociatedName = function (nodeValue) {
            var str = '';
            var name = '';
            var dates = '';
            var role = '';
            var keys = Object.keys(nodeValue);
            for (var i = 0; i < keys.length; i++) {
                var nodeKey = keys[i];
                var values = nodeValue[nodeKey];
                if (values) {
                    var nodeKeys = Object.keys(values);
                    var index = nodeKeys.indexOf('nameElement');
                    var index2 = nodeKeys.indexOf('dates');
                    var index3 = nodeKeys.indexOf('role');
                    if (index !== -1) {
                        name = values['nameElement'];
                        if (Array.isArray(name)) {
                            name = name[0]['_text'];
                        }
                    }

                    if (index2 !== -1) {
                        dates = values['dates'];
                        if (Array.isArray(dates)) {
                            dates = dates[0]['_text'];
                        }
                        if (dates) {
                            dates = ', ' + dates;
                        }
                    }

                    if (index3 !== -1) {
                        role = values['role'];
                        if (Array.isArray(role)) {
                            role = ' [' + role[0]['_text'] + ']';
                        }
                        str += name + dates + role + '<br/>';
                    } else {
                        str += name + dates + '<br/>';
                    }
                }
            }
            if (str) {
                str = str.replace(/<br\/>$/, '');
            }
            return str;
        };

        // get image ID
        serviceObj.getAttr = function (nodeValue) {
            var str = '';
            var keys = Object.keys(nodeValue);
            if (keys.length > 0) {
                var index = keys.indexOf('componentID');
                if (index !== -1) {
                    var componentID = nodeValue['componentID'];
                    if ((typeof componentID === 'undefined' ? 'undefined' : _typeof(componentID)) === 'object' && componentID !== null) {
                        componentID = componentID['_value'];
                    }
                    str = componentID;
                }
            }
            return str;
        };

        // get relatedWork
        serviceObj.getTopic = function (nodeValue) {
            var str = '';
            var keys = Object.keys(nodeValue);
            if (keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    var nodeKey = keys[i];
                    var values = nodeValue[nodeKey];
                    if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) === 'object' && values !== null) {
                        var nodeKeys2 = Object.keys(values);
                        for (var k = 0; k < nodeKeys2.length; k++) {
                            var nodekey3 = nodeKeys2[k];
                            if (nodekey3) {
                                var values2 = values[nodekey3];
                                if ((typeof values2 === 'undefined' ? 'undefined' : _typeof(values2)) === 'object' && values2 !== null) {
                                    var nodekeys4 = Object.keys(values2);
                                    if (nodekeys4) {
                                        var values3 = values2[nodekeys4];
                                        if ((typeof values3 === 'undefined' ? 'undefined' : _typeof(values3)) === 'object' && values3 !== null) {
                                            var nodeKeys5 = Object.keys(values3);
                                            for (var c = 0; c < nodeKeys5.length; c++) {
                                                var nodekey5 = nodeKeys5[c];
                                                if (values3[nodekey5]) {
                                                    str += values3[nodekey5] + ';&nbsp;';
                                                }
                                            }
                                        } else if (values3) {
                                            str += values3 + ';&nbsp;';
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        str += values;
                    }
                }
            }
            if (str) {
                str = str.replace(/;&nbsp;$/, '');
            }
            return str;
        };

        // get relatedWork
        serviceObj.getRelatedWork = function (nodeValue) {
            var str = '';
            var keys = Object.keys(nodeValue);
            if (keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    var nodeKey = keys[i];
                    var values = nodeValue[nodeKey];
                    if (values) {
                        var nodeKeys = Object.keys(values);
                        if ((typeof nodeKeys === 'undefined' ? 'undefined' : _typeof(nodeKeys)) === 'object' && nodeKeys !== null) {
                            for (var k = 0; k < nodeKeys.length; k++) {
                                var key2 = nodeKeys[k];
                                if (key2) {
                                    var values2 = values[key2];
                                    if ((typeof values2 === 'undefined' ? 'undefined' : _typeof(values2)) === 'object' && values2 !== null) {
                                        var nodeKeys2 = Object.keys(values2);
                                        if ((typeof nodeKeys2 === 'undefined' ? 'undefined' : _typeof(nodeKeys2)) === 'object' && nodeKeys2 !== null) {
                                            for (var c = 0; c < nodeKeys2.length; c++) {
                                                var key3 = nodeKeys2[c];
                                                if (key3) {
                                                    var values3 = values2[key3];
                                                    if ((typeof values3 === 'undefined' ? 'undefined' : _typeof(values3)) === 'object' && values3 !== null) {
                                                        var nodeKeys3 = Object.keys(values3);
                                                        for (var j = 0; j < nodeKeys3.length; j++) {
                                                            var key4 = nodeKeys3[j];
                                                            var values4 = values3[key4];
                                                            if (values4) {
                                                                str += values4 + '<br/>';
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        } else if (values2[nodeKeys2]) {
                                            str += values2[nodeKeys2] + '<br/>';
                                        }
                                    } else if (values2) {
                                        str += values2 + '<br/>';
                                    }
                                }
                            }
                        } else if (values) {
                            str += values + '<br/>';
                        }
                    }
                }
            }

            if (str) {
                str = str.replace(/<br\/>$/, '');
            }
            return str;
        };

        // get xml node value
        serviceObj.getValue = function (values, key) {
            var text = '';
            if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) === 'object') {
                switch (key) {
                    case 'hvd_relatedInformation':
                    case 'relatedInformation':
                        text = serviceObj.getRelatedInformation(values);
                        break;
                    case 'hvd_associatedName':
                    case 'associatedName':
                        text = serviceObj.getAssociatedName(values);
                        break;
                    case '_attr':
                        text = serviceObj.getAttr(values);
                        break;
                    case 'hvd_relatedWork':
                    case 'relatedWork':
                        text = serviceObj.getRelatedWork(values);
                        break;
                    case 'hvd_topic':
                    case 'topic':
                        text = serviceObj.getTopic(values);
                        break;
                    default:
                        text = serviceObj.getOtherValue(values, key);
                        break;
                }
            } else {
                text = values;
            }
            return text;
        };

        // get json value base on dynamic key
        serviceObj.getOtherValue = function (obj, key) {
            var text = '';
            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) {
                if (Array.isArray(obj)) {
                    obj = obj[0];
                }
                var keys = Object.keys(obj);
                for (var k = 0; k < keys.length; k++) {
                    var nodeKey = keys[k];
                    if (nodeKey) {
                        var nodeValue = obj[nodeKey];

                        if (Array.isArray(nodeValue)) {
                            nodeValue = nodeValue[0];
                        }
                        if ((typeof nodeValue === 'undefined' ? 'undefined' : _typeof(nodeValue)) === 'object' && nodeValue !== null) {

                            if (Array.isArray(nodeValue)) {
                                for (var i = 0; i < nodeValue.length; i++) {
                                    var data = nodeValue[i];
                                    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data !== null) {
                                        if (Array.isArray(data)) {
                                            for (var j = 0; j < data.length; j++) {
                                                var data2 = data[j];
                                                if ((typeof data2 === 'undefined' ? 'undefined' : _typeof(data2)) === 'object' && data2 !== null) {
                                                    if (Array.isArray(data2)) {
                                                        for (var c = 0; c < data2.length; c++) {
                                                            var data3 = data2[c];
                                                            if ((typeof data3 === 'undefined' ? 'undefined' : _typeof(data3)) === 'object' && data3 !== null) {
                                                                if (Array.isArray(data3)) {
                                                                    for (var w = 0; w < data3.length; w++) {
                                                                        var data4 = data3[w];
                                                                        if ((typeof data4 === 'undefined' ? 'undefined' : _typeof(data4)) === 'object' && data4 !== null) {
                                                                            if (data4[0]) {
                                                                                text += data4[0] + '&nbsp;';
                                                                            }
                                                                        } else if (data4) {
                                                                            text += data4 + '&nbsp;';
                                                                        }
                                                                    }
                                                                }
                                                            } else if (data3) {
                                                                text += data3 + '&nbsp;';
                                                            }
                                                        }
                                                    }
                                                } else if (data2) {
                                                    text += data2 + '&nbsp;';
                                                }
                                            }
                                        } else {
                                            var subNodeKeys = Object.keys(data);
                                            if (Array.isArray(subNodeKeys)) {
                                                for (var b = 0; b < subNodeKeys.length; b++) {
                                                    var key2 = subNodeKeys[b];
                                                    if ((typeof key2 === 'undefined' ? 'undefined' : _typeof(key2)) === 'object' && key2 !== null) {
                                                        if (Array.isArray(key2)) {
                                                            for (var c = 0; c < key2.length; c++) {
                                                                var key3 = key2[c];
                                                                if ((typeof key3 === 'undefined' ? 'undefined' : _typeof(key3)) === 'object' && key3 !== null) {
                                                                    if (Array.isArray(key3)) {
                                                                        for (var x = 0; x < key3.length; x++) {
                                                                            var key4 = key3[x];
                                                                            if ((typeof key4 === 'undefined' ? 'undefined' : _typeof(key4)) === 'object' && key4 !== null) {
                                                                                if (data[key4][0]) {
                                                                                    text += data[key4][0] + '&nbsp;';
                                                                                }
                                                                            } else if (data[key4]) {
                                                                                text += data[key4] + '&nbsp;';
                                                                            }
                                                                        }
                                                                    }
                                                                } else if (data[key3]) {
                                                                    text += data[key3] + '&nbsp;';
                                                                }
                                                            }
                                                        }
                                                    } else if (key2) {
                                                        if (data[key2]) {
                                                            text += data[key2] + '&nbsp;';
                                                        }
                                                    }
                                                }
                                            } else if (data[subNodeKeys]) {
                                                text += data[subNodeKeys] + '&nbsp;';
                                            }
                                        }
                                    } else {
                                        text += data;
                                    }
                                }
                            } else if (nodeKey) {
                                var nodeKey2 = Object.keys(nodeValue);
                                if ((typeof nodeKey2 === 'undefined' ? 'undefined' : _typeof(nodeKey2)) === 'object' && nodeKey2 !== null) {
                                    if (Array.isArray(nodeKey2)) {
                                        for (var c = 0; c < nodeKey2.length; c++) {
                                            var nodeKey3 = nodeKey2[c];
                                            if (nodeKey3) {
                                                var nodeValue3 = nodeValue[nodeKey3];
                                                if (Array.isArray(nodeValue3)) {
                                                    nodeValue3 = nodeValue3[0];
                                                }

                                                if ((typeof nodeValue3 === 'undefined' ? 'undefined' : _typeof(nodeValue3)) === 'object' && nodeValue3 !== null) {
                                                    var nodeKey4 = Object.keys(nodeValue3);
                                                    if (Array.isArray(nodeKey4)) {
                                                        for (var b = 0; b < nodeKey4.length; b++) {
                                                            var nodeKey5 = nodeKey4[b];
                                                            if (nodeKey5) {
                                                                if (nodeValue3[nodeKey5]) {
                                                                    text += nodeValue3[nodeKey5] + '&nbsp;';
                                                                }
                                                            }
                                                        }
                                                    } else if (nodeValue3[nodeKey4]) {
                                                        text += nodeValue3[nodeKey4] + '&nbsp;';
                                                    }
                                                } else if (nodeValue3) {
                                                    text += nodeValue3 + '&nbsp;';
                                                }
                                            }
                                        }
                                    }
                                } else if (nodeKey2) {
                                    if (nodeValue[nodeKey2]) {
                                        text += nodeValue[nodeKey2] + '&nbsp;';
                                    }
                                }
                            }
                        } else if (nodeValue) {
                            text += nodeValue + '&nbsp;';
                        }
                    }
                }
            } else {
                text = obj;
            }

            return text;
        };

        return serviceObj;
    }]);
})();
/**
 * Created by samsan on 9/5/17.
 * This for printing page when a user click on print icon
 */

(function () {

    angular.module('viewCustom').controller('customPrintPageCtrl', ['$element', '$stateParams', 'customService', '$timeout', '$window', '$state', function ($element, $stateParams, customService, $timeout, $window, $state) {
        var vm = this;
        vm.item = {};
        var cs = customService;
        // get item data to display on full view page
        vm.getItem = function () {
            var url = vm.parentCtrl.searchService.cheetah.restBaseURLs.pnxBaseURL + '/' + vm.context + '/' + vm.docid;
            url += '?vid=01HVD_IMAGES';
            cs.getAjax(url, '', 'get').then(function (result) {
                vm.item = result.data;
                vm.goto();
            }, function (error) {
                console.log(error);
            });
        };

        vm.goto = function () {
            var obj = { docid: vm.item.pnx.control.recordid[0], vid: 'HVD2', lang: 'en_US' };
            $state.go('fulldisplay', obj, { location: false, reload: true, notify: true });
        };

        vm.$onInit = function () {
            // capture the parameter from UI-Router
            vm.docid = $stateParams.docid;
            vm.context = $stateParams.context;
            vm.vid = '01HVD_IMAGES';
            vm.getItem();
            $timeout(function () {
                var el = document.getElementsByTagName('body')[0];
                if (el) {
                    el.setAttribute('id', 'printView');
                }
            }, 50);

            $window.onafterprint = function () {
                $window.close();
            };
        };

        vm.$postLink = function () {
            $timeout(function () {
                $window.print();
            }, 3000);
        };
    }]);

    angular.module('viewCustom').component('customPrintPage', {
        bindings: { parentCtrl: '<' },
        controller: 'customPrintPageCtrl',
        controllerAs: 'vm',
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-print-page.html'
    });
})();
/**
 * Created by samsan on 9/5/17.
 * Custom print page so it would print all the images, scan contents, etc.
 */

(function () {

    angular.module('viewCustom').controller('customPrintCtrl', ['$window', '$stateParams', function ($window, $stateParams) {
        var vm = this;
        var params = $stateParams;

        vm.print = function () {
            var url = '/primo-explore/printPage/' + vm.parentCtrl.context + '/' + vm.parentCtrl.pnx.control.recordid;
            url += '?vid=01HVD_IMAGES';
            $window.open(url, '_blank');
        };
    }]);

    angular.module('viewCustom').component('customPrint', {
        bindings: { parentCtrl: '<' },
        controller: 'customPrintCtrl',
        controllerAs: 'vm',
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-print.html'
    });
})();
/**
 * Created by samsan on 3/20/18.
 * List all custom routers for images component and images details
 */

(function () {
    angular.module('viewCustom').config(function ($stateProvider) {
        $stateProvider.state('exploreMain.viewallcomponentdata', {
            url: '/viewallcomponentmetadata/:context/:docid',
            views: {
                '': {
                    template: '<custom-view-all-component-metadata parent-ctrl="$ctrl"></custom-view-all-component-metadata>'
                }
            }
        }).state('exploreMain.viewcomponent', {
            url: '/viewcomponent/:context/:docid',
            views: {
                '': {
                    template: '<custom-view-component parent-ctrl="$ctrl" item="$ctrl.item" services="$ctrl.services" params="$ctrl.params"></custom-view-component>'
                }
            }
        }).state('exploreMain.printPage', {
            url: '/printPage/:context/:docid',
            views: {
                '': {
                    template: '<custom-print-page parent-ctrl="$ctrl"></custom-print-page>'
                }
            }
        });
    });
})();

/**
 * Created by samsan on 7/18/17.
 * This is a service component and use to store data, get data, ajax call, compare any logic.
 */

(function () {

    angular.module('viewCustom').service('customService', ['$http', function ($http) {
        var serviceObj = {};

        serviceObj.getAjax = function (url, param, methodType) {
            return $http({
                'method': methodType,
                'url': url,
                'params': param
            });
        };

        serviceObj.postAjax = function (url, jsonObj) {
            // pass primo token to header with value call token
            $http.defaults.headers.common.token = jsonObj.token;
            return $http({
                'method': 'post',
                'url': url,
                'data': jsonObj
            });
        };

        // setter and getter for text msg data
        serviceObj.textData = {};
        serviceObj.setTextData = function (data) {
            serviceObj.textData = data;
        };

        serviceObj.getTextData = function () {
            return serviceObj.textData;
        };

        // action list selected
        serviceObj.actionName = 'none';
        serviceObj.setActionName = function (actionName) {
            serviceObj.actionName = actionName;
        };
        serviceObj.getActionName = function () {
            return serviceObj.actionName;
        };

        // setter and getter
        serviceObj.items = {};
        serviceObj.setItems = function (data) {
            serviceObj.items = data;
        };
        serviceObj.getItems = function () {
            return serviceObj.items;
        };

        // replace & . It cause error in firefox;
        serviceObj.removeInvalidString = function (str) {
            var pattern = /[\&]/g;
            return str.replace(pattern, '&amp;');
        };

        //parse xml
        serviceObj.convertXML = function (str) {
            var listItems = [];
            str = serviceObj.removeInvalidString(str);
            var xmldata = xmlToJSON.parseString(str);
            if (xmldata.requestlinkconfig) {
                listItems = xmldata.requestlinkconfig[0].mainlocationcode;
            }

            return listItems;
        };

        // setter and getter for library list data logic from xml file
        serviceObj.logicList = [];
        serviceObj.setLogicList = function (arr) {
            serviceObj.logicList = arr;
        };

        serviceObj.getLogicList = function () {
            return serviceObj.logicList;
        };

        // compare logic
        serviceObj.getLocation = function (currLoc) {
            var item = '';
            for (var i = 0; i < serviceObj.logicList.length; i++) {
                var data = serviceObj.logicList[i];
                if (data._attr.id._value === currLoc.location.mainLocation) {
                    item = data;
                    i = serviceObj.logicList.length;
                }
            }

            return item;
        };

        // setter and getter for parent locations data
        serviceObj.parentData = {};
        serviceObj.setParentData = function (data) {
            serviceObj.parentData = data;
        };
        serviceObj.getParentData = function () {
            return serviceObj.parentData;
        };

        // locationInfoArray when the current Location is matched with xml location
        // itemsCategory is an ajax response with itemcategorycode when pass current location
        serviceObj.getRequestLinks = function (locationInfoArray, itemsCategory, ItemType, TextDisplay, index, flagBoolean) {
            var requestItem = { 'flag': false, 'item': {}, 'type': '', 'text': '', 'displayflag': false };
            requestItem.type = ItemType; // requestItem, scanDeliver, aeonrequest
            requestItem.text = TextDisplay; // Request Item, Scan & Delivery, Schedule visit
            requestItem.displayflag = flagBoolean;

            if (itemsCategory.length > 0 && locationInfoArray.length > 0) {

                for (var i = 0; i < locationInfoArray.length; i++) {
                    var json = locationInfoArray[i];

                    for (var j = 0; j < itemsCategory.length; j++) {
                        var itemCat = itemsCategory[j].items;

                        if (itemCat.length > 0) {
                            var item = itemCat[index];
                            var itemCategoryCodeList = '';
                            if (json._attr.itemcategorycode) {
                                itemCategoryCodeList = json._attr.itemcategorycode._value;
                                if (itemCategoryCodeList.length > 1) {
                                    itemCategoryCodeList = itemCategoryCodeList.toString();
                                    itemCategoryCodeList = itemCategoryCodeList.split(';'); // convert comma into array
                                } else {
                                    if (parseInt(itemCategoryCodeList)) {
                                        // add 0 infront of a number
                                        var arr = [];
                                        itemCategoryCodeList = '0' + itemCategoryCodeList.toString();
                                        arr.push(itemCategoryCodeList);
                                        itemCategoryCodeList = arr;
                                    } else {
                                        itemCategoryCodeList = itemCategoryCodeList.toString();
                                        itemCategoryCodeList = itemCategoryCodeList.split(';');
                                    }
                                }
                            }
                            var itemStatusNameList = '';
                            if (json._attr.itemstatusname) {
                                itemStatusNameList = json._attr.itemstatusname._value;
                                itemStatusNameList = itemStatusNameList.split(';'); // convert comma into array
                            }
                            var processingStatusList = '';
                            if (json._attr.processingstatus) {
                                processingStatusList = json._attr.processingstatus._value;
                                processingStatusList = processingStatusList.split(';'); // convert comma into array
                            }
                            var queueList = '';
                            if (json._attr.queue) {
                                queueList = json._attr.queue._value;
                                queueList = queueList.split(';'); // convert comma into array
                            }

                            if (itemCategoryCodeList.length > 0) {
                                // compare if item category code is number
                                if (itemCategoryCodeList.indexOf(item.itemcategorycode) !== -1) {
                                    if (item.processingstatus === '') {
                                        item.processingstatus = 'NULL';
                                    }
                                    if (item.queue === '') {
                                        item.queue = 'NULL';
                                    }
                                    if (itemStatusNameList.indexOf(item.itemstatusname) !== -1 && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                        if (queueList.indexOf(item.queue) !== -1) {
                                            requestItem.flag = true;
                                            requestItem.item = item;
                                            i = locationInfoArray.length;
                                        } else if (!queueList) {
                                            requestItem.flag = true;
                                            requestItem.item = item;
                                            i = locationInfoArray.length;
                                        }
                                    } else if (itemStatusNameList.length > 0) {
                                        for (var k = 0; k < itemStatusNameList.length; k++) {
                                            var statusName = itemStatusNameList[k];
                                            statusName = statusName.replace(/\*/g, '');
                                            var itemstatusname = item.itemstatusname;
                                            if (itemstatusname.includes(statusName) && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                                requestItem.flag = true;
                                                requestItem.item = item;
                                                i = locationInfoArray.length;
                                            }
                                        }
                                    }
                                } else if (itemCategoryCodeList[0] === '*') {
                                    // compare if item category code is asterisk
                                    if (itemStatusNameList.indexOf(item.itemstatusname) !== -1 && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                        requestItem.flag = true;
                                        requestItem.item = item;
                                        i = locationInfoArray.length;
                                    } else if (itemStatusNameList.length > 0) {
                                        // remove asterisk and find word in the array list
                                        for (var k = 0; k < itemStatusNameList.length; k++) {
                                            var statusName = itemStatusNameList[k];
                                            statusName = statusName.replace(/\*/g, '');
                                            var itemstatusname = item.itemstatusname;
                                            if (itemstatusname.includes(statusName) && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                                requestItem.flag = true;
                                                requestItem.item = item;
                                                i = locationInfoArray.length;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return requestItem;
        };

        serviceObj.auth = {};
        serviceObj.setAuth = function (data) {
            serviceObj.auth = data;
        };

        serviceObj.getAuth = function () {
            return serviceObj.auth;
        };

        return serviceObj;
    }]);
})();
/**
 * Created by samsan on 5/23/17.
 * If image has height that is greater than 150 px, then it will resize it. Otherwise, it just display what it is.
 */

(function () {

    angular.module('viewCustom').component('customThumbnail', {
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-thumbnail.html',
        bindings: {
            itemdata: '<',
            searchdata: '<'
        },
        controllerAs: 'vm',
        controller: ['$element', '$timeout', 'prmSearchService', function ($element, $timeout, prmSearchService) {
            var vm = this;
            var sv = prmSearchService;
            vm.localScope = { 'imgclass': '', 'hideLockIcon': false, 'hideTooltip': false };
            vm.imageUrl = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
            vm.src = '';
            vm.imageCaption = '';
            vm.restricted = false;
            vm.imageFlag = false;

            // check if image is not empty and it has width and height and greater than 150, then add css class
            vm.$onChanges = function () {
                vm.localScope = { 'imgclass': '', 'hideLockIcon': false };
                if (vm.itemdata.image) {
                    vm.imageFlag = true;
                    if (vm.itemdata.image.length === 1) {
                        vm.src = vm.itemdata.image[0].thumbnail[0]._attr.href._value + '?width=150&height=150';
                        vm.restricted = vm.itemdata.image[0]._attr.restrictedImage._value;
                        if (vm.itemdata.image[0].caption) {
                            vm.imageCaption = vm.itemdata.image[0].caption[0]._text;
                        }
                    }
                }

                if (vm.src && vm.imageFlag) {
                    vm.imageUrl = sv.getHttps(vm.src);
                    $timeout(function () {
                        var img = $element.find('img')[0];
                        // use default image if it is a broken link image
                        var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                        if (pattern.test(vm.src)) {
                            img.src = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
                        }
                        img.onload = vm.callback;
                        if (img.clientWidth > 50) {
                            vm.callback();
                        }
                    }, 300);
                }
            };
            vm.callback = function () {
                var image = $element.find('img')[0];
                if (image.height > 150) {
                    vm.localScope.imgclass = 'responsivePhoto';
                    image.className = 'md-card-image ' + vm.localScope.imgclass;
                }
                // show lock up icon
                if (vm.restricted) {
                    vm.localScope.hideLockIcon = true;
                }
            };

            $element.bind('contextmenu', function (e) {
                e.preventDefault();
                return false;
            });
        }]
    });
})();
/**
 * Created by samsan on 6/29/17.
 */

(function () {
    angular.module('viewCustom').component('customTopMenu', {
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-top-menu.html',
        bindings: {
            parentCtrl: '<'
        },
        controllerAs: 'vm',
        controller: [function () {
            var vm = this;

            vm.topRightMenus = [{ 'title': 'HOLLIS', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:bannerhollis+', 'label': 'Go to Hollis' }, { 'title': 'Libraries / Hours', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:bannerfindlib', 'label': 'Go to Library hours' }, { 'title': 'All My Accounts', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:banneraccounts', 'label': 'Go to all my accounts' }, { 'title': 'Feedback', 'url': 'http://nrs.harvard.edu/urn-3:HUL.ois:hollisImages', 'label': 'Go to Feedback' }];
        }]
    });
})();
/**
 * Created by samsan on 7/17/17.
 */

(function () {

    angular.module('viewCustom').controller('customViewAllComponentMetadataController', ['$sce', '$element', '$location', 'prmSearchService', '$window', '$stateParams', '$timeout', 'customMapXmlKeys', '$mdMedia', 'customMapXmlValues', function ($sce, $element, $location, prmSearchService, $window, $stateParams, $timeout, customMapXmlKeys, $mdMedia, customMapXmlValues) {

        var vm = this;
        var sv = prmSearchService;
        var cMap = customMapXmlKeys;
        var cMapValue = customMapXmlValues;
        vm.params = $location.search();
        // get ui-router parameters
        vm.context = $stateParams.context;
        vm.docid = $stateParams.docid;

        vm.toggleData = { 'icon': 'ic_remove_black_24px.svg', 'flag': false };
        vm.xmldata = [];
        vm.keys = [];
        vm.items = {};

        vm.toggle = function () {
            if (vm.toggleData.flag) {
                vm.toggleData.icon = 'ic_remove_black_24px.svg';
                vm.toggleData.flag = false;
            } else {
                vm.toggleData.icon = 'ic_add_black_24px.svg';
                vm.toggleData.flag = true;
            }
        };

        // ajax call to get data
        vm.getData = function () {
            var restUrl = vm.parentCtrl.searchService.cheetah.restUrl + '/' + vm.context + '/' + vm.docid;
            var params = { 'vid': '01HVD_IMAGES', 'lang': 'en_US', 'search_scope': 'default_scope', 'adaptor': 'Local Search Engine' };
            params.vid = vm.params.vid;
            params.lang = vm.params.lang;
            params.search_scope = vm.params.search_scope;
            params.adaptor = vm.params.adaptor;
            sv.getAjax(restUrl, params, 'get').then(function (result) {
                vm.items = result.data;
                if (vm.items.pnx.addata) {
                    var result = sv.parseXml(vm.items.pnx.addata.mis1[0]);
                    if (result.work) {
                        vm.xmldata = result.work[0];
                        if (vm.items.pnx.display) {
                            vm.keys = Object.keys(vm.items.pnx.display);
                            var removeKeys = cMap.getRemoveList();
                            for (var i = 0; i < removeKeys.length; i++) {
                                var key = removeKeys[i];
                                var index = vm.keys.indexOf(key);
                                if (index !== -1) {
                                    vm.keys.splice(index, 1);
                                }
                            }
                            vm.keys = cMap.sort(vm.keys);
                        }
                    }
                }
            }, function (err) {
                console.log(err);
            });
        };

        // get json key
        vm.getKeys = function (obj) {
            var keys = Object.keys(obj);
            var removeList = cMap.getRemoveList();
            for (var i = 0; i < removeList.length; i++) {
                var key = removeList[i];
                var index = keys.indexOf(key);
                if (index !== -1) {
                    // remove image from the list
                    keys.splice(index, 1);
                }
            }
            return cMap.getOrderList(keys);
        };

        // get json value base on dynamic key
        vm.getValue = function (obj, key) {
            var values = cMapValue.getValue(obj, key);
            return values;
        };

        // show the pop up image
        vm.gotoFullPhoto = function (index, data) {
            var filename = '';
            if (data.image) {
                var urlList = data.image[0]._attr.href._value;
                urlList = urlList.split('/');
                if (urlList.length >= 3) {
                    filename = urlList[3];
                }
            } else if (data._attr) {
                filename = data._attr.componentID._value;
            }

            // go to full display page
            var url = '/primo-explore/viewcomponent/' + vm.context + '/' + vm.docid + '?vid=' + vm.params.vid + '&imageId=' + filename;
            if (vm.params.adaptor) {
                url += '&adaptor=' + vm.params.adaptor;
            }

            $window.open(url, '_blank');
        };

        vm.$onInit = function () {

            // initialize banner title so it would display next to logo
            vm.parentCtrl.bannerTitle = 'FULL COMPONENT METADATA';

            setTimeout(function () {
                // hide search bar
                var searchBar = document.getElementsByTagName('prm-search-bar')[0];
                if (searchBar) {
                    searchBar.style.display = 'none';
                }

                // hide top black bar
                var topBar = document.getElementsByTagName('prm-topbar')[0];
                if (topBar) {
                    topBar.style.display = 'none';
                }
            }, 5);

            vm.getData();
        };
    }]);

    angular.module('viewCustom').component('customViewAllComponentMetadata', {
        bindings: { parentCtrl: '<' },
        controller: 'customViewAllComponentMetadataController',
        controllerAs: 'vm',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/custom-view-all-component-metadata.html'
    });
})();
/**
 * Created by samsan on 6/9/17.
 * This component is for a single image full display when a user click on thumbnail from a full display page
 */

(function () {

    angular.module('viewCustom').controller('customViewComponentController', ['$sce', '$mdMedia', 'prmSearchService', '$location', '$stateParams', '$element', '$timeout', 'customMapXmlKeys', '$window', 'customMapXmlValues', function ($sce, $mdMedia, prmSearchService, $location, $stateParams, $element, $timeout, customMapXmlKeys, $window, customMapXmlValues) {

        var vm = this;
        var sv = prmSearchService;
        var cMap = customMapXmlKeys;
        var cMapValue = customMapXmlValues;
        // get location parameter
        vm.params = $location.search();
        // get parameter from angular ui-router
        vm.context = $stateParams.context;
        vm.docid = $stateParams.docid;
        vm.recordid = '';
        vm.filename = vm.params.imageId;
        vm.index = '';
        vm.clientIp = sv.getClientIp();

        vm.photo = {};
        vm.flexsize = 80;
        vm.total = 0;
        vm.itemData = {};
        vm.imageNav = true;
        vm.xmldata = {};
        vm.keys = [];
        vm.imageTitle = '';
        vm.jp2 = false;
        vm.componentData = {}; // single component data
        vm.componentKey = [];

        // remove HVD_VIA from record id of vm.docid
        vm.removeHVD_VIA = function () {
            var pattern = /^(HVD_VIA)/;
            var docid = angular.copy(vm.docid);
            if (pattern.test(docid)) {
                vm.recordid = docid.substring(7, docid.length);
            } else {
                vm.recordid = docid;
            }
        };

        // find index base on file name
        vm.findFilenameIndex = function (arrList, filename) {
            var k = -1;
            for (var i = 0; i < arrList.length; i++) {
                var img = arrList[i];
                if (img.image) {
                    var url = img.image[0]._attr.href._value;
                    if (url.match(vm.filename)) {
                        k = i;
                        i = arrList.length;
                    }
                } else if (img._attr) {
                    var componentID = img._attr.componentID._value;
                    if (componentID === vm.filename) {
                        k = i;
                        i = arrList.length;
                    }
                }
            }
            return k;
        };

        // ajax call to get data
        vm.getData = function () {
            var url = vm.parentCtrl.searchService.cheetah.restBaseURLs.pnxBaseURL + '/' + vm.context + '/' + vm.docid;
            var params = { 'vid': '', 'lang': '', 'search_scope': '', 'adaptor': '' };
            params.vid = vm.params.vid;
            params.lang = vm.params.lang;
            params.search_scope = vm.params.search_scope;
            params.adaptor = vm.params.adaptor;
            sv.getAjax(url, params, 'get').then(function (result) {
                vm.item = result.data;
                // convert xml to json
                if (vm.item.pnx) {
                    if (vm.item.pnx.addata) {
                        var result = sv.parseXml(vm.item.pnx.addata.mis1[0]);
                        if (result.work) {
                            vm.xmldata = result.work[0];
                            if (vm.xmldata.component) {
                                vm.total = vm.xmldata.component.length;
                            }
                            if (vm.item.pnx.display) {
                                vm.keys = Object.keys(vm.item.pnx.display);
                                // remove unwanted key
                                var removeList = cMap.getRemoveList();
                                for (var i = 0; i < removeList.length; i++) {
                                    var key = removeList[i];
                                    var index = vm.keys.indexOf(key);
                                    if (index !== -1) {
                                        vm.keys.splice(index, 1);
                                    }
                                }

                                vm.keys = cMap.sort(vm.keys);
                            }
                        }
                    }
                } else {
                    $window.location.href = '/primo-explore/search?vid=' + vm.params.vid;
                }

                // display photo
                vm.displayPhoto();
            }, function (error) {
                console.log(error);
            });
        };

        // get json key and remove image from the key
        vm.getKeys = function (obj) {
            var keys = Object.keys(obj);
            var removeList = cMap.getRemoveList();
            for (var i = 0; i < removeList.length; i++) {
                var key = removeList[i];
                var index = keys.indexOf(key);
                if (index !== -1) {
                    // remove image from the list
                    keys.splice(index, 1);
                }
            }

            return cMap.getOrderList(keys);
        };

        // get value base on json key
        vm.getValue = function (val, key) {
            return cMapValue.getValue(val, key);
        };

        // display each component value key
        vm.getComponentValue = function (key) {
            var text = '';
            if (vm.componentData && key) {
                var data = vm.componentData[key];
                text = cMapValue.getValue(data, key);
            }
            return text;
        };

        // display each photo component
        vm.displayPhoto = function () {
            vm.isLoggedIn = sv.getLogInID();
            vm.clientIp = sv.getClientIp();
            vm.photo = {};
            if (vm.xmldata.component && !vm.xmldata.image) {
                if (!vm.index && vm.index !== 0) {
                    vm.index = vm.findFilenameIndex(vm.xmldata.component, vm.filename);
                }
                if (vm.index >= 0 && vm.index < vm.total) {
                    vm.componentData = vm.xmldata.component[vm.index];
                    if (vm.componentData.image) {
                        vm.photo = vm.componentData.image[0];
                        // find out if the image is jp2 or not
                        //vm.jp2 = sv.findJP2(vm.photo);
                    }
                }
            } else if (vm.xmldata.image) {
                vm.photo = vm.xmldata.image[0];
                //vm.jp2=sv.findJP2(vm.photo);
                vm.componentData = vm.xmldata.image[0];
            }

            if (vm.photo._attr && vm.photo._attr.restrictedImage) {
                if (vm.photo._attr.restrictedImage._value && vm.isLoggedIn === false && !vm.clientIp.status) {
                    vm.imageNav = false;
                }
            }

            if (vm.photo) {
                if (vm.photo._attr) {
                    var urlList = vm.photo._attr.href._value;
                    urlList = urlList.split('/');
                    if (urlList.length >= 3) {
                        vm.filename = urlList[3];
                    }
                } else if (vm.componentData._attr.componentID) {
                    vm.filename = vm.componentData._attr.componentID._value;
                }
            }
        };

        vm.$onInit = function () {
            vm.removeHVD_VIA();
            // if the smaller screen size, make the flex size to 100.
            if ($mdMedia('sm')) {
                vm.flexsize = 100;
            } else if ($mdMedia('xs')) {
                vm.flexsize = 100;
            }
            // call ajax and display data
            vm.getData();

            // initialize label for image component page
            vm.parentCtrl.bannerTitle = 'FULL IMAGE DETAIL';
            setTimeout(function () {
                // hide search bar
                var searchBar = document.getElementsByTagName('prm-search-bar')[0];
                if (searchBar) {
                    searchBar.style.display = 'none';
                }

                // hide top black bar
                var topBar = document.getElementsByTagName('prm-topbar')[0];
                if (topBar) {
                    topBar.style.display = 'none';
                }
            }, 5);
        };

        // next photo
        vm.nextPhoto = function () {
            vm.index++;
            if (vm.index < vm.total && vm.index >= 0) {
                vm.displayPhoto();
            } else {
                vm.index = 0;
                vm.displayPhoto();
            }
        };
        // prev photo
        vm.prevPhoto = function () {
            vm.index--;
            if (vm.index >= 0 && vm.index < vm.total) {
                vm.displayPhoto();
            } else {
                vm.index = vm.total - 1;
                vm.displayPhoto();
            }
        };
    }]);

    angular.module('viewCustom').component('customViewComponent', {
        bindings: { item: '<', services: '<', params: '<', parentCtrl: '<' },
        controller: 'customViewComponentController',
        controllerAs: 'vm',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/custom-view-component.html'
    });
})();
/**
 * Created by samsan on 6/5/17.
 * A modal dialog pop up the image when a user click on thumbnail image in view full detail page
 */

(function () {

    angular.module('viewCustom').controller('customViewImageDialogController', ['items', '$mdDialog', function (items, $mdDialog) {
        // local variables
        var vm = this;
        vm.item = items;

        // close modal dialog when a user click on x icon
        vm.closeImage = function () {
            $mdDialog.hide();
        };
    }]);
})();

/**
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Crawlink
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * Github - use bower install - from this url https://github.com/Crawlink/material-angular-paging
 * Modify by Sam San
 *
 */

(function () {
    'use strict';

    var app = angular.module("cl.paging", []);

    app.directive('clPaging', ClPagingDirective);

    ClPagingDirective.$inject = [];
    function ClPagingDirective() {
        return {
            restrict: 'EA',
            scope: {
                clPages: '=',
                clAlignModel: '=',
                clPageChanged: '&',
                clSteps: '=',
                clCurrentPage: '='
            },
            controller: ClPagingController,
            controllerAs: 'vm',
            template: ['<ul class="mp-ul">', '<li>', '<md-button class="md-icon-button md-raised md-warn" aria-label="First" ng-click="vm.gotoFirst()">{{ vm.first }}</md-button>', '<div class="mp-move-down">First</div>', '</li>', '<li>', '<md-button class="md-icon-button md-raised " aria-label="Previous Page" ng-click="vm.gotoPrevPage()">{{vm.prev}}</md-button>', '</li>', '<li hide-xs>', '<md-button class="md-icon-button md-raised" aria-label="Previous" ng-click="vm.gotoPrev()" ng-show="vm.index - 1 >= 0">&#8230;</md-button>', '</li>', '<li ng-repeat="i in vm.stepInfo track by $index">', '<md-button class="md-icon-button md-raised" aria-label="Go to page {{i+1}}" ', ' ng-click="vm.goto(vm.index + i)" ng-show="vm.page[vm.index + i]" ', ' ng-class="{\'md-primary\': vm.page[vm.index + i] == clCurrentPage}">', ' {{ vm.page[vm.index + i] }}', '</md-button>', '</li>', '<li hide-xs>', '<md-button class="md-icon-button md-raised" aria-label="Next" ng-click="vm.gotoNext()" ng-show="vm.index + vm.clSteps < clPages">&#8230;</md-button>', '</li>', '<li>', '<md-button class="md-icon-button md-raised " aria-label="Next page" ng-click="vm.gotoNextPage()">{{vm.next}}</md-button>', '</li>', '<li>', '<md-button class="md-icon-button md-raised md-warn" aria-label="Last" ng-click="vm.gotoLast()">{{ vm.last }}</md-button>', '<div class="mp-move-down">Last</div>', '</li>', '</ul>'].join('')
        };
    }

    ClPagingController.$inject = ['$scope', '$location', '$anchorScroll'];
    function ClPagingController($scope, $location, $anchorScroll) {
        var vm = this;

        vm.prev = '<';
        vm.next = '>';
        vm.first = '<<';
        vm.last = '>>';

        vm.index = 0;
        vm.clSteps = $scope.clSteps;

        // modify go to next page
        vm.gotoNextPage = function () {
            if ($scope.clCurrentPage < $scope.clPages) {
                vm.index++;
                $scope.clCurrentPage++;
                // customize scroll up
                $location.hash('searchResultList');
                $anchorScroll();
            }
        };

        vm.gotoPrevPage = function () {
            if ($scope.clCurrentPage > 1) {
                vm.index--;
                $scope.clCurrentPage--;
                // customize scroll up
                $location.hash('searchResultList');
                $anchorScroll();
            }
        };

        vm.goto = function (index) {
            $scope.clCurrentPage = vm.page[index];
            // customize scroll up
            $location.hash('searchResultList');
            $anchorScroll();
        };

        vm.gotoPrev = function () {
            $scope.clCurrentPage = vm.index;
            vm.index -= vm.clSteps;
            $location.hash('searchResultList');
            $anchorScroll();
        };

        vm.gotoNext = function () {
            vm.index += vm.clSteps;
            $scope.clCurrentPage = vm.index + 1;
            // customize to scroll up
            $location.hash('searchResultList');
            $anchorScroll();
        };

        vm.gotoFirst = function () {
            vm.index = 0;
            $scope.clCurrentPage = 1;
            // customize to scroll up
            $location.hash('searchResultList');
            $anchorScroll();
        };

        vm.gotoLast = function () {
            vm.index = parseInt($scope.clPages / vm.clSteps) * vm.clSteps;
            vm.index === $scope.clPages ? vm.index = vm.index - vm.clSteps : '';
            $scope.clCurrentPage = $scope.clPages;
            // customize to scroll up
            $location.hash('searchResultList');
            $anchorScroll();
        };

        $scope.$watch('clCurrentPage', function (value) {
            vm.index = parseInt((value - 1) / vm.clSteps) * vm.clSteps;
            $scope.clPageChanged();
        });

        $scope.$watch('clPages', function () {
            vm.init();
        });

        vm.init = function () {
            vm.stepInfo = function () {
                var result = [];
                for (var i = 0; i < vm.clSteps; i++) {
                    result.push(i);
                }
                return result;
            }();

            vm.page = function () {
                var result = [];
                for (var i = 1; i <= $scope.clPages; i++) {
                    result.push(i);
                }
                return result;
            }();
        };
    };
})();
/**
 * Created by samsan on 5/23/17.
 * If image has height that is greater than 150 px, then it will resize it. Otherwise, it just display what it is.
 */

(function () {

    angular.module('viewCustom').component('multipleThumbnail', {
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/multipleThumbnail.html',
        bindings: {
            itemdata: '<',
            searchdata: '<'
        },
        controllerAs: 'vm',
        controller: ['$element', '$timeout', 'prmSearchService', function ($element, $timeout, prmSearchService) {
            var vm = this;
            var sv = prmSearchService;
            vm.localScope = { 'imgclass': '', 'hideLockIcon': false, 'hideTooltip': false };
            vm.imageUrl = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
            vm.src = '';
            vm.imageTitle = '';
            vm.restricted = false;
            vm.imageFlag = false;

            // check if image is not empty and it has width and height and greater than 150, then add css class
            vm.$onChanges = function () {

                vm.localScope = { 'imgclass': '', 'hideLockIcon': false };
                if (vm.itemdata.image) {
                    vm.imageFlag = true;
                    if (vm.itemdata.image.length === 1) {
                        vm.src = vm.itemdata.image[0].thumbnail[0]._attr.href._value + '?width=150&height=150';
                        vm.restricted = vm.itemdata.image[0]._attr.restrictedImage._value;
                        if (vm.itemdata.image[0].caption) {
                            vm.imageTitle = vm.itemdata.image[0].caption[0]._text;
                        } else if (vm.itemdata.title) {
                            vm.imageTitle = vm.itemdata.title[0].textElement[0]._text;
                        }
                    }
                } else if (vm.itemdata.title) {
                    vm.imageTitle = vm.itemdata.title[0].textElement[0]._text;
                }

                if (vm.src && vm.imageFlag) {
                    vm.imageUrl = sv.getHttps(vm.src);
                    $timeout(function () {
                        var img = $element.find('img')[0];
                        // use default image if it is a broken link image
                        var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                        if (pattern.test(vm.src)) {
                            img.src = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
                        }
                        img.onload = vm.callback;
                        if (img.clientWidth > 50) {
                            vm.callback();
                        }
                    }, 300);
                }
            };
            vm.callback = function () {
                var image = $element.find('img')[0];
                if (image.height > 150) {
                    vm.localScope.imgclass = 'responsivePhoto';
                    image.className = 'md-card-image ' + vm.localScope.imgclass;
                }
                // show lock up icon
                if (vm.restricted) {
                    vm.localScope.hideLockIcon = true;
                }
            };

            $element.bind('contextmenu', function (e) {
                e.preventDefault();
                return false;
            });
        }]
    });
})();

/**
 * Created by samsan on 6/22/17.
 */

(function () {

    angular.module('viewCustom').component('noResultsFound', {
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/no-results-found.html',
        bindings: {
            itemlength: '<'
        },
        controllerAs: 'vm',
        controller: [function () {
            var vm = this;
            vm.localScope = { 'showFlag': false };

            vm.$onChanges = function () {
                if (vm.itemlength === 0) {
                    vm.localScope.showFlag = true;
                }
            };
        }]
    });
})();

/**
 * Created by samsan on 8/15/17.
 * Overwrite the print default . It must turn on print from back end first before it can overwrite.
 */

(function () {

    angular.module('viewCustom').controller('prmActionListAfterCtrl', ['$element', '$compile', '$scope', '$timeout', 'customService', function ($element, $compile, $scope, $timeout, customService) {
        var vm = this;
        var cisv = customService;

        vm.$onChanges = function () {
            $timeout(function () {

                // print
                var printEl = document.getElementById('Print');
                if (printEl) {
                    printEl.children[0].remove();
                    var printTag = document.createElement('custom-print');
                    printTag.setAttribute('parent-ctrl', 'vm.parentCtrl.item');
                    printEl.appendChild(printTag);
                    $compile(printEl.children[0])($scope);
                }
            }, 2000);
        };

        vm.$doCheck = function () {
            // pass active action to prm-action-container-after
            if (vm.parentCtrl.activeAction) {
                cisv.setActionName(vm.parentCtrl.activeAction);
            }
        };
    }]);

    angular.module('viewCustom').component('prmActionListAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmActionListAfterCtrl',
        controllerAs: 'vm'
    });
})();

/**
 * Created by samsan on 5/25/17.
 */

(function () {

    angular.module('viewCustom').controller('prmAuthenticationAfterController', ['prmSearchService', function (prmSearchService) {
        var vm = this;
        // initialize custom service search
        var sv = prmSearchService;
        vm.api = sv.getApi();
        vm.form = { 'ip': '', 'status': false, 'token': '', 'sessionToken': '', 'isLoggedIn': '' };

        vm.validateIP = function () {
            vm.api = sv.getApi();
            if (vm.api.ipUrl) {
                sv.postAjax(vm.api.ipUrl, vm.form).then(function (result) {
                    sv.setClientIp(result.data);
                }, function (error) {
                    console.log(error);
                });
            }
        };

        vm.getClientIP = function () {
            vm.auth = sv.getAuth();
            if (vm.auth.primolyticsService.jwtUtilService) {
                vm.form.token = vm.auth.primolyticsService.jwtUtilService.storageUtil.sessionStorage.primoExploreJwt;
                vm.form.sessionToken = vm.auth.primolyticsService.jwtUtilService.storageUtil.localStorage.getJWTFromSessionStorage;
                vm.form.isLoggedIn = vm.auth.isLoggedIn;
                // decode JWT Token to see if it is a valid token
                var obj = vm.auth.authenticationService.userSessionManagerService.jwtUtilService.jwtHelper.decodeToken(vm.form.token);
                if (vm.auth.isLoggedIn) {
                    var status = { 'ip': '0.0.0.0', 'status': true };
                    sv.setClientIp(status);
                    sv.setLogInID(vm.auth.isLoggedIn);
                    vm.form.status = true;
                } else {
                    vm.form.ip = obj.ip;
                    vm.validateIP();
                }
            }
        };

        // get rest endpoint Url
        vm.getUrl = function () {
            var configFile = sv.getEnv();
            sv.getAjax('/primo-explore/custom/01HVD_IMAGES/html/' + configFile, '', 'get').then(function (res) {
                vm.api = res.data;
                sv.setApi(vm.api);
                vm.getClientIP();
            }, function (error) {
                console.log(error);
            });
        };

        // check if a user login
        vm.$onInit = function () {
            // This flag is return true or false
            var loginID = vm.parentCtrl.isLoggedIn;
            sv.setLogInID(loginID);
            sv.setAuth(vm.parentCtrl);

            setTimeout(function () {
                vm.api = sv.getApi();
                if (!vm.api.ipUrl) {
                    vm.getUrl();
                } else {
                    // get client ip address to see if a user is internal or external user
                    vm.getClientIP();
                }
            }, 50);
        };
    }]);

    angular.module('viewCustom').component('prmAuthenticationAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmAuthenticationAfterController'
    });
})();

/**
 * Created by samsan on 6/15/17.
 */

(function () {

    angular.module('viewCustom').controller('prmBackToSearchResultsButtonAfterController', ['$sce', 'angularLoad', '$window', 'prmSearchService', '$location', function ($sce, angularLoad, $window, prmSearchService, $location) {

        var vm = this;
        var sv = prmSearchService;
        vm.params = $location.search();

        // get items from custom single image component
        vm.$doCheck = function () {
            vm.photo = sv.getPhoto();
        };

        // go back to search result list
        vm.goToSearch = function () {
            var url = '/primo-explore/search?query=' + vm.params.q + '&vid=' + vm.parentCtrl.$stateParams.vid;
            url += '&sortby=' + vm.parentCtrl.$stateParams.sortby + '&lang=' + vm.parentCtrl.$stateParams.lang;
            url += '&=search_scope=' + vm.parentCtrl.$stateParams.search_scope;
            url += '&searchString=' + vm.params.searchString;
            if (vm.parentCtrl.$stateParams.tab) {
                url += '&tab=' + vm.parentCtrl.$stateParams.tab;
            }
            if (vm.params.facet) {
                if (Array.isArray(vm.params.facet)) {
                    for (var i = 0; i < vm.params.facet.length; i++) {
                        url += '&facet=' + vm.params.facet[i];
                    }
                } else {
                    url += '&facet=' + vm.params.facet;
                }
            }
            if (vm.params.offset) {
                url += '&offset=' + vm.params.offset;
            }
            $window.location.href = url;
        };

        // go back to full display page of thumbnail images
        vm.goToImages = function () {
            var url = '/primo-explore/fulldisplay?docid=' + vm.parentCtrl.$stateParams.docid + '&q=' + vm.params.q + '&vid=' + vm.parentCtrl.$stateParams.vid;
            url += '&sortby=' + vm.parentCtrl.$stateParams.sortby + '&lang=' + vm.parentCtrl.$stateParams.lang;
            url += '&context=' + vm.parentCtrl.$stateParams.context + '&adaptor=' + vm.parentCtrl.$stateParams.adaptor;
            url += '&tab=' + vm.parentCtrl.$stateParams.tab + '&search_scope=' + vm.parentCtrl.$stateParams.search_scope;
            url += '&searchString=' + vm.params.searchString;
            if (vm.params.facet) {
                if (Array.isArray(vm.params.facet)) {
                    for (var i = 0; i < vm.params.facet.length; i++) {
                        url += '&facet=' + vm.params.facet[i];
                    }
                } else {
                    url += '&facet=' + vm.params.facet;
                }
            }
            if (vm.params.offset) {
                url += '&offset=' + vm.params.offset;
            }
            $window.location.href = url;
        };
    }]);

    angular.module('viewCustom').component('prmBackToSearchResultsButtonAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmBackToSearchResultsButtonAfterController',
        controllerAs: 'vm',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/prm-back-to-search-results-button-after.html'
    });
})();

/**
 * Created by samsan on 6/13/17.
 */

(function () {

    angular.module('viewCustom').controller('prmBreadcrumbsAfterController', ['prmSearchService', function (prmSearchService) {
        var vm = this;
        // initialize custom service search
        var sv = prmSearchService;
        // get page object


        vm.$onChanges = function () {
            // capture user select facets
            sv.setFacets(vm.parentCtrl.selectedFacets);
            // reset the current page to beginning when a user select new facets
            var pageObj = sv.getPage();
            pageObj.currentPage = 1;
            sv.setPage(pageObj);
        };
    }]);

    angular.module('viewCustom').component('prmBreadcrumbsAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmBreadcrumbsAfterController'
    });
})();
/**
 * Created by samsan on 6/30/17.
 */

(function () {
    angular.module('viewCustom').controller('prmBriefResultContainerAfterController', [function () {

        var vm = this;

        vm.$onChanges = function () {
            // hide IMAGE
            vm.parentCtrl.showItemType = false;
        };
    }]);

    angular.module('viewCustom').component('prmBriefResultContainerAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmBriefResultContainerAfterController'
    });
})();
/**
 * Created by samsan on 5/30/17.
 */

(function () {
    angular.module('viewCustom').controller('prmFacetAfterController', ['prmSearchService', '$location', function (prmSearchService, $location) {
        var vm = this;
        vm.params = $location.search();
        var sv = prmSearchService;
        // get page object
        var pageObj = sv.getPage();

        vm.$onChanges = function () {

            // if there is no facet, remove it from service
            if (!vm.parentCtrl.$stateParams.facet) {
                // reset facet if it is empty
                pageObj.currentPage = 1;
                sv.setPage(pageObj);
                sv.setFacets([]);
            }
        };
    }]);

    angular.module('viewCustom').component('prmFacetAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmFacetAfterController'
    });
})();
/**
 * Created by samsan on 5/17/17.
 * This template is for direct access full view display link when a user send email to someone
 */

(function () {

    angular.module('viewCustom').controller('prmFullViewAfterController', ['prmSearchService', '$location', function (prmSearchService, $location) {

        var sv = prmSearchService;
        var vm = this;
        vm.item = vm.parentCtrl.item;
        vm.params = $location.search();
        vm.services = [];

        vm.showSingImagePage = function () {
            // remove virtual browse shelf and more link
            var k = 0;
            for (var i = 0; i < vm.parentCtrl.services.length; i++) {
                if (vm.parentCtrl.services[i].serviceName === 'details') {
                    vm.services[k] = vm.parentCtrl.services[i];
                    k++;
                } else if (vm.parentCtrl.services[i].scrollId === 'getit_link1_0') {
                    vm.services[k] = vm.parentCtrl.services[i];
                    k++;
                }
            }

            for (var i = 0; i < vm.parentCtrl.services.length; i++) {
                vm.parentCtrl.services.splice(i);
            };
            sv.setData(vm);
        };

        vm.$onChanges = function () {
            if (!vm.parentCtrl.searchService.query) {
                vm.parentCtrl.searchService.query = vm.params.query;
                vm.parentCtrl.searchService.$stateParams.query = vm.params.query;
                vm.parentCtrl.mainSearchField = vm.params.searchString;
            }

            if (vm.item.pnx) {
                // when a user access full view detail page, it has no mis1Data so it need to convert xml to json data
                if (!vm.item.mis1Data) {
                    var item = [];
                    item[0] = vm.item;
                    item = sv.convertData(item);
                    vm.item = item[0];
                }

                // set data to build full display page
                var itemData = { 'item': '', 'searchData': '' };
                itemData.item = vm.item;
                if (vm.parentCtrl.searchService.cheetah.searchData) {
                    // this data is available from over layer slide page
                    itemData.searchData = vm.parentCtrl.searchService.cheetah.searchData;
                } else {
                    // this data is available only from fulldisplay url
                    itemData.searchData = vm.params;
                    itemData.searchData.scope = vm.params.search_scope;
                }
                sv.setItem(itemData);
            }
        };

        vm.$onInit = function () {
            vm.params = $location.search();
        };
    }]);

    angular.module('viewCustom').component('prmFullViewAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmFullViewAfterController',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/prm-full-view-after.html'
    });
})();

/**
 * Created by samsan on 6/8/17.
 * This component add customize logo and Hollis Images text
 */

(function () {
    angular.module('viewCustom').controller('prmLogoAfterController', ['$element', function ($element) {

        var vm = this;

        vm.$onChanges = function () {
            // remove flex top bar and also remove tab menus
            var el = $element[0].parentNode.parentNode;
            el.children[2].remove();
            el.children[2].remove();

            // remove logo div
            var el2 = $element[0].parentNode;
            el2.children[0].remove();

            // remove prm-skip-to
            var el3 = $element[0].parentNode.parentNode;
            if (el3) {
                el3.children[0].remove();
            }
        };
    }]);

    angular.module('viewCustom').component('prmLogoAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmLogoAfterController',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/prm-logo-after.html'
    });
})();
/**
 * Created by samsan on 9/18/17.
 */

(function () {

    angular.module('viewCustom').controller('prmPermalinkAfterCtrl', ['$scope', function ($scope) {
        var vm = this;
        vm.$onInit = function () {
            // change perm a link to correct url
            $scope.$watch('vm.parentCtrl.permalink', function () {
                if (vm.parentCtrl.item) {
                    if (vm.parentCtrl.item.pnx.display.lds03[0]) {
                        vm.parentCtrl.permalink = vm.parentCtrl.item.pnx.display.lds03[0];
                    }
                }
            });
        };
    }]);

    angular.module('viewCustom').component('prmPermalinkAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmPermalinkAfterCtrl',
        controllerAs: 'vm'
    });
})();
/**
 * Created by samsan on 5/22/17.
 * Access search box json data. Then change the number item per page. See prm-search-service.js file
 */

(function () {

    angular.module('viewCustom').controller('prmSearchBarAfterController', ['prmSearchService', '$location', function (prmSearchService, $location) {
        var vm = this;
        // initialize custom service search
        var sv = prmSearchService;
        // get page object
        var pageObj = sv.getPage();
        sv.removePageInfo();

        vm.$onChanges = function () {
            pageObj.currentPage = 1;
            pageObj.totalItems = 0;
            pageObj.totalPages = 0;
            pageObj.userClick = false;
            sv.setPage(pageObj);

            // show text in search box
            if (!vm.parentCtrl.mainSearchField) {
                var params = $location.search();
                if (params.searchString) {
                    vm.parentCtrl.mainSearchField = params.searchString;
                }
            }
        };
    }]);

    angular.module('viewCustom').component('prmSearchBarAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmSearchBarAfterController',
        'template': '<div id="searchResultList"></div>'
    });
})();

/**
 * Created by samsan on 7/10/17.
 * It may not use at all
 */

(function () {

    angular.module('viewCustom').controller('prmSearchHistoryAfterController', ['prmSearchService', '$window', function (prmSearchService, $window) {

        var sv = prmSearchService;
        var vm = this;
        vm.itemlist = [];

        // open database connection, dbName=lf, dbVersion=2
        var db;
        var request = $window.indexedDB.open('lf', 2);
        request.onerror = function (err) {
            console.log('*** error ***');
            console.log(err);
        };

        request.onsuccess = function (e) {
            db = request.result;
            console.log('*** success ***');
            console.log(db);
        };

        // for update or create new record
        request.onupgradeneeded = function (e) {
            console.log('*** upgrade needed ****');
            console.log(e);
        };

        vm.$doCheck = function () {
            vm.itemlist = vm.parentCtrl.searchHistoryService.items;
            //console.log('*** prm-search-history-after ****');
            //console.log(vm);
        };

        vm.removeSearchHistoryItem = function (id) {
            //anonymous-0712_145554_SearchHistoryQeuriesKey

            var query = db.transaction(['keyvaluepairs'], "readwrite").objectStore('keyvaluepairs').get('anonymous-0712_145554_SearchHistoryQeuriesKey');

            console.log(query);

            query.onerror = function (err) {
                console.log('*** error ***');
                console.log(err);
            };

            query.onsuccess = function (e) {
                var result = query.result;
                console.log('* success result ***');
                console.log(result);
                console.log('*** id ***');
                console.log(id);
            };
        };
    }]);

    angular.module('viewCustom').component('prmSearchHistoryAfter2', {
        bindings: { parentCtrl: '<' },
        controller: 'prmSearchHistoryAfterController',
        controllerAs: 'vm',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/prm-search-history-after.html'
    });
})();

/* Author: Sam San
 This custom component is used for search result list which display all the images in thumbnail.
 */

(function () {

    angular.module('viewCustom').controller('prmSearchResultListAfterController', ['prmSearchService', '$mdDialog', '$element', '$mdMedia', '$state', '$timeout', function (prmSearchService, $mdDialog, $element, $mdMedia, $state, $timeout) {

        // call custom service from the injection
        var sv = prmSearchService;
        this.searchInfo = sv.getPage(); // get page info object

        var vm = this;
        var ev = '';
        var dialog = '';
        vm.searchInProgress = true;
        vm.modalDialogFlag = false;
        vm.currentPage = 1;
        vm.flag = false;
        vm.searchData = {};
        vm.paginationNumber = 6;
        vm.index = 0;
        vm.flexSize = { 'size1': 20, 'size2': 80, 'class': 'spaceLeft15' };
        // set search result set per page, default 50 items per page

        // set up page counter
        vm.pageCounter = { 'min': 0, 'max': 0 };
        // calculate the page counter such as 1-50 of 1,232
        this.findPageCounter = function () {
            vm.pageCounter.min = (this.searchInfo.currentPage - 1) * this.searchInfo.pageSize + 1;

            if (vm.pageCounter.min > this.searchInfo.totalItems) {
                vm.pageCounter.min = this.searchInfo.totalItems;
            }
            vm.pageCounter.max = this.searchInfo.currentPage * this.searchInfo.pageSize;
            if (vm.pageCounter.max > this.searchInfo.totalItems) {
                vm.pageCounter.max = this.searchInfo.totalItems;
            }
        };

        // when a user click on next page or select new row from the drop down, it call this search function to get new data
        vm.ajaxSearch = function () {
            this.searchInfo = sv.getPage();
            var limit = this.searchInfo.pageSize;
            var remainder = parseInt(this.searchInfo.totalItems) - parseInt(this.searchInfo.currentPage - 1) * parseInt(this.searchInfo.pageSize);

            if (remainder < this.searchInfo.pageSize) {
                limit = remainder;
            }

            var params = { 'addfields': [], 'offset': 0, 'limit': 50, 'lang': 'en_US', 'inst': '01HVD', 'getMore': 0, 'pcAvailability': true, 'q': '', 'rtaLinks': true,
                'sort': 'rank', 'tab': 'default_tab', 'vid': '01HVD_IMAGES', 'scope': 'default_scope', 'qExclude': '', 'qInclude': '', 'searchString': '', 'mode': '', 'multiFacets': '' };

            params.limit = limit;
            params.offset = (this.searchInfo.currentPage - 1) * this.searchInfo.pageSize;

            if (vm.parentCtrl.searchService.cheetah.searchData) {
                params.q = vm.parentCtrl.searchService.cheetah.searchData.q;
                params.searchString = vm.parentCtrl.searchService.cheetah.searchData.searchString;
                params.mode = vm.parentCtrl.searchService.cheetah.searchData.mode;
                params.lang = vm.parentCtrl.searchService.cheetah.searchData.lang;
                params.sort = vm.parentCtrl.searchService.cheetah.searchData.sort;
                params.tab = vm.parentCtrl.searchService.cheetah.searchData.tab;
                params.scope = vm.parentCtrl.searchService.cheetah.searchData.scope;
                params.inst = vm.parentCtrl.searchService.cheetah.searchData.inst;
                params.vid = vm.parentCtrl.searchService.cheetah.searchData.vid;
                params.qInclude = vm.parentCtrl.searchService.cheetah.searchData.qInclude;
                params.qExclude = vm.parentCtrl.searchService.cheetah.searchData.qExclude;
                params.getMore = vm.parentCtrl.searchService.cheetah.searchData.getMore;
                params.pcAvailability = vm.parentCtrl.searchService.cheetah.searchData.pcAvailability;
                params.addfields = vm.parentCtrl.searchService.cheetah.searchData.addfields;
            }

            // start ajax loader progress bar
            vm.parentCtrl.searchService.searchStateService.searchObject.newSearch = true;
            vm.parentCtrl.searchService.searchStateService.searchObject.searchInProgress = true;
            vm.parentCtrl.searchService.searchStateService.searchObject.offset = params.offset;

            // multiFacets
            if (vm.parentCtrl.searchService.cheetah.searchData.multiFacets) {
                params.multiFacets = vm.parentCtrl.searchService.cheetah.searchData.multiFacets.toString();
            }

            // get the current search rest url
            var url = vm.parentCtrl.briefResultService.restBaseURLs.pnxBaseURL;
            sv.getAjax(url, params, 'get').then(function (data) {
                var mydata = data.data;
                vm.items = sv.convertData(mydata.docs);
                // stop the ajax loader progress bar
                vm.parentCtrl.searchService.searchStateService.searchObject.newSearch = false;
                vm.parentCtrl.searchService.searchStateService.searchObject.searchInProgress = false;
                vm.searchInProgress = false;
            }, function (err) {
                console.log(err);
                vm.parentCtrl.searchService.searchStateService.searchObject.newSearch = false;
                vm.parentCtrl.searchService.searchStateService.searchObject.searchInProgress = false;
                vm.searchInProgress = false;
            });
        };

        // when a user click on next page or prev page, it call this function.
        this.pageChanged = function (currentPage) {
            // prevent calling ajax twice during refresh the page or click on facets
            if (!vm.flag) {
                this.searchInfo.currentPage = currentPage;
                this.searchInfo.userClick = true;
                this.searchInfo.offset = parseInt(currentPage - 1) * this.searchInfo.pageSize;
                this.searchInfo.searchString = vm.parentCtrl.searchString;
                this.searchInfo.query = vm.parentCtrl.$stateParams.query;
                sv.setPage(this.searchInfo); // keep track a user click on each current page
                // ajax call function
                if (vm.parentCtrl.isFavorites === false) {
                    vm.ajaxSearch();
                }
                // calculate the min and max of items
                this.findPageCounter();
            }
            vm.flag = false;
        };

        vm.items = [];

        vm.$onInit = function () {
            var _this = this;

            if (vm.parentCtrl.isFavorites === false) {

                // remove left margin on result list grid
                var el = $element[0].parentNode.parentNode.parentNode;
                el.children[0].remove();

                // remove prm-result-list display item if the favorite page is false
                var parentNode = $element[0].parentNode.children[0];
                parentNode.remove();

                this.searchInfo = sv.getPage(); // get page info object
                // watch for new data change when a user search

                vm.parentCtrl.$scope.$watch(function () {
                    return vm.parentCtrl.searchResults;
                }, function (newVal, oldVal) {

                    if (vm.parentCtrl.$stateParams.offset > 0) {
                        vm.currentPage = parseInt(vm.parentCtrl.$stateParams.offset / _this.searchInfo.pageSize) + 1;
                        _this.searchInfo.currentPage = parseInt(vm.parentCtrl.$stateParams.offset / _this.searchInfo.pageSize) + 1;
                    } else {
                        vm.currentPage = 1;
                        _this.searchInfo.currentPage = 1;
                    }
                    vm.flag = true;
                    // convert xml data into json data so it knows which image is a restricted image
                    if (vm.parentCtrl.isFavorites === false && vm.parentCtrl.searchResults) {
                        vm.items = sv.convertData(vm.parentCtrl.searchResults);
                    }
                    // set up pagination
                    _this.searchInfo.totalItems = vm.parentCtrl.totalItems;
                    _this.searchInfo.totalPages = parseInt(vm.parentCtrl.totalItems / _this.searchInfo.pageSize);
                    if (_this.searchInfo.pageSize * _this.searchInfo.totalPages < _this.searchInfo.totalItems) {
                        _this.searchInfo.totalPages++;
                    }

                    _this.findPageCounter();

                    _this.searchInfo.query = vm.parentCtrl.$stateParams.query;
                    _this.searchInfo.searchString = vm.parentCtrl.searchString;
                    sv.setPage(_this.searchInfo);
                    vm.searchInProgress = vm.parentCtrl.searchInProgress;
                });
            }
        };

        vm.$onChanges = function () {
            if (vm.parentCtrl.isFavorites === false) {
                vm.searchData = vm.parentCtrl.searchService.cheetah.searchData;
                if (vm.parentCtrl.searchString) {
                    vm.searchData.searchString = vm.parentCtrl.searchString;
                }
            }
            // for small screen size
            if ($mdMedia('xs')) {
                vm.paginationNumber = 2;
                vm.flexSize.size1 = 100;
                vm.flexSize.size2 = 100;
                vm.flexSize.class = '';
            } else if ($mdMedia('sm')) {
                vm.paginationNumber = 4;
            }

            // set data to pass into favorite list controller
            sv.setData(vm.parentCtrl);
        };

        vm.$doCheck = function () {
            vm.modalDialogFlag = sv.getDialogFlag();
        };

        this.closeDialog = function () {
            sv.setDialogFlag(false);
            vm.modalDialogFlag = false;
            $mdDialog.hide();
        };

        // for click
        vm.popup = function (e, index) {
            ev = e;
            vm.modalDialogFlag = true;
            vm.index = index;
            var dataitem = vm.items[vm.index];
            vm.itemData = { 'item': '', 'searchData': '' };
            vm.itemData.item = dataitem;
            vm.itemData.searchData = vm.searchData;
            sv.setItem(vm.itemData);
            vm.goto();
            $timeout(function () {
                vm.openDialog();
            }, 500);
        };

        // for keypress
        vm.popup2 = function (e, index) {
            if (e.which === 13) {
                vm.popup(e, index);
            }
        };

        // go to full display state
        vm.goto = function () {
            var obj = { docid: vm.itemData.item.pnx.control.recordid[0], vid: '01HVD_IMAGES', lang: 'en_US', search_scope: vm.searchData.scope, tab: vm.searchData.tab, q: vm.searchData['q'], searchString: vm.searchData['searchString'], sortby: vm.searchData.sort, offset: vm.searchData.offset };
            $state.go('fulldisplay', obj, { location: false, reload: true, notify: false });
        };

        // open modal dialog when click on thumbnail image
        vm.openDialog = function () {
            dialog = $mdDialog.show({
                title: 'Full View Details',
                targetEvent: ev,
                clickOutsideToClose: true,
                focusOnOpen: true,
                escapeToClose: true,
                bindToController: true,
                templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/custom-full-view-dialog.html',
                controller: 'customFullViewDialogController',
                controllerAs: 'vm',
                fullscreen: true,
                multiple: true,
                openFrom: { left: 0 },
                locals: {
                    items: vm.itemData
                },
                onComplete: function onComplete(scope, element) {
                    sv.setDialogFlag(true);
                },
                onRemoving: function onRemoving(element, removePromise) {
                    sv.setDialogFlag(false);
                }
            });

            return false;
        };

        this.getPreviousRecord = function () {
            if (vm.index > 0 && vm.index < vm.items.length) {
                vm.index--;
                vm.popup(ev, vm.index);
            }
        };

        this.getNextRecord = function () {
            if (!dialog.$$state.status) {
                if (vm.index >= 0 && vm.index < vm.items.length - 1) {
                    vm.index++;
                    vm.popup(ev, vm.index);
                }
            }
        };
    }]);

    angular.module('viewCustom').component('prmSearchResultListAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmSearchResultListAfterController',
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/prm-search-results.html'
    });
})();
/**
 * Created by samsan on 5/12/17.
 * This custom service use to inject to the controller.
 */

(function () {

    angular.module('viewCustom').service('prmSearchService', ['$http', '$window', '$filter', function ($http, $window, $filter) {

        var serviceObj = {};

        // get environment to run config.html
        serviceObj.getEnv = function () {
            var host = $window.location.hostname;
            var config = 'config-prod.html';
            if (host.toLowerCase() === 'localhost') {
                config = 'config-local.html';
            } else if (host.toLowerCase() === 'harvard-primosb.hosted.exlibrisgroup.com') {
                config = 'config-dev.html';
            }

            return config;
        };

        serviceObj.getBrowserType = function () {
            var userAgent = $window.navigator.userAgent;
            var browsers = { chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i };
            for (var key in browsers) {
                if (browsers[key].test(userAgent)) {
                    return key;
                }
            };

            return '';
        };

        //http ajax service, pass in URL, parameters, method. The method can be get, post, put, delete
        serviceObj.getAjax = function (url, param, methodType) {
            return $http({
                'method': methodType,
                'url': url,
                'params': param
            });
        };

        serviceObj.postAjax = function (url, jsonObj) {
            return $http({
                'method': 'post',
                'url': url,
                'data': jsonObj
            });
        };

        // default page info
        serviceObj.page = { 'pageSize': 50, 'totalItems': 0, 'currentPage': 1, 'query': '', 'searchString': '', 'totalPages': 0, 'offset': 0, 'userClick': false };
        // getter for page info
        serviceObj.getPage = function () {
            // localStorage page info exist, just use the old one
            if ($window.localStorage.getItem('pageInfo')) {
                return JSON.parse($window.localStorage.getItem('pageInfo'));
            } else {
                return serviceObj.page;
            }
        };

        // setter for page info
        serviceObj.setPage = function (pageInfo) {
            // store page info on client browser by using html 5 local storage
            if ($window.localStorage.getItem('pageInfo')) {
                $window.localStorage.removeItem('pageInfo');
            }
            $window.localStorage.setItem('pageInfo', JSON.stringify(pageInfo));
            serviceObj.page = pageInfo;
        };

        // clear local storage
        serviceObj.removePageInfo = function () {
            if ($window.localStorage.getItem('pageInfo')) {
                $window.localStorage.removeItem('pageInfo');
            }
        };

        // replace & . It cause error in firefox;
        serviceObj.removeInvalidString = function (str) {
            var pattern = /[\&]/g;
            return str.replace(pattern, '&amp;');
        };

        //parse xml
        serviceObj.parseXml = function (str) {
            var options = {
                mergeCDATA: true, // extract cdata and merge with text nodes
                grokAttr: true, // convert truthy attributes to boolean, etc
                grokText: false, // convert truthy text/attr to boolean, etc
                normalize: true, // collapse multiple spaces to single space
                xmlns: true, // include namespaces as attributes in output
                namespaceKey: '_ns', // tag name for namespace objects
                textKey: '_text', // tag name for text nodes
                valueKey: '_value', // tag name for attribute values
                attrKey: '_attr', // tag for attr groups
                cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
                attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
                stripAttrPrefix: true, // remove namespace prefixes from attributes
                stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
                childrenAsArray: true // force children into arrays
            };

            str = serviceObj.removeInvalidString(str);
            return xmlToJSON.parseString(str, options);
        };

        // maninpulate data and convert xml data to json
        serviceObj.convertData = function (data) {
            var newData = [];
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                obj.restrictedImage = false;
                if (obj.pnx.addata.mis1) {
                    if (obj.pnx.addata.mis1.length > 0) {
                        var jsonObj = serviceObj.getXMLdata(obj.pnx.addata.mis1[0]);
                        if (jsonObj.surrogate) {
                            for (var k = 0; k < jsonObj.surrogate.length; k++) {
                                if (jsonObj.surrogate[k].image) {
                                    if (jsonObj.surrogate[k].image[0]._attr) {
                                        if (jsonObj.surrogate[k].image[0]._attr.restrictedImage._value) {
                                            obj.restrictedImage = true;
                                            k = jsonObj.surrogate.length;
                                        }
                                    }
                                }
                            }
                        }
                        if (jsonObj.image) {
                            for (var k = 0; k < jsonObj.image.length; k++) {
                                if (jsonObj.image[k]._attr.restrictedImage) {
                                    if (jsonObj.image[k]._attr.restrictedImage._value) {
                                        obj.restrictedImage = true;
                                        k = jsonObj.image.length;
                                    }
                                }
                            }
                        }
                    }
                }
                // remove the $$U infront of url
                if (obj.pnx.links.thumbnail) {
                    var imgUrl = $filter('urlFilter')(obj.pnx.links.thumbnail);
                    obj.pnx.links.thumbnail[0] = serviceObj.getHttps(imgUrl);
                }
                newData[i] = obj;
            }

            return newData;
        };

        // get user login ID
        serviceObj.logID = false;
        serviceObj.setLogInID = function (logID) {
            serviceObj.logID = logID;
        };

        serviceObj.getLogInID = function () {
            return serviceObj.logID;
        };

        // getter and setter for item data for view full detail page
        serviceObj.item = {};
        serviceObj.setItem = function (item) {
            serviceObj.item = item;
        };

        serviceObj.getItem = function () {
            return serviceObj.item;
        };

        // getter and setter for single image data
        serviceObj.data = {};
        serviceObj.setData = function (data) {
            serviceObj.data = data;
        };

        serviceObj.getData = function () {
            return serviceObj.data;
        };

        // getter and setter for selected facet
        serviceObj.facets = [];
        serviceObj.setFacets = function (data) {
            serviceObj.facets = data;
        };
        serviceObj.getFacets = function () {
            return serviceObj.facets;
        };

        // setter and getter for a single image
        serviceObj.photo = {};
        serviceObj.setPhoto = function (data) {
            serviceObj.photo = data;
        };
        serviceObj.getPhoto = function () {
            return serviceObj.photo;
        };

        // get user profile for authentication to login
        serviceObj.auth = {};
        serviceObj.setAuth = function (data) {
            serviceObj.auth = data;
        };
        serviceObj.getAuth = function () {
            return serviceObj.auth;
        };

        serviceObj.modalDialogFlag = false;
        serviceObj.setDialogFlag = function (flag) {
            serviceObj.modalDialogFlag = flag;
        };

        serviceObj.getDialogFlag = function () {
            return serviceObj.modalDialogFlag;
        };

        // replace http with https
        serviceObj.getHttps = function (url) {
            var pattern = /^(http:)/i;
            if (pattern.test(url)) {
                return url.replace(pattern, 'https:');
            } else {
                return url;
            }
        };

        // find image if it is jp2 or not
        serviceObj.findJP2 = function (itemData) {
            var flag = false;
            if (itemData.thumbnail) {
                var thumbnailUrl = itemData.thumbnail[0]._attr.href._value;
                var photoUrl = itemData._attr.href._value;
                var thumbnailList = thumbnailUrl.split(':');
                var thumbnailFlag = 0;
                if (thumbnailList.length > 0) {
                    thumbnailFlag = thumbnailList[thumbnailList.length - 1];
                }
                var photoList = photoUrl.split(':');
                var photoFlag = 1;
                if (photoList.length > 0) {
                    photoFlag = photoList[photoList.length - 1];
                }
                if (photoFlag === thumbnailFlag) {
                    flag = true;
                }
            }
            return flag;
        };

        // convert xml data to json data by re-group them
        serviceObj.getXMLdata = function (str) {
            var xmldata = '';
            var listArray = [];
            if (str) {
                xmldata = serviceObj.parseXml(str);
                if (xmldata.work) {
                    for (var k = 0; k < xmldata.work.length; k++) {
                        var subLevel = xmldata.work[k];
                        if (subLevel.component) {
                            listArray = subLevel.component;
                        } else if (subLevel.image) {
                            listArray = subLevel;
                        } else {
                            listArray = subLevel;
                        }
                    }
                } else {
                    listArray = xmldata;
                }
            }

            return listArray;
        };

        // store api rest url from config.html
        serviceObj.api = {};
        serviceObj.setApi = function (data) {
            serviceObj.api = data;
        };

        serviceObj.getApi = function () {
            return serviceObj.api;
        };

        // store validate client ip status
        serviceObj.clientIp = {};
        serviceObj.setClientIp = function (data) {
            serviceObj.clientIp = data;
        };
        serviceObj.getClientIp = function () {
            return serviceObj.clientIp;
        };

        return serviceObj;
    }]);
})();
/**
 * Created by samsan on 6/29/17.
 */

(function () {

    angular.module('viewCustom').controller('prmTopbarAfterController', ['$element', 'prmSearchService', '$scope', '$compile', function ($element, prmSearchService, $scope, $compile) {

        var vm = this;
        var cs = prmSearchService;

        // get rest endpoint Url
        vm.getUrl = function () {
            var configFile = cs.getEnv();
            cs.getAjax('/primo-explore/custom/01HVD_IMAGES/html/' + configFile, '', 'get').then(function (res) {
                vm.api = res.data;
                cs.setApi(vm.api);
            }, function (error) {
                console.log(error);
            });
        };

        vm.$onInit = function () {
            // hide primo tab menu
            vm.parentCtrl.showMainMenu = false;
            // create new div for the top white menu
            var primoExplore = document.getElementsByTagName('primo-explore')[0];
            var div = document.createElement('div');
            div.setAttribute('id', 'customTopMenu');
            div.setAttribute('class', 'topMenu');
            // create custom top white bar
            var customTop = document.createElement('custom-top-menu');
            div.appendChild(customTop);
            if (primoExplore.children[0].className !== 'topMenu') {
                $compile(div)($scope);
                primoExplore.prepend(div);
            }

            vm.getUrl();
        };
    }]);

    angular.module('viewCustom').component('prmTopbarAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmTopbarAfterController'
    });
})();
/**
 * Created by samsan on 5/17/17.
 * This component is to insert images into online section
 * It list different print view size
 */

(function () {

    angular.module('viewCustom').controller('prmViewOnlineAfterController', ['prmSearchService', '$mdDialog', '$timeout', '$window', '$location', '$mdMedia', function (prmSearchService, $mdDialog, $timeout, $window, $location, $mdMedia) {

        var vm = this;
        var sv = prmSearchService;
        var itemData = sv.getItem();
        vm.item = itemData.item;
        vm.searchData = itemData.searchData;
        vm.params = $location.search();
        vm.zoomButtonFlag = false;
        vm.viewAllComponetMetadataFlag = false;
        vm.singleImageFlag = false;
        vm.photo = {}; // single imae
        vm.jp2 = false;
        vm.imageTitle = '';
        vm.auth = sv.getAuth();
        vm.gridColumn = '3'; // default print view size

        vm.$onInit = function () {
            vm.isLoggedIn = sv.getLogInID();
            // get item data from service
            itemData = sv.getItem();
            vm.item = itemData.item;
            if (vm.item.pnx.addata) {
                vm.item.mis1Data = sv.getXMLdata(vm.item.pnx.addata.mis1[0]);
            }
            vm.searchData = itemData.searchData;
            vm.searchData.sortby = vm.params.sortby;
            vm.pageInfo = sv.getPage();

            if (vm.item.mis1Data) {
                if (Array.isArray(vm.item.mis1Data) === false) {
                    vm.singleImageFlag = true;
                    if (vm.item.mis1Data.image) {
                        vm.photo = vm.item.mis1Data.image[0];
                        vm.jp2 = sv.findJP2(vm.photo); // check to see if the image is jp2 or not
                    }
                    if (vm.item.mis1Data.title) {
                        vm.imageTitle = vm.item.mis1Data.title[0].textElement[0]._text;
                    }
                } else {
                    vm.viewAllComponetMetadataFlag = true;
                    vm.singleImageFlag = false;
                    vm.zoomButtonFlag = true;
                }
            }

            // show print view base on the screen size
            if ($mdMedia('xs')) {
                vm.gridColumn = '1';
            } else if ($mdMedia('sm')) {
                vm.gridColumn = '2';
            }
        };

        // view all component metadata
        vm.viewAllComponentMetaData = function () {
            var url = '/primo-explore/viewallcomponentmetadata/' + vm.item.context + '/' + vm.item.pnx.control.recordid[0] + '?vid=' + vm.params.vid;
            url += '&tab=' + vm.params.tab + '&search_scope=' + vm.params.search_scope;
            url += '&adaptor=' + vm.item.adaptor;
            $window.open(url, '_blank');
        };

        // show the pop up image
        vm.gotoFullPhoto = function ($event, item, index) {
            var filename = '';
            if (item.image) {
                var urlList = item.image[0]._attr.href._value;
                urlList = urlList.split('/');
                if (urlList.length >= 3) {
                    filename = urlList[3];
                }
            } else if (item._attr.componentID) {
                filename = item._attr.componentID._value;
            }
            // go to full display page
            var url = '/primo-explore/viewcomponent/' + vm.item.context + '/' + vm.item.pnx.control.recordid[0] + '?vid=' + vm.searchData.vid + '&imageId=' + filename;
            if (vm.item.adaptor) {
                url += '&adaptor=' + vm.item.adaptor;
            } else {
                url += '&adaptor=' + (vm.searchData.adaptor ? vm.searchData.adaptor : '');
            }
            $window.open(url, '_blank');
        };
    }]);

    angular.module('viewCustom').component('prmViewOnlineAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmViewOnlineAfterController',
        'templateUrl': '/primo-explore/custom/01HVD_IMAGES/html/prm-view-online-after.html'
    });
})();

/**
 * Created by samsan on 5/23/17.
 * If image width is greater than 600pixel, it will resize base on responsive css.
 * It use to show a single image on the page. If the image does not exist, it use icon_image.png
 */

(function () {

    angular.module('viewCustom').component('responsiveImage', {
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/responsiveImage.html',
        bindings: {
            src: '<',
            imgtitle: '<',
            restricted: '<'
        },
        controllerAs: 'vm',
        controller: ['$element', '$window', '$location', 'prmSearchService', '$timeout', function ($element, $window, $location, prmSearchService, $timeout) {
            var vm = this;
            var sv = prmSearchService;
            // set up local scope variables
            vm.showImage = true;
            vm.params = $location.search();
            vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
            vm.isLoggedIn = sv.getLogInID();

            // check if image is not empty and it has width and height and greater than 150, then add css class
            vm.$onChanges = function () {

                vm.isLoggedIn = sv.getLogInID();
                if (vm.restricted && !vm.isLoggedIn) {
                    vm.showImage = false;
                }
                vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
                if (vm.src && vm.showImage) {
                    $timeout(function () {
                        var img = $element.find('img')[0];
                        // use default image if it is a broken link image
                        var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                        if (pattern.test(vm.src)) {
                            img.src = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
                        }
                        img.onload = vm.callback;
                        if (img.width > 50) {
                            vm.callback();
                        }
                    }, 200);
                }

                vm.localScope.loading = false;
            };
            vm.callback = function () {
                var image = $element.find('img')[0];
                // resize the image if it is larger than 600 pixel
                if (image.width > 600) {
                    vm.localScope.imgClass = 'responsiveImage';
                    image.className = 'md-card-image ' + vm.localScope.imgClass;
                }

                // force to show lock icon
                if (vm.restricted) {
                    vm.localScope.hideLockIcon = true;
                }
            };
            // login
            vm.signIn = function () {
                var auth = sv.getAuth();
                var params = { 'vid': '', 'targetURL': '' };
                params.vid = vm.params.vid;
                params.targetURL = $window.location.href;
                var url = '/primo-explore/login?from-new-ui=1&authenticationProfile=' + auth.authenticationMethods[0].profileName + '&search_scope=default_scope&tab=default_tab';
                url += '&Institute=' + auth.authenticationService.userSessionManagerService.userInstitution + '&vid=' + params.vid;
                if (vm.params.offset) {
                    url += '&offset=' + vm.params.offset;
                }
                url += '&targetURL=' + encodeURIComponent(params.targetURL);
                $window.location.href = url;
            };
        }]
    });
})();
/**
 * Created by samsan on 5/23/17.
 * If image width is greater than 600pixel, it will resize base on responsive css.
 * It use to show a single image on the page. If the image does not exist, it use icon_image.png
 */

angular.module('viewCustom').component('singleImage', {
    templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/singleImage.html',
    bindings: {
        src: '<',
        imgtitle: '<',
        restricted: '<',
        jp2: '<'
    },
    controllerAs: 'vm',
    controller: ['$element', '$window', '$location', 'prmSearchService', '$timeout', '$sce', '$scope', function ($element, $window, $location, prmSearchService, $timeout, $sce, $scope) {
        var vm = this;
        var sv = prmSearchService;
        // set up local scope variables
        vm.imageUrl = '';
        vm.showImage = true;
        vm.params = $location.search();
        vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
        vm.isLoggedIn = sv.getLogInID();
        vm.clientIp = sv.getClientIp();

        // check if image is not empty and it has width and height and greater than 150, then add css class
        vm.$onChanges = function () {
            vm.clientIp = sv.getClientIp();
            vm.isLoggedIn = sv.getLogInID();

            if (vm.restricted && !vm.isLoggedIn && !vm.clientIp.status) {
                vm.showImage = false;
            }

            vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
            if (vm.src && vm.showImage) {
                var url = sv.getHttps(vm.src) + '?buttons=Y';
                vm.imageUrl = $sce.trustAsResourceUrl(url);
            } else if (vm.showImage) {
                vm.imageUrl = '';
                $timeout(function () {
                    var img = $element.find('img')[0];
                    // use default image if it is a broken link image
                    var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                    if (pattern.test(vm.src)) {
                        img.src = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
                    }
                    img.onload = vm.callback;
                    if (img.width > 600) {
                        vm.callback();
                    }
                }, 500);
            }
            vm.localScope.loading = false;
        };

        vm.callback = function () {
            var image = $element.find('img')[0];
            // resize the image if it is larger than 600 pixel
            if (image.width > 600) {
                vm.localScope.imgClass = 'responsiveImage';
                image.className = 'md-card-image ' + vm.localScope.imgClass;
            }

            // force to show lock icon
            if (vm.restricted) {
                vm.localScope.hideLockIcon = true;
            }
        };

        // login
        vm.signIn = function () {
            var auth = sv.getAuth();
            var params = { 'vid': '', 'targetURL': '' };
            params.vid = vm.params.vid;
            params.targetURL = $window.location.href;
            var url = '/primo-explore/login?from-new-ui=1&authenticationProfile=' + auth.authenticationMethods[0].profileName + '&search_scope=default_scope&tab=default_tab';
            url += '&Institute=' + auth.authenticationService.userSessionManagerService.userInstitution + '&vid=' + params.vid;
            if (vm.params.offset) {
                url += '&offset=' + vm.params.offset;
            }
            url += '&targetURL=' + encodeURIComponent(params.targetURL);
            $window.location.href = url;
        };
    }]
});

/**
 * Created by samsan on 5/23/17.
 * If image has height that is greater than 150 px, then it will resize it. Otherwise, it just display what it is.
 */

(function () {

    angular.module('viewCustom').component('thumbnail', {
        templateUrl: '/primo-explore/custom/01HVD_IMAGES/html/thumbnail.html',
        bindings: {
            dataitem: '<',
            searchdata: '<'
        },
        controllerAs: 'vm',
        controller: ['$element', '$timeout', '$window', 'prmSearchService', '$location', function ($element, $timeout, $window, prmSearchService, $location) {
            var vm = this;
            var sv = prmSearchService;
            vm.localScope = { 'imgclass': '', 'hideLockIcon': false, 'showImageLabel': false };
            vm.modalDialogFlag = false;
            vm.imageUrl = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
            vm.linkUrl = '';
            vm.params = $location.search();

            // check if image is not empty and it has width and height and greater than 150, then add css class
            vm.$onChanges = function () {

                vm.localScope = { 'imgclass': '', 'hideLockIcon': false, 'showImageLabel': false };
                if (vm.dataitem.pnx.links.thumbnail) {
                    vm.imageUrl = sv.getHttps(vm.dataitem.pnx.links.thumbnail[0]);
                    $timeout(function () {
                        var img = $element.find('img')[0];
                        // use default image if it is a broken link image
                        var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                        if (pattern.test(vm.dataitem.pnx.links.thumbnail[0])) {
                            img.src = '/primo-explore/custom/01HVD_IMAGES/img/icon_image.png';
                        }
                        img.onload = vm.callback;

                        if (img.clientWidth > 50) {
                            vm.callback();
                        }
                    }, 300);
                }

                var vid = '01HVD_IMAGES';
                var searchString = '';
                var q = '';
                var sort = 'rank';
                var offset = 0;
                var tab = '';
                var scope = '';
                if (vm.searchdata) {
                    vid = vm.searchdata.vid;
                    searchString = vm.searchdata.searchString;
                    q = vm.searchdata.q;
                    sort = vm.searchdata.sort;
                    offset = vm.searchdata.offset;
                    tab = vm.searchdata.tab;
                    scope = vm.searchdata.scope;
                } else if (vm.params) {
                    vid = vm.params.vid;
                }

                vm.linkUrl = '/primo-explore/fulldisplay?vid=' + vid + '&docid=' + vm.dataitem.pnx.control.recordid[0] + '&sortby=' + sort;
                vm.linkUrl += '&q=' + q + '&searchString=' + searchString + '&offset=' + offset;
                vm.linkUrl += '&tab=' + tab + '&search_scope=' + scope;
                if (vm.params.facet) {
                    if (Array.isArray(vm.params.facet)) {
                        for (var i = 0; i < vm.params.facet.length; i++) {
                            vm.linkUrl += '&facet=' + vm.params.facet[i];
                        }
                    } else {
                        vm.linkUrl += '&facet=' + vm.params.facet;
                    }
                }

                // context menu
                var context = $element.find('a');
                context.bind('contextmenu', function (e) {
                    //e.preventDefault();
                    return false;
                });
            };

            vm.$doCheck = function () {
                vm.modalDialogFlag = sv.getDialogFlag();
            };

            vm.callback = function () {
                // show lock icon
                if (vm.dataitem.restrictedImage) {
                    vm.localScope.hideLockIcon = true;
                }
                // show image label number on the top right corner
                if (vm.dataitem.pnx.display.lds20) {
                    if (vm.dataitem.pnx.display.lds20[0] > 1) {
                        vm.localScope.showImageLabel = true;
                    }
                }
                // find the width and height of image after it is rendering
                var image = $element.find('img')[0];
                if (image) {
                    if (image.clientHeight > 150 && image.clientWidth < 185) {
                        vm.localScope.imgclass = 'responsivePhoto';
                        image.className = 'md-card-image ' + vm.localScope.imgclass;
                    } else if (image.clientHeight > 150 && image.clientWidth > 185) {
                        vm.localScope.imgclass = 'responsivePhoto2';
                        image.className = 'md-card-image ' + vm.localScope.imgclass;
                    } else if (image.clientWidth > 185) {
                        vm.localScope.imgclass = 'responsivePhoto3';
                        image.className = 'md-card-image ' + vm.localScope.imgclass;
                    }
                }
                // line up the image label on the top of the image
                var divs = $element[0].children[0].children[0].children[0];
                if (divs && image) {
                    var margin = (185 - image.clientWidth) / 2;
                    var leftMargin = margin + image.clientWidth - 20 + 'px';
                    divs.style.marginLeft = leftMargin;
                }
            };

            vm.openWindow = function () {
                var url = '/primo-explore/fulldisplay?vid=01HVD_IMAGES&docid=' + vm.dataitem.pnx.control.recordid[0];
                $window.open(url, '_blank');
            };
        }]
    });
})();

/* Copyright 2015 William Summers, MetaTribal LLC
 * adapted from https://developer.mozilla.org/en-US/docs/JXON
 *
 * Licensed under the MIT License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @author William Summers
 *
 */

var xmlToJSON = function () {

    this.version = "1.3";

    var options = { // set up the default options
        mergeCDATA: true, // extract cdata and merge with text
        grokAttr: true, // convert truthy attributes to boolean, etc
        grokText: true, // convert truthy text/attr to boolean, etc
        normalize: true, // collapse multiple spaces to single space
        xmlns: true, // include namespaces as attribute in output
        namespaceKey: '_ns', // tag name for namespace objects
        textKey: '_text', // tag name for text nodes
        valueKey: '_value', // tag name for attribute values
        attrKey: '_attr', // tag for attr groups
        cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
        attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
        stripAttrPrefix: true, // remove namespace prefixes from attributes
        stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
        childrenAsArray: true // force children into arrays
    };

    var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
    var trimMatch = new RegExp(/^\s+|\s+$/g);

    this.grokType = function (sValue) {
        if (/^\s*$/.test(sValue)) {
            return null;
        }
        if (/^(?:true|false)$/i.test(sValue)) {
            return sValue.toLowerCase() === "true";
        }
        if (isFinite(sValue)) {
            return parseFloat(sValue);
        }
        return sValue;
    };

    this.parseString = function (xmlString, opt) {
        return this.parseXML(this.stringToXML(xmlString), opt);
    };

    this.parseXML = function (oXMLParent, opt) {

        // initialize options
        for (var key in opt) {
            options[key] = opt[key];
        }

        var vResult = {},
            nLength = 0,
            sCollectedTxt = "";

        // parse namespace information
        if (options.xmlns && oXMLParent.namespaceURI) {
            vResult[options.namespaceKey] = oXMLParent.namespaceURI;
        }

        // parse attributes
        // using attributes property instead of hasAttributes method to support older browsers
        if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
            var vAttribs = {};

            for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                var oAttrib = oXMLParent.attributes.item(nLength);
                vContent = {};
                var attribName = '';

                if (options.stripAttrPrefix) {
                    attribName = oAttrib.name.replace(prefixMatch, '');
                } else {
                    attribName = oAttrib.name;
                }

                if (options.grokAttr) {
                    vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                } else {
                    vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                }

                if (options.xmlns && oAttrib.namespaceURI) {
                    vContent[options.namespaceKey] = oAttrib.namespaceURI;
                }

                if (options.attrsAsObject) {
                    // attributes with same local name must enable prefixes
                    vAttribs[attribName] = vContent;
                } else {
                    vResult[options.attrKey + attribName] = vContent;
                }
            }

            if (options.attrsAsObject) {
                vResult[options.attrKey] = vAttribs;
            } else {}
        }

        // iterate over the children
        if (oXMLParent.hasChildNodes()) {
            for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                oNode = oXMLParent.childNodes.item(nItem);

                if (oNode.nodeType === 4) {
                    if (options.mergeCDATA) {
                        sCollectedTxt += oNode.nodeValue;
                    } else {
                        if (vResult.hasOwnProperty(options.cdataKey)) {
                            if (vResult[options.cdataKey].constructor !== Array) {
                                vResult[options.cdataKey] = [vResult[options.cdataKey]];
                            }
                            vResult[options.cdataKey].push(oNode.nodeValue);
                        } else {
                            if (options.childrenAsArray) {
                                vResult[options.cdataKey] = [];
                                vResult[options.cdataKey].push(oNode.nodeValue);
                            } else {
                                vResult[options.cdataKey] = oNode.nodeValue;
                            }
                        }
                    }
                } /* nodeType is "CDATASection" (4) */
                else if (oNode.nodeType === 3) {
                        sCollectedTxt += oNode.nodeValue;
                    } /* nodeType is "Text" (3) */
                    else if (oNode.nodeType === 1) {
                            /* nodeType is "Element" (1) */

                            if (nLength === 0) {
                                vResult = {};
                            }

                            // using nodeName to support browser (IE) implementation with no 'localName' property
                            if (options.stripElemPrefix) {
                                sProp = oNode.nodeName.replace(prefixMatch, '');
                            } else {
                                sProp = oNode.nodeName;
                            }

                            vContent = xmlToJSON.parseXML(oNode);

                            if (vResult.hasOwnProperty(sProp)) {
                                if (vResult[sProp].constructor !== Array) {
                                    vResult[sProp] = [vResult[sProp]];
                                }
                                vResult[sProp].push(vContent);
                            } else {
                                if (options.childrenAsArray) {
                                    vResult[sProp] = [];
                                    vResult[sProp].push(vContent);
                                } else {
                                    vResult[sProp] = vContent;
                                }
                                nLength++;
                            }
                        }
            }
        } else if (!sCollectedTxt) {
            // no children and no text, return null
            if (options.childrenAsArray) {
                vResult[options.textKey] = [];
                vResult[options.textKey].push(null);
            } else {
                vResult[options.textKey] = null;
            }
        }

        if (sCollectedTxt) {
            if (options.grokText) {
                var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                if (value !== null && value !== undefined) {
                    vResult[options.textKey] = value;
                }
            } else if (options.normalize) {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
            } else {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
            }
        }

        return vResult;
    };

    // Convert xmlDocument to a string
    // Returns null on failure
    this.xmlToString = function (xmlDoc) {
        try {
            var xmlString = xmlDoc.xml ? xmlDoc.xml : new XMLSerializer().serializeToString(xmlDoc);
            return xmlString;
        } catch (err) {
            return null;
        }
    };

    // Convert a string to XML Node Structure
    // Returns null on failure
    this.stringToXML = function (xmlString) {
        try {
            var xmlDoc = null;

            if (window.DOMParser) {

                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlString, "text/xml");

                return xmlDoc;
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);

                return xmlDoc;
            }
        } catch (e) {
            return null;
        }
    };

    return this;
}.call({});

if (typeof module != "undefined" && module !== null && module.exports) module.exports = xmlToJSON;else if (typeof define === "function" && define.amd) define(function () {
    return xmlToJSON;
});
})();