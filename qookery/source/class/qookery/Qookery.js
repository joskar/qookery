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

	$Id$
*/

/**
 * Entry class for accessing Qookery features
 */
qx.Class.define("qookery.Qookery", {

	type: "singleton",
	extend: qx.core.Object,
	
	construct: function() {
		this.base(arguments);
		this.__resourceLoader = qookery.impl.SimpleResourceLoader.getInstance();
	},

	members: {

		__modelProvider: null,
		__resourceLoader: null,
		
		createNewParser: function() {
			return new qookery.internal.FormParser();
		},

		getModelProvider: function() {
			return this.__modelProvider;
		},

		setModelProvider: function(provider) {
			this.__modelProvider = provider;
		},
		
		getRegistry: function() {
			return qookery.internal.Registry.getInstance();
		},
		
		setResourceLoader: function(loader) {
			this.__resourceLoader = loader;
		},
		
		getResourceLoader: function() {
			return this.__resourceLoader;
		}
	},
	
	destruct: function() {
		this.__modelProvider = null;
	}
});
