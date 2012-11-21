
qx.Class.define("qookery.impl.QookeryContext", {
	
	type: "static",
	
	statics: {
		
		createFormComponent: function(xmlCode, parentComposite, layoutData, formCloseHandler) {
			var xmlDocument = qx.xml.Document.fromString(xmlCode);
			var parser = qookery.Qookery.getInstance().createNewParser();
			try {
				var formComponent = parser.create(xmlDocument, parentComposite, layoutData);
				formComponent.addListener("closeForm", function(event) {
					if(formCloseHandler) formCloseHandler(event);
					qx.log.Logger.debug(parentComposite, qx.lang.String.format("Form window destroyed", [ ]));
				});
				formComponent.fireEvent("openForm", qx.event.type.Event, null);
				qx.log.Logger.debug(parentComposite, qx.lang.String.format("Form window created", [ ]));
				return formComponent;
			}
			catch(e) {
				qx.log.Logger.error(parentComposite, qx.lang.String.format("Error creating form window", [ ]));
				qx.log.Logger.error(e.stack);
			}
			finally {
				parser.dispose();
			}
			return null;
		},
		
		openWindow: function(formUrl, model, resultCallback, title, icon) {
			icon = icon || null;
			title = title || null;
			qookery.Qookery.getInstance().getResourceLoader().loadResource(formUrl, function(req) {
				var window = new qookery.impl.FormWindow(title, icon);
				window.createAndOpen(req.responseText, model);
				window.addListener("disappear", function() {
					resultCallback(window.getFormComponent().getResult());
					window = null;
				});
			});
		}
	}
});