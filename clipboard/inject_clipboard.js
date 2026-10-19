//TODO: rework jQuery to vanilla js
//TODO: encapsulate extracting value by name - to be used in dynamic config of observed properties

$.noConflict();

//Pega '26: the page title is no longer .heading_2
function getPageHeading() {
	let heading = jQuery(".heading_2");
	return heading.length ? heading : jQuery(".clipboard-page-header span.workarea_header_titles");
}

function handleRightPanelChange() {
    return new Promise(() => {
		//handle pyWorkPage
		if(getPageHeading().length>0 && getPageHeading()[0].textContent.trim() == 'pyWorkPage') {
			//innerText instead of textContent: in Pega '26 the property cell contains a <script> whose text is part of textContent
			let elem = jQuery('div#gridBody_right table.gridTable td.dataLabelRead.gridCell').filter(function(){return this.innerText.trim() === "pyStatusWork"});
			if(elem.length > 0) {
				let status = elem.next()[0].innerText;
				if(status)
					getPageHeading().append(" (<i>" + status + "</i>)");
			}
			
		}
		//handle newAssignPage
		else if(getPageHeading().length > 0 && getPageHeading()[0].textContent.trim() == 'newAssignPage') {
			let addedText = "", cls = "";
			let napElem = jQuery('div#gridBody_right table.gridTable td.dataLabelRead.gridCell').filter(function(){return this.innerText.trim() === "pxObjClass"});
			if(napElem.length > 0) {
				
				cls = napElem.next()[0].innerText;
				if(cls) {
					if(cls.includes("-"))
						cls = cls.split('-')[1];
					addedText += cls;					
				}
			}
			napElem = jQuery('div#gridBody_right table.gridTable td.dataLabelRead.gridCell').filter(function(){return this.innerText.trim() === "pxAssignedOperatorID"});
				if(napElem.length > 0) {
					let op = napElem.next()[0].innerText;
				if(op)
					addedText += ": " + op;
			}
			if(cls)
				getPageHeading().append(" (<i>" + addedText + "</i>)");
		}
		else { //handle all the rest
			let classElement = jQuery('div#gridBody_right table.gridTable td.dataLabelRead.gridCell').filter(function(){return this.innerText.trim() === "pxObjClass"});
			if(classElement.length > 0) {
				let cls = classElement.next()[0].innerText;
				if(cls) {
					getPageHeading().append(" (<i>" + cls + "</i>)");
				}
			}
		}
		//TODO: change to own implementation, like tracer_page, and remove jQuery.filterTable
		if(jQuery('table.gridTable')?.eq(2)) {
		
			document.querySelectorAll("table.gridTable table tr tr").forEach((e) => { e.classList.add("noFilter") });
			//immediately invoked function expression to avoid "$" conflicts using plugins
			(function( $ ) {
				$('table.gridTable').eq(2).filterTable({label:"Search:", placeholder:"properties and values", minRows:7, quickListClear:"clear"});
			})( jQuery );
			let addedFilterInput = document.querySelector("p.filter-table input");
			if(addedFilterInput)
				addedFilterInput.focus();
		}	
		
		let rightTable = document.querySelectorAll("div#gridBody_right table.gridTable");
		if(rightTable?.length > 1) {
			rightTable = rightTable[1];
			rightTable.querySelectorAll("tr.cellCont").forEach(
				(e) => {
					if(e.querySelector("tr a")) {
						let eTextProp = e.querySelector("tr a").innerText;
						let eTextValue;
						let eValue = e.querySelector("td div.oflowDivM span");
						if(eValue) {
							eTextValue = eValue.innerText.replace(/\n/g, "\\n")
							.replace(/</g, "\\<")
							.replace(/>/g, "\\>")
							.replace(/"/g, "&quot;")
							.replace(/'/g, "\\'");
						}
						
						//FEATURE: copy property name to clipboard
						if(eTextProp)
							e.querySelector("tr a").insertAdjacentHTML('beforebegin', '<a onclick="copyToClipboard(\'.' + eTextProp + '\')"><i class="icons pi pi-copy"></i></a>&nbsp;');
						
						//FEATURE: copy property value to clipboard
						if(eTextValue)
							e.querySelector("td div.oflowDivM span").insertAdjacentHTML('beforebegin', '<a onclick="copyToClipboard(\'' + eTextValue + '\')"><i class="icons pi pi-copy"></i></a>&nbsp;')
						
						//FEATURE: copy property name and value to clipboard
						if(eTextProp && eTextValue) {
							let eText = "." + eTextProp + " = &quot;" + eTextValue + "&quot;";
							e.querySelector("td div.oflowDivM").insertAdjacentHTML('beforeend', '<div style="float:right"><a onclick="copyToClipboard(\'' + eText + '\')"><i class="icons pi pi-copy"></i></a></div>')
						}					
					}
				}
			);
		}
    });
}

function stripeTable(table) {
	jQuery(table).find('tr').removeClass('striped').filter(':visible:even').addClass('striped');
};

function copyToClipboard(textContent) {
	// create hidden text element, if it doesn't already exist
	let targetId = "_hiddenCopyText_";
	let target = document.createElement("textarea");
	target.style.position = "absolute";
	target.style.left = "-9999px";
	target.style.top = "0";
	target.id = targetId;
	document.body.appendChild(target);
	target.textContent = textContent;

	// select the content
	let currentFocus = document.activeElement;
	target.focus();
	target.setSelectionRange(0, target.value.length);

	// copy the selection
	let succeed;
	try {
		succeed = document.execCommand("copy");
	} catch (e) {
		succeed = false;
	}
	// restore original focus
	if (currentFocus && typeof currentFocus.focus === "function") {
		currentFocus.focus();
	}

	target.textContent = "";
	return succeed;
};

if(pega && pega.ui && pega.ui.Doc) {
	let origprocessActionGridDetail_Success = pega.ui.Doc.prototype.processActionGridDetail_Success;
	pega.ui.Doc.prototype.processActionGridDetail_Success = function() {        
    	origprocessActionGridDetail_Success.apply(this, arguments);
    	handleRightPanelChange();
}}