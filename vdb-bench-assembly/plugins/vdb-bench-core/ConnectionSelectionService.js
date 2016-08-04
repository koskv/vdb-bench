/**
 * Connection Service
 *
 * Provides simple API for managing connections
 */
(function () {

    'use strict';

    angular
        .module('vdb-bench.core')
        .factory('ConnectionSelectionService', ConnectionSelectionService);

    ConnectionSelectionService.$inject = ['SYNTAX', 'RepoRestService', 'DownloadService', '$rootScope'];

    function ConnectionSelectionService(SYNTAX, RepoRestService, DownloadService, $rootScope) {

        var conn = {};
        conn.loading = false;
        conn.connections = [];
        conn.connection = null;
        conn.deploymentInProgress = false;
        conn.deploymentConnectionName = null;
        conn.deploymentSuccess = false;
        conn.deploymentMessage = null;

        /*
         * Service instance to be returned
         */
        var service = {};

        function setLoading(loading) {
            conn.loading = loading;

            // Broadcast the loading value for any interested clients
            $rootScope.$broadcast("loadingConnectionsChanged", conn.loading);
        }

        /**
         * Fetch the connections for the repository
         */
        function initConnections() {
            setLoading(true);

            try {
                RepoRestService.getDataSources( ).then(
                    function (newDataSources) {
                        RepoRestService.copy(newDataSources, conn.connections);
                        setLoading(false);
                    },
                    function (response) {
                        // Some kind of error has occurred
                        conn.connections = [];
                        setLoading(false);
                        throw RepoRestService.newRestException("Failed to load connections from the host services.\n" + response.message);
                    });
            } catch (error) {
                conn.connections = [];
                setLoading(false);
                alert("An exception occurred:\n" + error.message);
            }

            // Removes any outdated selections
            service.selectConnection(null);
        }

        /*
         * Are the connections currently loading
         */
        service.isLoading = function() {
            return conn.loading;
        };

        /*
         * Is the connections deployment flag set
         */
        service.isDeploying = function() {
            return conn.deploymentInProgress;
        };
        
        /*
         * Returns deployment connection name
         */
        service.deploymentConnectionName = function() {
            return conn.deploymentConnectionName;
        };
        
        /*
         * Returns connection deployment success state
         */
        service.deploymentSuccess = function() {
            return conn.deploymentSuccess;
        };
        
        /*
         * Returns connection deployment message
         */
        service.deploymentMessage = function() {
            return conn.deploymentMessage;
        };

        /*
         * Set the deployment flag
         */
        service.setDeploying = function(deploying, connectionName, deploymentSuccess, message) {
            conn.deploymentInProgress = deploying;
            conn.deploymentConnectionName = connectionName;
            conn.deploymentSuccess = deploymentSuccess;
            conn.deploymentMessage = message;

            $rootScope.$broadcast("deployConnectionChanged", conn.deploymentInProgress);
        };

        /*
         * Get the connections
         */
        service.getConnections = function() {
            return conn.connections;
        };

        /*
         * Select the given connection
         */
        service.selectConnection = function(connection) {
            //
            // Set the selected connection
            //
            conn.connection = connection;

            // Useful for broadcasting the selected connection has been updated
            $rootScope.$broadcast("selectedConnectionChanged", conn.connection);
        };

        /*
         * return selected connection
         */
        service.selectedConnection = function() {
            return conn.connection;
        };

        /*
         * return selected connection
         */
        service.hasSelectedConnection = function() {
            if (! angular.isDefined(conn.connection))
                return false;

            if (_.isEmpty(conn.connection))
                return false;

            if (conn.connection === null)
                return false;

            return true;
        };

        /*
         * Refresh the collection of connections
         */
        service.refresh = function() {
            initConnections();
        };

        // Initialise connection collection on loading
        service.refresh();

        return service;
    }

})();
