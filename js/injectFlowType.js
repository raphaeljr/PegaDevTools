if(typeof flowTypeCategory !== 'undefined' && flowTypeCategory !== null) {
    let flowType = flowTypeCategory;
    if(flowType.includes("Standard"))
        flowType = "Standard";
    document.querySelector("div.gfw-breadcrumbs ul li").insertAdjacentHTML("beforeend", "<span style='font-family: OpenSans, sans-serif; font-size: small;'>type: " + flowType + "</span> ");
}

if(document.querySelector("div.gfw-breadcrumbs ul li")) {
    document.querySelector("div.gfw-breadcrumbs ul li").insertAdjacentHTML("beforeend", " <a style='font-family: OpenSans, sans-serif; font-size: small; cursor: pointer;' id='PDTShowNodeIDs'>Show node IDs</a> ");

    //toggles between node names and node IDs; the original label markup is kept on the node to be able to restore it
    let showingNodeIDs = false;
    let toggleLink = document.querySelector("a#PDTShowNodeIDs");
    toggleLink.addEventListener("click", () => {
        showingNodeIDs = !showingNodeIDs;
        document.querySelectorAll("div#processFlow_g svg g g[id].typeAssignment, div#processFlow_g svg g g[id].typeUtility, div#processFlow_g svg g g[id].typeFork, div#processFlow_g svg g g[id].typeSubflow").
            forEach((e)=> {
                    let tspan = e.querySelector("tspan");
                    if (!tspan) return;
                    let label = tspan.parentNode;
                    if (showingNodeIDs) {
                        if (e.dataset.pdtOriginalLabel === undefined)
                            e.dataset.pdtOriginalLabel = label.innerHTML;
                        tspan.innerHTML = e.getAttribute('id');
                        e.querySelectorAll("tspan:nth-of-type(n+2)").forEach(e2 => e2.remove());
                    } else if (e.dataset.pdtOriginalLabel !== undefined) {
                        label.innerHTML = e.dataset.pdtOriginalLabel;
                        delete e.dataset.pdtOriginalLabel;
                    }
            });
        toggleLink.textContent = showingNodeIDs ? "Show node names" : "Show node IDs";
    })
}

