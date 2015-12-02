// Closure to actaully open the app tab
var openAppTab = function openAppTab(context) {
	return function(info, tab) {
		var url;

		switch(context) {
			case "page":
				url = info.pageUrl;
				break;
			case "media":
				url = info.srcUrl;
				break;
			case "link":
				url = info.linkUrl;
				break;
			case "frame":
				url = info.frameUrl;
				break;
		}

		chrome.windows.create({"url": url, "type": "popup"})

		if (context === "page") {
			chrome.tabs.remove(tab.id);
		}
	};
};

// Page Url
chrome.contextMenus.create({
	"title": "Open page in AppTab", 
	"contexts": ["page"], 
	"onclick": openAppTab("page")
});

// Source Url
chrome.contextMenus.create({
	"title": "Open source in AppTab",
	"contexts": ["image", "video"],
	"onclick": openAppTab("maedia")
});

// Link Url
chrome.contextMenus.create({
	"title": "Open link in AppTab",
	"contexts": ["link"],
	"onclick": openAppTab("link")
});

// Frame Url
chrome.contextMenus.create({
	"title": "Open frame in AppTab",
	"contexts": ["frame"],
	"onclick": openAppTab("frame")
});


// APP WORKSPACES
// Window ID of the app workspace
var awWindowId = -1;
// Window ID of the last used window that wasn't the app window
var lastWindowId = -1;

chrome.windows.onRemoved.addListener(function(windowId) {
	// if the last focused non-workspace window is closed, go find another one
	if (windowId === lastWindowId) {
		// the last window is gone, set it to -1
		lastWindowId = -1;

		// get all the windows. We only care about normal windows
		chrome.windows.getAll({"windowTypes": ["normal"]}, function(windows) {
			// go through them and find the next one that isn't the app worksapce
			for (var i = 0; i < windows.length && lastWindowId === -1; ++i) {
				if (windows[i].windowId !== awWindowId) {
					// we found one, yay!
					lastWindowId = windows[i].windowId;
				}
			}
		});
	}
});

// keep track of the last used window that wasn't the app workspace, for consistent opening of tabs
chrome.windows.onFocusChanged.addListener(function(windowId) {
	// if this wasn't the app workspace or last used other window, then track it
	if (windowId !== awWindowId && windowId !== lastWindowId) {
		lastWindowId = windowId;
	}
});

chrome.windows.onRemoved.addListener(function(windowId){
	// if the app workspace is removed, set the id to default
	if (windowId === awWindowId) {
		awWindowId = -1;
	}
});

// Redirect navigation from the workspace to the secondary window, or a new window if there is no secondary
chrome.webNavigation.onCreatedNavigationTarget.addListener(function(details){
	// get the window that the navigation occurs in
	chrome.tabs.get(details.sourceTabId, function(details) {
		return function(tab) {
			// if the tab is being opened in the app workspace window
			if (tab.windowId === awWindowId) {
				// if there is another window to send it to
				if (lastWindowId !== -1) {
					chrome.tabs.move(details.tabId, {"windowId": lastWindowId, "index": -1});
				} else {
					// there was no other window to send it to, so make one
					chrome.windows.create({"tabId": tab.id}, function(win) {
						// set this as the last used window
						lastWindowId = win.id;
					});
				}
			}
		}
	}(details));
});

function setAppWorkspaceWindow(window) {
	awWindowId = window.id;
	// because of order stuff, we need to kill the lastWindowId if it's the same
	if (awWindowId === lastWindowId) {
		lastWindowId = -1;
	}
}
// closure for building an app workspace
var openAppWorkspace = function openAppWorkspace(context) {
		return function(info, tab) {
		var url;

		switch(context) {
			case "page":
				url = info.pageUrl;
				break;
			case "media":
				url = info.srcUrl;
				break;
			case "link":
				url = info.linkUrl;
				break;
			case "frame":
				url = info.frameUrl;
				break;
		}

		// check if there is an app workspace in exitence already
		if (awWindowId === -1) {
			console.log("Createing app workspace window");
			chrome.windows.create({"url": url}, setAppWorkspaceWindow);
		} else {
			console.log("Adding window to app workspace");
			chrome.tabs.create({
				"windowId": awWindowId,
				"url": url
			});
		}

		if (context === "page") {
			chrome.tabs.remove(tab.id);
		}
	};
};

// Page Url
chrome.contextMenus.create({
	"title": "Open page in AppWorkspace", 
	"contexts": ["page"], 
	"onclick": openAppWorkspace("page")
});

// Source Url
chrome.contextMenus.create({
	"title": "Open source in AppWorkspace",
	"contexts": ["image", "video"],
	"onclick": openAppWorkspace("maedia")
});

// Link Url
chrome.contextMenus.create({
	"title": "Open link in AppWorkspace",
	"contexts": ["link"],
	"onclick": openAppWorkspace("link")
});

// Frame Url
chrome.contextMenus.create({
	"title": "Open frame in AppWorkspace",
	"contexts": ["frame"],
	"onclick": openAppWorkspace("frame")
});