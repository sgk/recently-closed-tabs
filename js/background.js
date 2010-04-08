// Scripts for the background.html

//------------------------------------------------------------------------------
// Global variables
//------------------------------------------------------------------------------
//
var appConfig;
// Map of all opened tabs keyed by tabId
var allOpenedTabs = {};
// Array of recently closed tabs
var recentlyClosedTabs;
// URL blacklist filters
var urlFilterArray;
// maximal table length of RCT's shown in popup
var maxPopupTableLength;

//------------------------------------------------------------------------------
// Main method: Everything starts here!
//------------------------------------------------------------------------------
function main() {
	loadAppConfig();
	// Restore state from localStorage
	restoreState();
	// Process all open tabs
	chrome.tabs.getAllInWindow(null, getAllTabsInWindow)
	// Listener onUpdated
	chrome.tabs.onUpdated.addListener(updatedTabsListener);
	// Listener onRemoved
	chrome.tabs.onRemoved.addListener(removedTabsListener);
    // Listener onSelectionChanged
	chrome.tabs.onSelectionChanged.addListener(selectionChangedTabsListener);
}

//------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------
function loadAppConfig() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
          appConfig = JSON.parse(this.responseText);
        }
    };
    xhr.send();
}

//------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------
function restoreState() {
	var storedVersion = localStorage['version'];
	if (appConfig.version != storedVersion) {
        chrome.tabs.create({'url': chrome.extension.getURL('infonews.html'), 'selected': true}, function(tab) {
          // Tab opened: possible migration procedures
        });
        localStorage.setItem('version', appConfig.version);
    }
    //
    fetchUrlFilterArray();
    //
    fetchMaxPopupTableLength();
    //
    fetchRecentlyClosedTabs();
}

//------------------------------------------------------------------------------
// Fetch/Initialise the urlFilterArray from the localStorage
//------------------------------------------------------------------------------
function fetchUrlFilterArray() {
	var urlFilterString = localStorage['urlFilterArray'];
    if (urlFilterString === undefined) {
    	storeUrlFilterArray(['chrome://newtab/', 'about:blank']);
    } else {
        urlFilterArray = JSON.parse(urlFilterString);
    }
	console.log(urlFilterArray);
}

//------------------------------------------------------------------------------
// Modify/Persist the urlFilterArray to the localStorage
//------------------------------------------------------------------------------
function storeUrlFilterArray(newUrlFilterArray) {
  if (newUrlFilterArray !== undefined) urlFilterArray = newUrlFilterArray;
  localStorage.setItem('urlFilterArray', JSON.stringify(urlFilterArray));
}

//------------------------------------------------------------------------------
//Fetch/Initialise the urlFilterArray from the localStorage
//------------------------------------------------------------------------------
function fetchMaxPopupTableLength() {
	maxPopupTableLength = localStorage['maxPopupTableLength'];
	if (maxPopupTableLength === undefined) storeMaxPopupTableLength(15);
	console.log(maxPopupTableLength);
}

//------------------------------------------------------------------------------
// Modify/Persist the maxPopupTableLength to the localStorage
//------------------------------------------------------------------------------
function storeMaxPopupTableLength(newMaxLength) {
    maxPopupTableLength = newMaxLength;
    localStorage.setItem('maxPopupTableLength', maxPopupTableLength);
}

//------------------------------------------------------------------------------
// Fetch/Initialise the recentlyClosedTabs from the localStorage
//------------------------------------------------------------------------------
function fetchRecentlyClosedTabs() {
	var recentlyClosedTabsString = localStorage['recentlyClosedTabs'];
    if (recentlyClosedTabsString === undefined) {
        storeRecentlyClosedTabs([]);
    } else {
        recentlyClosedTabs = JSON.parse(recentlyClosedTabsString);
        for (var i in recentlyClosedTabs)
          if (recentlyClosedTabs[i] == null || recentlyClosedTabs[i].tabId == undefined)
            recentlyClosedTabs.splice(i, 1);
    }
	console.log(recentlyClosedTabs);
}

//------------------------------------------------------------------------------
// Modify/Persist the recentlyClosedTabs to the localStorage
//------------------------------------------------------------------------------
function storeRecentlyClosedTabs(newRecentlyClosedTabs) {
	if (newRecentlyClosedTabs !== undefined) recentlyClosedTabs = newRecentlyClosedTabs;
    localStorage.setItem('recentlyClosedTabs', JSON.stringify(recentlyClosedTabs));
}

//------------------------------------------------------------------------------
// Function defining the tabInfo-object.
//------------------------------------------------------------------------------
function tabInfo(tabId, windowId, faviconUrl, dateOfUpdate, title, url, tabShot) {
	this.tabId = tabId;
	this.windowId = windowId;
	this.faviconUrl = faviconUrl;
	this.dateOfUpdate = dateOfUpdate;
	this.title = title;
	this.url = url;
	this.tabShot = tabShot;
}

//------------------------------------------------------------------------------
//Listen to SelectionChanged event and update a preview image
//------------------------------------------------------------------------------
function selectionChangedTabsListener(tabId, selectInfo) {
    console.log("selectionChangedTabsListener: " + selectInfo);
    setImgDataUrl(tabId);
}

var orgImage = new Image();
var canvas = document.createElement("canvas");

//------------------------------------------------------------------------------
// Puts the dataUrl of the tab specified by the given tabId into the object allOpenedTabs.
//------------------------------------------------------------------------------
function setImgDataUrl(tabId) {
    if (allOpenedTabs[tabId] !== undefined)
	chrome.tabs.captureVisibleTab(allOpenedTabs[tabId].windowId, function(snapshotData) {
		console.log("receiving snapshot data for tabId = " + tabId);
	    orgImage.onload = function() {
	    	console.log("orgImage size = " + orgImage.width + "x" + orgImage.height);
	    	var newHeight = 110;
	    	var newWidth = orgImage.width * newHeight / orgImage.height;
	        // Create a canvas with the desired dimensions
	        canvas.width = newWidth + 10;
	        canvas.height = newHeight + 10;
	        var context = canvas.getContext("2d");

	        // Scale and draw the source image to the canvas
	        context.drawImage(orgImage, 5, 5, newWidth, newHeight);

	        // Convert the canvas to a data URL in PNG format
			allOpenedTabs[tabId].tabShot = canvas.toDataURL();

			// Check the result
			var chkImage = new Image();
			chkImage.onload = function() { console.log("chkImage size = " + chkImage.width + "x" + chkImage.height); }
			chkImage.src = allOpenedTabs[tabId].tabShot;
	    }
	    orgImage.src = snapshotData;
	})
}

function scalingWithCanvas(snapshotData) {
		console.log("receiving snapshot data for tabId = " + tabId);
	    orgImage.onload = function() {
	    	console.log("orgImage size = " + orgImage.width + "x" + orgImage.height);
	    	var newHeight = 110;
	    	var newWidth = orgImage.width * newHeight / orgImage.height;
	        // Create a canvas with the desired dimensions
	        canvas.width = newWidth + 10;
	        canvas.height = newHeight + 10;
	        var context = canvas.getContext("2d");

	        // Scale and draw the source image to the canvas
	        context.drawImage(orgImage, 5, 5, newWidth, newHeight);

	        // Convert the canvas to a data URL in PNG format
			allOpenedTabs[tabId].tabShot = canvas.toDataURL();

			// Check the result
			var chkImage = new Image();
			chkImage.onload = function() { console.log("chkImage size = " + chkImage.width + "x" + chkImage.height); }
			chkImage.src = allOpenedTabs[tabId].tabShot;
	    }
	    orgImage.src = snapshotData;
	}

function scalingWithCanvas2(snapshotData) {
		console.log("receiving snapshot data for tabId = " + tabId);
		var orgImage = new Image();
	    orgImage.onload = function() {
	    	console.log("orgImage size = " + orgImage.width + "x" + orgImage.height);
	    	var newHeight = 110;
	    	var newWidth = orgImage.width * newHeight / orgImage.height;
	        // Create a canvas with the desired dimensions
	        var canvas = document.createElement("canvas");
	        canvas.width = newWidth + 10;
	        canvas.height = newHeight + 10;
	        var context = canvas.getContext("2d");

	        // Scale and draw the source image to the canvas
	        context.drawImage(orgImage, 5, 5, newWidth, newHeight);

	        // Convert the canvas to a data URL in PNG format
			allOpenedTabs[tabId].tabShot = canvas.toDataURL();

			// Check the result
			var chkImage = new Image();
			chkImage.onload = function() { console.log("chkImage size = " + chkImage.width + "x" + chkImage.height); }
			chkImage.src = allOpenedTabs[tabId].tabShot;
	    }
	    orgImage.src = snapshotData;
	}

//------------------------------------------------------------------------------
// Send all tabs to be processed
//------------------------------------------------------------------------------
function getAllTabsInWindow(tabs) {
	for (var key in tabs) processOpenedTab(tabs[key]);
}

//------------------------------------------------------------------------------
// After every tab update process the new data
//------------------------------------------------------------------------------
function updatedTabsListener(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete") processOpenedTab(tab);
}

//------------------------------------------------------------------------------
// Process opened tab by inserting a corresponding tabInfo into allOpenedTabs
//------------------------------------------------------------------------------
function processOpenedTab(tab) {
	if (tab === undefined) return;
	var tabUrl = tab.url;
	if (shouldBeIgnored(tabUrl)) return;
	var tabId = tab.id;
	var windowId = tab.windowId;
	var tabFavIconUrl = tab.favIconUrl;
	var tabTitle = tab.title;
	var tabShot = null;
	allOpenedTabs[tabId] = new tabInfo(tabId, windowId, tabFavIconUrl, new Date(), tabTitle, tabUrl, null);
	if(tab.selected) setImgDataUrl(tabId);
    console.log(allOpenedTabs[tabId]);
    removeClosedTabWithThisUrl(tabUrl);
    storeRecentlyClosedTabs();
}

//------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------
function shouldBeIgnored(tabUrl) {
	if (tabUrl === undefined) return true;
	for (key in urlFilterArray) if (tabUrl == urlFilterArray[key]) return true;
	return false;
}

//------------------------------------------------------------------------------
// Remove previous occurance of the same URL
//------------------------------------------------------------------------------
function getClosedTabById(tabId) {
    for (i in recentlyClosedTabs)
      if (recentlyClosedTabs[i].tabId == tabId)  return recentlyClosedTabs[i];
}

//------------------------------------------------------------------------------
// Remove previous occurance of the same URL
//------------------------------------------------------------------------------
function removeClosedTabWithThisUrl(tabUrl) {
    for (i in recentlyClosedTabs)
      if (recentlyClosedTabs[i].url == tabUrl)  recentlyClosedTabs.splice(i, 1);
}

//------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------
function processClosedTab(tabInfo) {
    if (tabInfo === undefined) return;
    delete allOpenedTabs[tabInfo.tabId];
    removeClosedTabWithThisUrl(tabInfo.url)
    // Add at the begining a new instance with a current timestamp
    tabInfo.timestamp = new Date();
    recentlyClosedTabs.unshift(tabInfo);
    storeRecentlyClosedTabs();
    console.log(recentlyClosedTabs);
}


//------------------------------------------------------------------------------
// Puts the ctabInfo of the currently closed tab into the object recentlyClosedTabs.
// Result: object with all recently closed tabs.
//------------------------------------------------------------------------------
function removedTabsListener(tabId) {
	var closedTabInfo = allOpenedTabs[tabId];
	processClosedTab(closedTabInfo);
}

//------------------------------------------------------------------------------
// Open selected RecentlyClosedTab
//------------------------------------------------------------------------------
function openRecentlyClosedTab(tabId) {
  for (index in recentlyClosedTabs) {
    if (recentlyClosedTabs[index].tabId == tabId) {
      chrome.tabs.create({url: recentlyClosedTabs[index].url});
      recentlyClosedTabs.splice(index, 1);

      //should remove this table row
      // TODO: how to find the parent node without assuming that its id is 'table'
      //document.getElementById('table').removeChild(document.getElementById(tabId));
    }
  }
}