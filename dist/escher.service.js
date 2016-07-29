"use strict";
// noinspection TypeScriptCheckImport
var Builder = require('escher-vis').Builder;
var d3 = require('d3');
require('jquery');
var escher = angular.module('pathways.escher', []);
var EscherService = (function () {
    function EscherService() {
        var _this = this;
        this.direction = -90;
        this.startCoordinates = { x: 300, y: 1000 };
        this.metabolitesNames = [];
        this.reactions = [];
        this.self = this;
        this.options = {
            // just show the zoom buttons
            menu: 'zoom',
            // do not use the smooth pan and zoom option
            use_3d_transform: false,
            // no editing in this map
            enable_editing: true,
            // show the descriptive names
            identifiers_on_map: 'name',
            // hide secondary metabolites
            hide_secondary_metabolites: true,
            // don't ask before quiting
            never_ask_before_quit: true,
            // disable keyboard shortcuts
            enable_keys: false,
            first_load_callback: function () {
                var currentThis = eval('this');
                for (var i = _this.self.reactions.length - 1; i >= 0; i -= 1) {
                    if (i === _this.self.reactions.length - 1) {
                        currentThis.map.new_reaction_from_scratch(_this.self.reactions[i].id, _this.self.startCoordinates, _this.self.direction);
                    }
                    else {
                        for (var k in currentThis.map.nodes) {
                            if (currentThis.map.nodes[k].name === _this.self.metabolitesNames[i]) {
                                currentThis.map.new_reaction_for_metabolite(_this.self.reactions[i].id, k, _this.self.direction);
                                break;
                            }
                        }
                    }
                }
                for (var n in currentThis.map.nodes) {
                    currentThis.map.nodes[n].node_is_primary = (_this.self.metabolitesNames.indexOf(currentThis.map.nodes[n].name) != -1);
                }
                currentThis.map.draw_everything();
                currentThis.map.zoom_extent_nodes();
                currentThis.map.select_none();
            }
        };
    }
    ;
    EscherService.prototype.alignReactions = function (data) {
        var model = Object.assign({}, data.model);
        for (var i in data.primary_nodes) {
            for (var j in model.reactions) {
                if (model.reactions[j].id === data.reactions[i].id) {
                    if (model.reactions[j].metabolites[data.primary_nodes[i].id] > 0) {
                        for (var k in model.reactions[j].metabolites) {
                            model.reactions[j].metabolites[k] *= -1;
                        }
                    }
                }
            }
        }
        return model;
    };
    EscherService.prototype.buildMap = function (data, controller_id) {
        var _this = this;
        data.primary_nodes.forEach(function (value) { return _this.metabolitesNames.push(value.name); });
        this.reactions = data.reactions;
        Builder(null, this.alignReactions(data), null, d3.select('#' + controller_id), this.options);
    };
    return EscherService;
}());
exports.EscherService = EscherService;
escher.service('EscherService', EscherService);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = escher;

//# sourceMappingURL=escher.service.js.map
