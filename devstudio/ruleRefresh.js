console.log("PDT: devstudio/ruleRefresh.js");

//Rule actions > Refresh reloads the rule frame with a URL that does not tell the rule type, so the per-type
//content scripts are not matched by the manifest. Detect the type from the form fields and ask the service
//worker to inject the same scripts. (Flow and the generic rule scripts are matched by the manifest directly.)
const PDT_RULE_TYPE_SCRIPTS = {
	"Rule-Obj-Model": ["devstudio/devstudio_datatransform.js"],
	"Rule-Utility-Function": ["devstudio/devstudio_function.js"],
	"Rule-Edit-Validate": ["devstudio/devstudio_function.js"],
	"Rule-Obj-Report-Definition": ["devstudio/devstudio_report.js"]
};

for (const [ruleType, files] of Object.entries(PDT_RULE_TYPE_SCRIPTS)) {
	if (document.querySelector("[data-ui-meta*=\"'className':'" + ruleType + "'\"]")) {
		chrome.runtime.sendMessage({ purpose: "injectContentScripts", files: files }, (response) => console.log(response));
		break;
	}
}
