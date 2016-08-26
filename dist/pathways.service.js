"use strict";
var constants_1 = require('./constants');
var pathways = angular.module('pathways.factory', []);
var PathwaysService = (function () {
    function PathwaysService($http) {
        this.$http = $http;
    }
    PathwaysService.prototype.getPathways = function (universalModelId, modelId, carbonSourceId, productId) {
        return this.$http({
            method: 'GET',
            url: constants_1.API_ROOT_URL + "/pathways",
            params: {
                'product_id': productId,
                'model_id': modelId,
                'universal_model_id': universalModelId,
                'carbon_source_id': carbonSourceId
            }
        });
    };
    PathwaysService.prototype.getStatus = function (universalModelId, modelId, carbonSourceId, productId) {
        return this.$http({
            method: 'GET',
            url: constants_1.API_ROOT_URL + "/predict",
            params: {
                'product_id': productId,
                'model_id': modelId,
                'universal_model_id': universalModelId,
                'carbon_source_id': carbonSourceId
            }
        });
    };
    PathwaysService.prototype.loadProducts = function (universalModelId) {
        return this.$http({
            method: 'GET',
            url: constants_1.API_ROOT_URL + "/lists/product",
            params: { 'universal_model_id': universalModelId }
        });
    };
    PathwaysService.prototype.loadModels = function () {
        return this.$http({
            method: 'GET',
            url: constants_1.API_ROOT_URL + "/lists/model"
        });
    };
    PathwaysService.prototype.loadUniversalModels = function () {
        return this.$http({
            method: 'GET',
            url: constants_1.API_ROOT_URL + "/lists/universal_model"
        });
    };
    PathwaysService.prototype.loadCarbonSources = function () {
        return this.$http({
            method: 'GET',
            url: constants_1.API_ROOT_URL + "/lists/carbon_source"
        });
    };
    return PathwaysService;
}());
exports.PathwaysService = PathwaysService;
pathways.service('PathwaysService', PathwaysService);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pathways;

//# sourceMappingURL=pathways.service.js.map
