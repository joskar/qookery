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
 * @asset(qookery/lib/ckeditor/*)
 *
 * @ignore(CKEDITOR)
 * @ignore(CKEDITOR.*)
 */
qx.Class.define("qookery.richtext.internal.RichTextComponent", {

	extend: qookery.internal.components.EditableComponent,

	statics: {
		pending: null // Array of widgets waiting for script to load
	},

	construct: function(parentComponent) {
		this.base(arguments, parentComponent);
	},

	members: {

		__ckEditor: null,
		__previousValue: null,

		create: function(attributes) {
			this.base(arguments, attributes);
		},

		_createMainWidget: function(attributes) {
			// Create lightest possible widget since we only need a <div>
			var widget = new qx.ui.core.Widget();
			// Make it look like a text field
			widget.setAppearance("textfield");
			// Configure widget positioning by applying layout
			this._applyLayoutAttributes(widget, attributes);
			// Defer creation of CKEditor until after positioning is done
			widget.addListenerOnce("appear", function(event) {
				this.__createCkEditor(widget);
			}, this);
			return widget;
		},

		_updateUI: function(value) {
			// It is possible that we are not ready to accept values yet
			if(!this.__ckEditor) return;
			// Check incoming value, if not different from previous one ignore it
			if(value === this.__previousValue) return;
			// Store and set new value into CKEditor
			this.__previousValue = value;
			this.__ckEditor.setData(value);
		},

		// Automatic loading of CKEditor on first use

		__loadCkEditor: function() {
			this.debug("Loading CKEditor");
			var scriptUri = qx.util.ResourceManager.getInstance().toUri("qookery/lib/ckeditor/ckeditor.js");
			var scriptRequest = new qx.bom.request.Script();
			scriptRequest.onload = function() {
				var pending = qookery.richtext.internal.RichTextComponent.pending;
				pending.forEach(function(createFunction) { createFunction(); });
				pending = [ ];
			};
			scriptRequest.open("GET", scriptUri);
			scriptRequest.send();
		},

		__createCkEditor: function(widget) {
			// If the script is already loaded, just create this editor
			if(typeof CKEDITOR != 'undefined') return this.__createCkEditor0(widget);
			// Is this the first time a CKEditor is needed?
			if(!this.constructor.pending) {
				this.constructor.pending = [ ];
				this.__loadCkEditor();
			}
			// Add widget to the queue of waiting ones
			var createFunction = this.__createCkEditor0.bind(this, widget);
			this.constructor.pending.push(createFunction);
		},

		__createCkEditor0: function(widget) {
			// Method might be called after widget destruction
			if(widget.isDisposed()) return;
			// Make qx.html.Element selectable, otherwise mouse behavior is broken
			var htmlElement = widget.getContentElement();
			htmlElement.setSelectable(true);
			// Get underlying DOM element and invoke CKEditor inline()
			var domElement = htmlElement.getDomElement();
			domElement.setAttribute("contenteditable", "true");
			CKEDITOR.disableAutoInline = true;
			this.__ckEditor = CKEDITOR.inline(domElement, {
				language: qx.locale.Manager.getInstance().getLanguage()
			});
			
			if(this.getValue() !== null && this.__ckEditor.getData().trim().length === 0) {
				this.__previousValue = this.getValue();
				this.__ckEditor.setData(this.getValue());
			}
			
			// Register change listener
			this.__ckEditor.on("change", this.__onCkEditorChange, this);
		},

		__onCkEditorChange: function() {
			// If the reason of this event is us, do nothing
			if(this._disableValueEvents) return;
			// Check incoming value, if not different from previous one ignore it
			var data = this.__ckEditor.getData();
			var value =  ( data.trim().length == 0 ) ? null : data ;
			if(value === this.__previousValue) return;
			// Store value for later difference check, according to CKEditor manual
			this.__previousValue = value;
			// Update model
			this.setValue(value);
		}
	},

	destruct: function() {
		// We have to behave ourselves and properly clean up our mess
		if(this.__ckEditor) {
			this.__ckEditor.destroy();
			this.__ckEditor = null;
		}
		this.__previousValue = null;
	}
});
