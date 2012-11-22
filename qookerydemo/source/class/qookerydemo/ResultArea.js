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

qx.Class.define("qookerydemo.ResultArea",
{
	extend: qx.ui.container.Scroll,

	construct: function() {
		this.base(arguments);
		this.setPadding(10);
	},

	members:  {

		__formComponent: null,
		
		loadForm: function(xmlCode) {
			if(this.__formComponent) {
				this.__formComponent.dispose();
				this._disposeObjects("__formComponent");
			}
			var that = this;
			this.__formComponent = qookery.impl.QookeryContext.createFormComponent(xmlCode, this, null, function () {
				that.remove(that.getChildren()[0]);
			});
		},
		
		getFormComponent: function() {
			return this.__formComponent;
		}
	},

	destruct: function() {
		this._disposeObjects("__formComponent");
	}
});
