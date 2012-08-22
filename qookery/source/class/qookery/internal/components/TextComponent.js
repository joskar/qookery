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

qx.Class.define("qookery.internal.components.TextComponent", {

	extend: qookery.internal.components.EditableComponent,

	construct: function(parentComponent) {
		this.base(arguments, parentComponent);
	},
	
	members: {

		_createMainWidget: function(createOptions) {
			var widget = new qx.ui.form.TextField();
			widget.setLiveUpdate(true);
			widget.addListener("changeValue", function(event) { 
				this.setValue(event.getData()); 
			}, this);
			this._applyLayoutProperties(widget, createOptions);
			return widget;
		},
		
		_applyValue: function(value) {
			this.getMainWidget().setValue(this._getLabelOf(value));
		}
	}
});
