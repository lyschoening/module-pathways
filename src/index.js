import angular from 'angular';
import {DevAppModule} from 'iloop-frontend-core';
import {PathwaysModule} from './pathways/pathways.module';
export {PathwaysModule} from './pathways/pathways.module';


export const PathwaysAppModule = angular.module('PathwaysApp', [
	DevAppModule.name,
    PathwaysModule.name
]);
