// Turn of WS TS inspection for the 'decaf-common' import.
// noinspection TypeScriptCheckImport
import {Config, dirname} from 'decaf-common';
import './pathways.component.css!';
import './escher-builder.css!';
import 'jquery';
import escher, {EscherService} from './escher.service';
import pathways, {PathwaysService} from './pathways.service';


export const COMPONENT_NAME = 'pathways';
const pathwaysModule = angular.module(COMPONENT_NAME, [
	escher.name,
	pathways.name
]);

pathwaysModule.config(function (platformProvider) {
	platformProvider
		.register(COMPONENT_NAME)
		.state(COMPONENT_NAME, {
			url: `/${COMPONENT_NAME}`,
			views: {
				'content@': {
					templateUrl: `${dirname(module.id)}/pathways.component.html`,
					controller: PathwaysController,
					controllerAs: 'pathwaysController'
				}
			}
		});
});


interface FormConfig {
	title: string;
	attr: string;
	placeholder: string;
	list: () => any[];
}

class PathwaysController {
	isDisabled: boolean;
	isWaiting: boolean;
	models: any[];
	universalModels: any[];
	carbonSources: any[];
	products: any;
	formConfig: FormConfig[];
	searchTexts: any;
	message: string;
	product: any;
	model: any;
	universalModel: any;
	carbonSource: any;
	data: any;
	mapIdPrefix: string;
	pathwaysService: PathwaysService;
	escherService: EscherService;
	private $timeout: angular.ITimeoutService;

	constructor($timeout, PathwaysService: PathwaysService, EscherService: EscherService) {
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
				'list': () => this.universalModels
			},
			{
				'title': 'Model',
				'attr': 'models',
				'placeholder': 'iJO1366',
				'list': () => {
					return this.models.concat([{
						value: this.searchTexts.universalModels,
						display: this.searchTexts.universalModels
					}]);
				}
			},
			{
				'title': 'Carbon source',
				'attr': 'carbonSources',
				'placeholder': 'EX_glc_lp_e_rp_',
				'list': () => this.carbonSources
			},
			{
				'title': 'Product',
				'attr': 'products',
				'placeholder': '',
				'list': () => this.products[this.searchTexts.universalModels]
			}
		];

		this.searchTexts = {};
		this.defaultSearchValues();
		this.message = '';
		this.product = undefined;
		this.data = [];
		this.mapIdPrefix = 'mapContainer';
	}
	defaultSearchValues() {
		this.formConfig.forEach((value) => {
			this.searchTexts[value.attr] = value.placeholder;
		});
	}
	querySearch (query, data) {
		return query ? data.filter( this.createFilterFor(query) ) : data;
	}
	createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(option) {
			return (angular.lowercase(option.display).indexOf(lowercaseQuery) !== -1);
		};
	}
	loadLists() {
		this.loadAllUniversalModels();
		this.loadAllModels();
		this.loadAllCarbonSources();
	}
	loadAllModels() {
		this.pathwaysService.loadModels()
			.then((data: any) => {
				data.data.forEach((value) => {
					this.models.push({
						value: value.id,
						display: value.name + ' (' + value.id + ')'
					});
				});
			});
	}

	loadAllUniversalModels() {
		this.pathwaysService.loadUniversalModels()
			.then((data: any) => {
				data.data.forEach((value) => {
					this.universalModels.push({
						value: value.id,
						display: value.name
					});
				});
				this.loadAllProducts();
			});
	}

	loadAllProducts() {
		angular.forEach(this.universalModels, (value) => {
			let universalModelId = value.value;
			this.products[universalModelId] = [];
			this.pathwaysService.loadProducts(universalModelId)
				.then((data: any) => {
						data.data.forEach((productValue) => {
							this.products[universalModelId].push({
								value: productValue.id,
								display: productValue.name
							});
						});
					}
				);
		}, this.products);
	}

	loadAllCarbonSources() {
		this.pathwaysService.loadCarbonSources()
			.then((data: any) => data.data.forEach((value) => {
				this.carbonSources.push({
					value: value.id,
					display: value.name
				});
			}));
	}

	submit() {
		this.data = [];
		this.message = '';
		this.model = this.searchTexts.models;
		this.product = this.searchTexts.products;
		this.universalModel = this.searchTexts.universalModels;
		this.carbonSource = this.searchTexts.carbonSources;
		this.isWaiting = true;

		let tick = () => {
			this.pathwaysService
				.getStatus(this.universalModel, this.model, this.carbonSource, this.product)
				.then((statusResponse) => this.pathwaysService
					.getPathways(this.universalModel, this.model, this.carbonSource, this.product)
					.then((dataResponse: any) => [statusResponse.status, dataResponse]))
				.then(
					// Success
					([status, dataResponse]) => {
						let data: any[] = dataResponse.data;
						for (var i = this.data.length; i < data.length; i += 1) {
							this.data.push(data[i]);
						}
						if (status === 202) {
							this.$timeout(tick, 1000);
						} else {
							this.isWaiting = false;
							if (data.length === 0) {
								this.message = 'Pathways not found';
							}
						}
					},
					// Error
					([status, dataResponse]) => {
						this.isWaiting = false;
						if (status === 404) {
							this.message = 'No such key';
						}
					}
				);
		};

		tick();
	}

}

export default pathwaysModule;
