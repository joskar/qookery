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

qx.Class.define("qookery.contexts.Qookery", {

	type: "static",

	statics: {

		/**
		 * Use resource loader to load a resource
		 *
		 * @param {} resourceUrl the URL of the resource to load
		 * @param {} callback a callback to call on successful loading
		 */
		loadResource: function(resourceUrl, callback) {
			qookery.Qookery.getInstance().getResourceLoader().loadResource(resourceUrl, callback);
		},

		createFormComponent: function(xmlCode, parentComposite, layoutData, formCloseHandler, self) {
			var xmlDocument = qx.xml.Document.fromString(xmlCode);
			var parser = qookery.Qookery.getInstance().createNewParser();
			try {
				var formComponent = parser.create(xmlDocument, parentComposite, layoutData);
				formComponent.addListener("closeForm", function(event) {
					if(formCloseHandler) qx.lang.Function.bind(formCloseHandler, self, event)();
					qx.log.Logger.debug(parentComposite, qx.lang.String.format("Form window destroyed", [ ]));
				});
				formComponent.fireEvent("openForm", qx.event.type.Event, null);
				qx.log.Logger.debug(parentComposite, qx.lang.String.format("Form window created", [ ]));
				return formComponent;
			}
			catch(e) {
				qx.log.Logger.error(parentComposite, qx.lang.String.format("Error creating form window: %1", [ e ]));
				if(e.stack) qx.log.Logger.error(e.stack);
			}
			finally {
				parser.dispose();
			}
			return null;
		},

		/**
		 * Load a form and open it as a top-level modal window
		 *
		 * @param formUrl {String} the URL of the XML form resource to load
		 * @param model {var?null} an optional model to load into the form
		 * @param resultCallback {Function?null} a callback that will receive the form's result property on close
		 * @param caption {String?null} a caption for the created Window instance
		 * @param icon {String?null} an icon for the created Window instance
		 */
		openWindow: function(formUrl, model, resultCallback, caption, icon) {
			this.loadResource(formUrl, function(formXml) {
				var window = new qookery.impl.FormWindow(caption, icon);
				window.createAndOpen(formXml, model);
				window.addListener("disappear", function() {
					var result = window.getFormComponent().getResult();
					if(resultCallback) resultCallback(result);
					window = null;
				});
			});
		}
	}
});
