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