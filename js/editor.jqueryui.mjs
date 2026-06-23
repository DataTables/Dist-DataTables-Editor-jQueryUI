/*! Editor jQuery UI styling 3.0.0-dev for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable from 'datatables.net-jqui';
import Editor from 'datatables.net-editor';


//
// Note that this file does use jQuery as jQuery UI's JS depends on jQuery for
// its modal, so we know that it must be present.
//

var doingClose = false;

/*
 * Set the default display controller to be our foundation control
 */
DataTable.Editor.defaults.display = 'jqueryui';

const util = DataTable.util;

/*
 * Change the default classes from Editor to be classes for Bootstrap
 */
var buttonClass =
	'btn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only';
util.object.assignDeep(DataTable.Editor.classes, {
	form: {
		button: buttonClass,
		buttonInternal: buttonClass,
		buttonSubmit: buttonClass
	}
});

var dialogue;

/*
 * jQuery UI display controller - this is effectively a proxy to the jQuery UI
 * modal control.
 */
DataTable.Editor.display.jqueryui = util.object.assignDeep(
	{},
	DataTable.Editor.models.displayController,
	{
		init: function () {
			var $ = DataTable.use('jq');

			if (!dialogue) {
				dialogue = $('<div class="DTED"></div>')
					.css('display', 'none')
					.appendTo('body')
					.dialog(
						util.object.assignDeep(
							DataTable.Editor.display.jqueryui.modalOptions,
							{
								autoOpen: false,
								buttons: { A: function () {} }, // fake button so the button container is created
								closeOnEscape: false // allow editor's escape function to run
							}
						)
					);

				dialogue.data('uiDialog')._focusTabbable = function () {};
			}

			return DataTable.Editor.display.jqueryui;
		},

		open: function (dte, append, callback) {
			var $ = DataTable.use('jq');

			dialogue.children().detach();

			dialogue.append(append).dialog('open');

			$(dte.dom.formError).appendTo(
				dialogue.parent().find('div.ui-dialog-buttonpane')
			);

			dialogue
				.parent()
				.find('.ui-dialog-title')
				.html(dte.dom.header.innerHTML);
			dialogue.parent().addClass('DTED');

			// Modify the Editor buttons to be jQuery UI suitable
			var buttons = $(dte.dom.buttons)
				.children()
				.addClass(
					'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'
				)
				.each(function () {
					$(this).wrapInner('<span class="ui-button-text"></span>');
				});

			// Move the buttons into the jQuery UI button set
			dialogue
				.parent()
				.find('div.ui-dialog-buttonset')
				.children()
				.detach();

			dialogue
				.parent()
				.find('div.ui-dialog-buttonset')
				.append(buttons.parent());

			dialogue
				.parent()
				.find('button.ui-dialog-titlebar-close')
				.off('click')
				.on('click', function () {
					if (!doingClose) {
						dte.close('icon');
					}
				});

			// Need to know when the dialogue is closed using its own trigger
			// so we can reset the form
			$(dialogue)
				.off('dialogclose.dte-ju')
				.on('dialogclose.dte-ju', function () {
					if (!doingClose) {
						dte.close();
					}
				});

			if (callback) {
				callback();
			}
		},

		close: function (dte, callback) {
			if (dialogue) {
				// Don't want to trigger a close() call from dialogclose!
				doingClose = true;
				dialogue.dialog('close');
				doingClose = false;
			}

			if (callback) {
				callback();
			}
		},

		node: function () {
			return dialogue.parent()[0];
		}
	}
);

DataTable.Editor.display.jqueryui.modalOptions = {
	width: 600,
	modal: true
};


export default DataTable.Editor;

