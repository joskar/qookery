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
*/

/**
 * Base class for all Qookery components.
 */
qx.Class.define("qookery.internal.components.Component", {

	type: "abstract",
	extend: qx.core.Object,
	implement: [ qookery.IComponent ],

	statics: {

		__LAYOUT_ITEM_PROPERTY_MAP: {
			"col-span": "colSpan",
			"column": "column",
			"flex": "flex",
			"left": "left",
			"line-break": "lineBreak",
			"row": "row",
			"row-span": "rowSpan",
			"stretch": "stretch",
			"top": "top"
		}
	},

	properties: {
		enabled: { init: true, check: "Boolean", inheritable: true, apply: "_applyEnabled" },
		visibility: { init: "visible", check : [ "visible", "hidden", "excluded" ], inheritable: true, apply: "_applyVisibility" }
	},

	construct: function(parentComponent) {
		this.base(arguments);
		this.__parentComponent = parentComponent;
		this.__namespaceResolver = parentComponent != null ? function(prefix) {
			return parentComponent.resolveNamespacePrefix(prefix);
		} : function(prefix) {
			return null;
		};
		this._widgets = [ ];
		this.__actions = { };
	},

	members: {

		__id: null,
		__parentComponent: null,
		__namespaceResolver: null,
		__attributes: null,
		__actions: null,
		__disposeList: null,

		_widgets: null,

		// Metadata

		getId: function() {
			return this.__id;
		},

		getAttributeType: function(attributeName) {
			return qookery.internal.Registry.getInstance().getAttributeType(attributeName);
		},

		getAttribute: function(attributeName, defaultValue) {
			var value = this.__attributes[attributeName];
			if(value !== undefined)
				return value;
			if(defaultValue === Error)
				throw new Error(qx.lang.String.format("Required attribute '%1' missing from component '%2'", [ attributeName, this ]));
			return defaultValue;
		},

		setAttribute: function(attributeName, value) {
			switch(attributeName) {
			case qookery.IComponent.A_ID:
				this.__id = value;
				return;
			case qookery.IComponent.A_NAMESPACES:
				var parent = this.getParent();
				this.__namespaceResolver = function(prefix) {
					var namespaceUri = value[prefix];
					if(namespaceUri != null)
						return namespaceUri;
					if(parent != null)
						return parent.resolveNamespacePrefix(prefix);
					return null;
				};
				return;
			}
			throw new Error(qx.lang.String.format("Setting attribute '%1' is not implemented", [ attributeName ]));
		},

		// Namespaces

		resolveNamespacePrefix: function(prefix) {
			return this.__namespaceResolver(prefix);
		},

		resolveQName: function(qName) {
			return qookery.util.Xml.resolveQName(this.__namespaceResolver, qName);
		},

		// Lifecycle

		create: function(attributes) {
			// Attention: Base method must be called early when overriden
			this.__attributes = attributes;

			this._widgets = this._createWidgets(attributes);
			this._registerWithWidgets();

			if(attributes["enabled"] !== undefined) this.setEnabled(attributes["enabled"]);
			if(attributes["visibility"] !== undefined) this.setVisibility(attributes["visibility"]);
		},

		parseXmlElement: function(elementName, xmlElement) {
			// Override to implement custom elements
			return false;
		},

		setup: function(attributes) {
			// Nothing to do here, override if needed
		},

		// Access to other components

		getForm: function() {
			if(!this.__parentComponent) return null;
			return this.__parentComponent.getForm();
		},

		getParent: function() {
			return this.__parentComponent;
		},

		setAction: function(actionName, scriptFunction) {
			this.__actions[actionName] = scriptFunction;
		},

		listWidgets: function(filterName) {
			return this._widgets;
		},

		getMainWidget: function() {
			return this.listWidgets("main")[0];
		},

		focus: function() {
			this.getMainWidget().focus();
		},

		addEventHandler: function(eventName, handler, onlyOnce) {
			var receiver = null;
			if(qx.Class.supportsEvent(this.constructor, eventName)) {
				receiver = this;
			}
			else {
				var mainWidget = this.getMainWidget();
				if(mainWidget != null && qx.Class.supportsEvent(mainWidget.constructor, eventName))
					receiver = mainWidget;
			}
			if(!receiver)
				throw new Error(qx.lang.String.format("Event '%1' not supported", [ eventName ]));

			var methodName = onlyOnce ? "addListenerOnce" : "addListener";
			receiver[methodName](eventName, handler, this);
		},

		executeAction: function(actionName, varargs) {
			var actionFunction = this.__actions[actionName];
			if(actionFunction == null) return null;
			var actionArguments = Array.prototype.slice.call(arguments, 1);
			return actionFunction.apply(this, actionArguments);
		},

		evaluateExpression: function(expression) {
			return this.executeClientCode("return (" + expression + ");", null);
		},

		executeClientCode: function(clientCode, argumentMap) {
			var clientCodeContext = this.getForm().getScriptingContext();
			try {
				argumentMap = argumentMap || { };
				var keys = Object.keys(argumentMap);
				var values = qx.lang.Object.getValues(argumentMap);
				qx.lang.Array.insertAt(keys, "$", 0);
				qx.lang.Array.insertAt(values, clientCodeContext, 0);
				var clientFunction = new Function(keys, clientCode);
				return clientFunction.apply(this, values);
			}
			catch(error) {
				qookery.util.Debug.logScriptError(this, clientCode, error);
				throw error;
			}
		},

		isActionSupported: function(actionName) {
			return this.__actions[actionName] !== undefined;
		},

		validate: function() {
			// Override to implement component validation
			return null;
		},

		tr: function(messageId, varArgs) {
			if(!messageId) return null;
			var manager = qx.locale.Manager;
			if(!manager) return messageId;
			if(messageId.charAt(0) === ".")
				messageId = (this.getForm().getTranslationPrefix() || "") + messageId;
			else if(messageId.charAt(0) === "$")
				messageId = this.classname + messageId;
			var formatArguments = qx.lang.Array.fromArguments(arguments, 1);
			return qx.locale.Manager.getInstance().translate(messageId, formatArguments);
		},

		addToDisposeList: function(disposable) {
			if(!this.__disposeList) this.__disposeList = [ ];
			this.__disposeList.push(disposable);
		},

		toString: function() {
			var hash = this.__id || this.$$hash;
			var form = this.getForm();
			if(form != null && form.getId() != null)
				hash = form.getId() + "#" + hash;
			return this.classname + "[" + hash + "]";
		},

		// Protected methods for internal use

		_getAttributes: function() {
			return this.__attributes;
		},

		_createWidgets: function(attributes) {
			// Subclasses are advised to implement this method instead of overriding create()
			return this._widgets;
		},

		/**
		 * Add component information to its widgets
		 */
		_registerWithWidgets: function() {
			if(this._widgets.length === 0)
				throw new Error("Component failed to create at least one widget");

			for(var i = 0; i < this._widgets.length; i++)
				this._widgets[i].setUserData("qookeryComponent", this);

			if(this.getId())
				this.getMainWidget().getContentElement().setAttribute("qkid", this.getId());
		},

		/**
		 * Apply common attributes to a widget
		 *
		 * @param widget {qx.ui.core.Widget} widget to receive layout properties
		 * @param attributes {Object} layouting instructions as provided by the XML parser
		 */
		_applyLayoutAttributes: function(widget, attributes) {

			// Size and position

			if(attributes["width"] !== undefined) widget.setWidth(attributes["width"]);
			if(attributes["height"] !== undefined) widget.setHeight(attributes["height"]);
			if(attributes["min-width"] !== undefined) widget.setMinWidth(attributes["min-width"]);
			if(attributes["min-height"] !== undefined) widget.setMinHeight(attributes["min-height"]);
			if(attributes["max-width"] !== undefined) widget.setMaxWidth(attributes["max-width"]);
			if(attributes["max-height"] !== undefined) widget.setMaxHeight(attributes["max-height"]);

			if(attributes["align-x"] !== undefined) widget.setAlignX(attributes["align-x"]);
			if(attributes["align-y"] !== undefined) widget.setAlignY(attributes["align-y"]);

			if(attributes["allow-grow"] !== undefined) { var v = attributes["allow-grow"]; widget.setAllowGrowX(v); widget.setAllowGrowY(v); }
			if(attributes["allow-grow-x"] !== undefined) widget.setAllowGrowX(attributes["allow-grow-x"]);
			if(attributes["allow-grow-y"] !== undefined) widget.setAllowGrowY(attributes["allow-grow-y"]);

			if(attributes["allow-shrink"] !== undefined) { var v = attributes["allow-shrink"]; widget.setAllowShrinkX(v); widget.setAllowShrinkY(v); }
			if(attributes["allow-shrink-x"] !== undefined) widget.setAllowShrinkX(attributes["allow-shrink-x"]);
			if(attributes["allow-shrink-y"] !== undefined) widget.setAllowShrinkY(attributes["allow-shrink-y"]);

			if(attributes["allow-stretch"] !== undefined) { var v = attributes["allow-stretch"]; widget.setAllowStretchX(v); widget.setAllowStretchY(v); }
			if(attributes["allow-stretch-x"] !== undefined) widget.setAllowStretchX(attributes["allow-stretch-x"]);
			if(attributes["allow-stretch-y"] !== undefined) widget.setAllowStretchY(attributes["allow-stretch-y"]);

			if(attributes["margin"] !== undefined) widget.setMargin(attributes["margin"]);
			if(attributes["margin-top"] !== undefined) widget.setMarginTop(attributes["margin-top"]);
			if(attributes["margin-right"] !== undefined) widget.setMarginRight(attributes["margin-right"]);
			if(attributes["margin-bottom"] !== undefined) widget.setMarginBottom(attributes["margin-bottom"]);
			if(attributes["margin-left"] !== undefined) widget.setMarginLeft(attributes["margin-left"]);

			if(attributes["padding"] !== undefined) widget.setPadding(attributes["padding"]);
			if(attributes["padding-top"] !== undefined) widget.setPaddingTop(attributes["padding-top"]);
			if(attributes["padding-right"] !== undefined) widget.setPaddingRight(attributes["padding-right"]);
			if(attributes["padding-bottom"] !== undefined) widget.setPaddingBottom(attributes["padding-bottom"]);
			if(attributes["padding-left"] !== undefined) widget.setPaddingLeft(attributes["padding-left"]);

			// Appearance

			if(attributes["appearance"] !== undefined) widget.setAppearance(attributes["appearance"]);
			if(attributes["cursor"] !== undefined) widget.setCursor(attributes["cursor"]);
			if(attributes["decorator"] !== undefined) widget.setDecorator(attributes["decorator"]);
			if(attributes["font"] !== undefined) widget.setFont(attributes["font"]);
			if(attributes["text-color"] !== undefined) widget.setTextColor(attributes["text-color"]);
			if(attributes["background-color"] !== undefined) widget.setBackgroundColor(attributes["background-color"]);
			if(attributes["tool-tip-text"] !== undefined) widget.setToolTipText(attributes["tool-tip-text"]);
			if(attributes["tool-tip-icon"] !== undefined) widget.setToolTipIcon(attributes["tool-tip-icon"]);

			// Miscellaneous

			if(attributes["tab-index"] !== undefined) widget.setTabIndex(attributes["tab-index"]);
			if(attributes["focusable"] !== undefined) widget.setFocusable(attributes["focusable"]);

			// Layout item properties

			var layoutProperties = null;
			for(var attributeName in attributes) {
				var propertyName = qookery.internal.components.Component.__LAYOUT_ITEM_PROPERTY_MAP[attributeName];
				if(propertyName == null) continue;
				if(layoutProperties == null) layoutProperties = { };
				layoutProperties[propertyName] = attributes[attributeName];
			}
			if(layoutProperties != null)
				widget.setLayoutProperties(layoutProperties);
		},

		_applyEnabled: function(enabled) {
			var widgets = this.listWidgets();
			for(var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				widget.setEnabled(enabled);
			}
		},

		_applyVisibility: function(visibility) {
			var widgets = this.listWidgets();
			for(var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				widget.setVisibility(visibility);
			}
		}
	},

	destruct: function() {
		this._disposeArray("__disposeList");
		var widgets = this.listWidgets();
		for(var i = 0; i < widgets.length; i++) {
			var widget = widgets[i];
			if(widget == null) continue;
			widget.destroy();
		}
		delete this.__actions;
		this.__parentComponent = null;
		this.__attributes = null;
	}
});
