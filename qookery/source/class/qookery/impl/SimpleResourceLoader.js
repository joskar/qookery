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

	$Id: SimpleTableModel.js 20 2012-11-05 09:36:53Z nikoslam@ergobyte.gr $
*/

qx.Class.define("qookery.impl.SimpleResourceLoader", {

	implement: [ qookery.IResourceLoader ],
	type: "singleton",
	extend: qx.core.Object,

	members: {

   		loadResource: function(url, successCallback, failCallback, options) { 
			var req = new qx.bom.request.Xhr();
			if(successCallback != null)
				req.onload = function(event) {
					successCallback(req);
				};
			req.open("GET", (url + "?nocache=" + new Date().getTime()));
			req.send();
   		}
	}
});
