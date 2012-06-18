/**
 * Base class for all qookery components. 
 */
qx.Class.define("qookery.internal.components.BaseComponent", {

	type : "abstract",
	extend: qx.core.Object,
	implement: [ qookery.IComponent ],

	construct: function(parentComponent) {
		this.base(arguments);
		this._parentComponent = parentComponent;
		this._widgets = [ ];
	},

	members: {

		_parentComponent: null,
		_createOptions: null,
		_widgets: null,
		
		// Implementations

		/**
		 * Create Qooxdoo widget(s)
		 * 
		 * @param createOptions {keyValuePairList} an object with any number of setup options
		 */
		create: function(createOptions) {
			// Override to provide component-specific implementation and call base
			if(this._widgets.length == 0)
				throw "Component failed to create at least one widget";
			this._createOptions = createOptions;
			for(var i = 0; i < this._widgets.length; i++) {
				this._widgets[i].setUserData('qookeryComponent', this);
			}
		},

		/**
		 * @return the keyValuePairList that contains the parameters that the component has been created
		 */
		getCreateOptions: function() {
			return this._createOptions;
		},

		/**
		 * Add a component as a child of this component
		 * 
		 * @param childComponent {qookery.IComponent} the component to add to this component
		 * 
		 * @throw an exception is thrown in case this component does not support children
		 */
		addChild: function(childComponent) {
			var widgets = childComponent.listWidgets();
			for(var i = 0; i < widgets.length; i++) {
				this.getMainWidget().add(widgets[i]);
			}
		},

		/**
		 * Perform setup operations after all children have been created
		 */
		setup: function() { 
			// Nothing to do here, override if needed
		},

		getValue: function() {
			// Must overide
		},

		listWidgets: function(filterName) { 
			return this._widgets;
		},

		getParent: function() {
			return this._parentComponent;
		},

		getForm: function() {
			if(this._parentComponent == null) return null;
			return this._parentComponent.getForm();
		},

		/**
		 * Create a two way binding
		 *	
		 * @param controller {qx.data.controller.Object} The form controller that the bindings
		 * @param path {String} The protocol path
		 */
		connect: function(controller, path) {
			throw "Method not implemented";
		},

		/**
		 * Add a listener to this component
		 * 
		 * @param {String} eventName The name of the event to listen to
		 * @param {String} listenerSourceCode The JavaScript source code to execute when the event is triggered
		 */
		addEventHandler: function(eventName, listenerSourceCode) {
			var userWidget = null;
			
			userWidget = this.listWidgets('user')[0];
			if(userWidget == null) throw "Unable to attach listener to component without a user widget";
			userWidget.addListener(eventName, function(event) {
				this.executeClientCode(listenerSourceCode, event);
			}, this);
		},

		addValidation: function(options) {
			var type = options['type'];
			var message = options['message'];
			var widget  = this.listWidgets("user")[0];
			
			if(type == null || type.length == 0) throw "Validation type required";
			
			var className = "qookery.internal.validators." + qx.lang.String.firstUp(type) + "Validator";
			var clazz = qx.Class.getByName(className);
			if(clazz == null) throw "Validator class " + className + "not found";
			
			var validator = new clazz(message);
			var qxValidator = new qx.ui.form.validation.AsyncValidator(validator);
			
			this.getForm().getValidationManager().add(widget, qxValidator);
		},

		/**
		 * ExecuteClientCode will be called whenever a setup or an handler need to be executed
		 * 
		 * @param clientCode {String} The Code to execute
		 */
		executeClientCode: function(clientSourceCode, event) {
			var context = this.__createClientCodeContext(event);
			with(context) {
				eval(clientSourceCode);
			}
		},

		// Public methods for internal use
		
		getMainWidget: function() {
			return this._widgets[0];
		},

		clearValidations: function(component) {
			var widget = this.listWidgets('user')[0]; 
			this.getForm().getValidationManager().remove(widget);
		},

		// Private methods for internal use

		/**
		 * Perform all operation about align, width and height for a component
		 * 
		 * @param widget {widget} A widget
		 * @param positionOptions {keyValuePairList} The instruction about the widget apperance
		 */
		_setupWidgetAppearance:function(widget, positionOptions) {
			// Components appearance parameters 
			
			if(!(positionOptions['widthHint'] == '' || positionOptions['widthHint'] == null )) {
				widget.setMinWidth(positionOptions['widthHint']);
			}
			
			if(!(positionOptions['heightHint'] == '' || positionOptions['heightHint'] == null )) {
				widget.setMinHeight(positionOptions['heightHint']);
			}
			
			if(positionOptions['grabHorizontal'] == "false") {
				widget.setMaxWidth(positionOptions['widthHint']);
				widget.setAllowStretchX(false, false);
			}
			else {
				widget.setAllowStretchX(true, true);
			}
			
			if(positionOptions['grabVertical'] == "false") {
				widget.setMaxHeigth(positionOptions['heightHint']);
				widget.setAllowStretchY(false, false);
			}
			else {
				widget.setAllowStretchY(true, true);
			}
			
			// Component horizontal position 
			if(positionOptions['horizontalAlignment'] == "left") {
				widget.setAlignX("left");
			} 
			else if(positionOptions['horizontalAlignment'] == "right") {
				widget.setAlignX("right");
			}

			// Component vertical position
			if(positionOptions['verticalAlignment'] == "top") {
				widget.setAlignY("top");
			}
			else if( positionOptions['verticalAlignment'] == "bottom") {
				widget.setAlignY("bottom");
			}
			else {
				widget.setAlignY("middle");
			}
		},

		/**
		 * Perform all operation about align, width and height for a label
		 * 
		 * @param widget {qx.ui.basic.Label} A label widget
		 * @param positionOptions {keyValuePairList} The instruction about the label apperance
		 */
		_setupLabelAppearance: function(labelWidget, positionOptions) {
			var currentWidth = labelWidget.getWidth();
			labelWidget.setMinWidth(currentWidth);
			labelWidget.setMaxWidth(currentWidth);
			
			labelWidget.setAllowShrinkX(false);
			labelWidget.setAllowGrowX(false);
			
			// Component horizontal position 
			if(positionOptions['horizontalAlignment'] == "left")
				labelWidget.setAlignX("left");
			else if(positionOptions['horizontalAlignment'] == "right")
				labelWidget.setAlignX("right");

			// Component vertical position
			if(positionOptions['verticalAlignment'] == "top")
				labelWidget.setAlignY("top");
			else if(positionOptions['verticalAlignment'] == "bottom")
				labelWidget.setAlignY("bottom");
			else
				labelWidget.setAlignY("middle");
		},

		/**
		 * <pre>
		 * Generate Contex to be used in executeClientCode function.
		 * </pre>
		 * @param {qx.event} event
		 * @return a keyPairValue list that contain the generated event , the widget, the getComponent(id) function and the getContext(contextId) function.
		 */
		__createClientCodeContext: function(event) {
			var component = this;
			return {
				event: event,
				
				widget: this.listWidgets("user")[0],
				
				getComponent: function(id) {
					if(id == null || id.length == 0) return component;
					return component.getForm().getComponentById(id);
				},
				
				getContext: function(contextId) {
					if(contextId == null) return this;
					return component.getForm().getUserContext(contextId);
				}
			};
		},

		/**
		 * Dispose all windgets and remove them form the parent.
		 */
		_disposeAllWidgets: function(){
			// Overide if you need to handle the disposal of widgets.
			for(var i = 0; i < this._widgets.length; i++) {
				this._widgets[i].removeAllBindings(); // Just to be sure
				this._widgets[i].destroy(); // Removes the widget from the parent and dispose it.
			}
			this._widgets = null;
		}
	},

	destruct: function() {
		this._disposeAllWidgets();
		this._parentComponent = null;
		this._createOptions = null;
		this._widgets = null;
	}
});
