"use strict";
// Turn of WS TS inspection for the 'decaf-common' import.
// noinspection TypeScriptCheckImport
var decaf_common_1 = require('decaf-common');
require('./pathways.component.css!');
require('./escher-builder.css!');
require('jquery');
var escher_service_1 = require('./escher.service');
var pathways_service_1 = require('./pathways.service');
exports.COMPONENT_NAME = 'pathways';
var pathwaysModule = angular.module(exports.COMPONENT_NAME, [
    escher_service_1.default.name,
    pathways_service_1.default.name
]);
pathwaysModule.config(function (platformProvider) {
    platformProvider
        .register(exports.COMPONENT_NAME)
        .state(exports.COMPONENT_NAME, {
        url: "/" + exports.COMPONENT_NAME,
        views: {
            'content@': {
                templateUrl: decaf_common_1.dirname(module.id) + "/pathways.component.html",
                controller: PathwaysController,
                controllerAs: 'pathwaysController'
            }
        }
    });
});
var PathwaysController = (function () {
    function PathwaysController($timeout, PathwaysService, EscherService) {
        var _this = this;
        this.$timeout = $timeout;
        this.isDisabled = false;
        this.isWaiting = false;
        this.models = [];
        this.universalModels = [];
        this.products = {};
        this.carbonSources = [];
        this.pathwaysService = PathwaysService;
        this.escherService = EscherService;
        this.loadLists();
        this.formConfig = [
            {
                'title': 'Universal model',
                'attr': 'universalModels',
                'placeholder': 'metanetx_universal_model_bigg_rhea_kegg',
                'list': function () { return _this.universalModels; }
            },
            {
                'title': 'Model',
                'attr': 'models',
                'placeholder': 'iJO1366',
                'list': function () {
                    return _this.models.concat([{
                            value: _this.searchTexts.universalModels,
                            display: _this.searchTexts.universalModels
                        }]);
                }
            },
            {
                'title': 'Carbon source',
                'attr': 'carbonSources',
                'placeholder': 'EX_glc_lp_e_rp_',
                'list': function () { return _this.carbonSources; }
            },
            {
                'title': 'Product',
                'attr': 'products',
                'placeholder': '',
                'list': function () { return _this.products[_this.searchTexts.universalModels]; }
            }
        ];
        this.searchTexts = {};
        this.defaultSearchValues();
        this.message = '';
        this.product = undefined;
        this.data = [];
        this.mapIdPrefix = 'mapContainer';
    }
    PathwaysController.prototype.defaultSearchValues = function () {
        var _this = this;
        this.formConfig.forEach(function (value) {
            _this.searchTexts[value.attr] = value.placeholder;
        });
    };
    PathwaysController.prototype.querySearch = function (query, data) {
        return query ? data.filter(this.createFilterFor(query)) : data;
    };
    PathwaysController.prototype.createFilterFor = function (query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(option) {
            return (angular.lowercase(option.display).indexOf(lowercaseQuery) !== -1);
        };
    };
    PathwaysController.prototype.loadLists = function () {
        this.loadAllUniversalModels();
        this.loadAllModels();
        this.loadAllCarbonSources();
    };
    PathwaysController.prototype.loadAllModels = function () {
        var _this = this;
        this.pathwaysService.loadModels()
            .then(function (data) {
            data.data.forEach(function (value) {
                _this.models.push({
                    value: value.id,
                    display: value.name + ' (' + value.id + ')'
                });
            });
        });
    };
    PathwaysController.prototype.loadAllUniversalModels = function () {
        var _this = this;
        this.pathwaysService.loadUniversalModels()
            .then(function (data) {
            data.data.forEach(function (value) {
                _this.universalModels.push({
                    value: value.id,
                    display: value.name
                });
            });
            _this.loadAllProducts();
        });
    };
    PathwaysController.prototype.loadAllProducts = function () {
        var _this = this;
        angular.forEach(this.universalModels, function (value) {
            var universalModelId = value.value;
            _this.products[universalModelId] = [];
            _this.pathwaysService.loadProducts(universalModelId)
                .then(function (data) {
                data.data.forEach(function (productValue) {
                    _this.products[universalModelId].push({
                        value: productValue.id,
                        display: productValue.name
                    });
                });
            });
        }, this.products);
    };
    PathwaysController.prototype.loadAllCarbonSources = function () {
        var _this = this;
        this.pathwaysService.loadCarbonSources()
            .then(function (data) { return data.data.forEach(function (value) {
            _this.carbonSources.push({
                value: value.id,
                display: value.name
            });
        }); });
    };
    PathwaysController.prototype.submit = function () {
        var _this = this;
        this.data = [];
        this.message = '';
        this.model = this.searchTexts.models;
        this.product = this.searchTexts.products;
        this.universalModel = this.searchTexts.universalModels;
        this.carbonSource = this.searchTexts.carbonSources;
        this.isWaiting = true;
        var tick = function () {
            _this.pathwaysService
                .getStatus(_this.universalModel, _this.model, _this.carbonSource, _this.product)
                .then(function (statusResponse) { return _this.pathwaysService
                .getPathways(_this.universalModel, _this.model, _this.carbonSource, _this.product)
                .then(function (dataResponse) { return [statusResponse.status, dataResponse]; }); })
                .then(
            // Success
            function (_a) {
                var status = _a[0], dataResponse = _a[1];
                var data = dataResponse.data;
                for (var i = _this.data.length; i < data.length; i += 1) {
                    _this.data.push(data[i]);
                }
                if (status === 202) {
                    _this.$timeout(tick, 1000);
                }
                else {
                    _this.isWaiting = false;
                    if (data.length === 0) {
                        _this.message = 'Pathways not found';
                    }
                }
            }, 
            // Error
            function (_a) {
                var status = _a[0], dataResponse = _a[1];
                _this.isWaiting = false;
                if (status === 404) {
                    _this.message = 'No such key';
                }
            });
        };
        tick();
    };
    return PathwaysController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pathwaysModule;

//# sourceMappingURL=pathways.component.js.map
