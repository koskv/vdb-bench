(function () {
    'use strict';

    var pluginName = 'vdb-bench.dataservice';
    var pluginDirName = 'vdb-bench-dataservice';

    angular
        .module(pluginName)
        .directive('bodyClick', BodyClickDirective)
        .controller('DataServicePageController', DataServicePageController);

    BodyClickDirective.$inject = ['$parse', '$document'];
    DataServicePageController.$inject = ['$scope', 'SYNTAX', 'CONFIG', 'RepoRestService', 'DSSelectionService',
                                                            'ConnectionSelectionService', 'SvcSourceSelectionService', 'DSPageService'];

    /**
     * Designed to bind a click handler to body element which,
     * when a click occurs, will execute the attribute provided
     * to the directive, eg. to cancel the display of a popup.
     */
    function BodyClickDirective($parse, $document) {
        var directive = {
            compile: function($element, attr) {
                // Parse the expression to be executed
                // whenever someone clicks _off_ this element.
                var delegateFn = $parse(attr.bodyClick);

                return function(scope, element, attr) {
                    //
                    // Adds a click handler to the element that
                    // stops the event propagation.
                    //
                    element.bind("click", function(event) {
                        event.stopPropagation();
                    });

                    //
                    // Function to be executed that delegates
                    // to the parsed functional attribute
                    //
                    var bodyClickFunction = function(event) {
                        scope.$apply(function() {
                            delegateFn(scope, {$event:event});
                        });
                    };

                    angular
                        .element($document[0].body)
                        .bind("click", bodyClickFunction);
                };
            }
        };
        return directive;
    }
    
    function DataServicePageController($scope, syntax, config, RepoRestService, DSSelectionService,
                                                            ConnectionSelectionService, SvcSourceSelectionService, DSPageService) {
        var vm = this;

        /*
         * When a data service is currently being deployed
         */
        $scope.$on('dataServicePageChanged', function (event, pageId) {
            vm.selectPage(pageId);
        });

        vm.selectNavItem = function(navItemId) {
            vm.selectedNavItem = navItemId;
        };

        vm.navItemSelected = function() {
            if (_.isEmpty(vm.selectedNavItem))
                return false;

            return true;
        };

        vm.page = function(pageId) {
            return DSPageService.page(pageId);
        };

        vm.pages = function(pageIds) {
            return DSPageService.pages(pageIds);
        };

        vm.selectPage = function(pageId) {
            vm.selectedPage = DSPageService.page(pageId);
        };

        vm.selectedPageCrumbs = function() {
            return DSPageService.pageCrumbs(vm.selectedPage);
        };

        vm.selectedPageId = function() {
            if (_.isEmpty(vm.selectedPage))
                return '';

            return vm.selectedPage.id;
        };

        vm.selectedPageTitle = function() {
            if (_.isEmpty(vm.selectedPage))
                return '';

            return vm.selectedPage.title;
        };

        /*
         * Service : get selected data service
         */
        vm.selectedDataservice = function () {
            return DSSelectionService.selectedDataService();
        };
        
        /*
         * Service : get selected Service Source
         */
        vm.selectedServiceSource = function () {
            return SvcSourceSelectionService.selectedServiceSource();
        };

        /*
         * Service : get selected connection
         */
        vm.selectedConnection = function () {
            return ConnectionSelectionService.selectedConnection();
        };

        /*
         * Service : get connection state
         */
        vm.getConnectionState = function (conn) {
            return ConnectionSelectionService.getConnectionState(conn);
        };

        vm.selectPage(DSPageService.DS_HOME_PAGE);
    }

})();