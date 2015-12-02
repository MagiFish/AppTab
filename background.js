/**
 * Created by brendanhaesler on 18/11/15.
 */
chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create("appWorkspace.html", {
        "state": "maximized"
    })
});