/*
	Qookery - Declarative UI Building for Qooxdoo

	Copyright (c) Ergobyte Informatics S.A., www.ergobyte.gr

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.

	$Id: IModelProvider.js 21 2012-11-09 11:56:48Z nikoslam@ergobyte.gr $
*/

/**
 * TODO
 */
qx.Interface.define("qookery.IRegistry", {

	members: {

		/**
		 * 
		 * @param {String} validator The IValidator class name
		 * @param {String} name The name of the validator for subsequent access
		 */
		registerValidator: function(validator, name) { },
		
		/**
		 * 
		 * @param {String} validator The name of the validator
		 * @return {IValidator} The real Validator or null
		 */
		getValidator: function(validator) { },
		
		/**
		 * 
		 * @param {String} component The IComponent class name
		 * @param {String} name The name of the component for subsequent access
		 */
		registerComponent: function(component, name) { },
		
		/**
		 * 
		 * @param {String} component The name of the component
		 * @return {IComponent} The Component class name or null
		 */
		getComponent: function(component) { }
	}
});