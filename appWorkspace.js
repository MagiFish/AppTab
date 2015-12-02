/**
 * Created by brendanhaesler on 18/11/15.
 */
var tabId = 0;
var tabIdName = "tab";
var appIdName = "app";
var activeClassName = "active";

window.addEventListener("load", function() {
    // initialise the tabs
    resizeTabs();

    // attach a listener to the new tab button
    document.getElementById("new_tab").addEventListener("click", function() {
        openTab();
    });
});

window.addEventListener("resize", resizeTabs);

function resizeTabs() {
    var tabs = document.querySelectorAll("." + tabIdName);
    var windowWidth = window.innerWidth;
    var newTabWidth = document.getElementById("new_tab").offsetWidth;
    var availableSpace = windowWidth - newTabWidth;
    var tabWidth = availableSpace / tabs.length;

    for (var i = 0; i < tabs.length; ++i) {
        tabs[i].style.width = tabWidth + "px";
    }
}

function openTab() {
    // remove the active class from the active tab
    removeActive();

    // add a tab to the top
    var tabs = document.getElementById("tabs");
    var tab = document.createElement("div");
    tabs.appendChild(tab);

    // configure the tab
    tab.setAttribute("id", tabIdName + "_" + tabId);
    tab.className = tabIdName + " " + activeClassName;
    tab.addEventListener("click", function() { makeActive(tab); });

    // add a webview to the content area
    var contentArea = document.getElementById("content");
    var webview = document.createElement("webview");
    contentArea.appendChild(webview);

    // configure the webview
    webview.setAttribute("id", appIdName + "_" + tabId);
    webview.className = appIdName + " " + activeClassName;
    webview.setAttribute("src", "https://www.google.com");

    // handle navigation in the webview
    webview.request.onBeforeRequest.addListener(webviewBeforeRequestHandler(webview), { urls: ["<all_urls>"] }, ["blocking"]);

    // increment the tab count
    ++tabId;

    // fix the spacing of tabs
    resizeTabs();
}

function makeActive(tab) {
    // if the tab is already active, do nothing
    if (tab.className.indexOf(activeClassName) !== -1) {
        return;
    }

    // remove the current active tab
    removeActive();

    // set this tab as active
    tab.className += " " + activeClassName;

    // set this tab's corresponding webview as active
    var tid = parseInt(tab.id.substring(tab.id.indexOf("_") + 1));
    var webview = document.getElementById(appIdName + "_" + tid);
    webview.className += " " + activeClassName;
}

function removeActive() {
    var activeList = document.querySelectorAll("." + activeClassName);

    if (activeList !== undefined) {
        var regex = new RegExp("(?:^|\\s)" + activeClassName + "(?!\\S)", "g")
        for (var i = 0; i < activeList.length; ++i) {
            activeList[i].className = activeList[i].className.replace(regex, "");
        }
    }
}

function webviewBeforeRequestHandler(webview) {
    return function(details) {
        var domainRE = new RegExp("^(?:https?:\\/\\/)?(?:[^@\\n]+@)?(?:www\\.)?([^:\\/\\n]+)", "im");
        var currentDomain = domainRE.exec(webview.getAttribute("src"));
        var requestDomain = domainRE.exec(details.url);

        // if the domain of the request is different to the domain of the app
        if (requestDomain !== currentDomain) {
            window.open(details.url);
            return { "cancel": "javascript" };
        }
    }
}