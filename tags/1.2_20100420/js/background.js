// Scripts for the background.html

//------------------------------------------------------------------------------
// Global variables
//------------------------------------------------------------------------------
// Map of all opened tabs keyed by tabId
var allOpenedTabs = {};
// Map of recently closed tabs keyed by closing timestamp
var recentlyClosedTabs;
// Array of URL blacklist filters
var filters;
// maximal number of elements (rcts) shown on popup page
var maxPopupLength;
// true if tabShots should be shown/saved
var showTabShot;

// ------------------------------------------------------------------------------
// Main method: Everything starts here!
// ------------------------------------------------------------------------------
function main() {
	// initilise the appConfig
	loadAppConfig();
	// Restore state from localStorage
	restoreState();
	// Process all open tabs
	chrome.tabs.getAllInWindow(null, getAllTabsInWindow);
	// Listener onUpdated
	chrome.tabs.onUpdated.addListener(updatedTabsListener);
	// Listener onRemoved
	chrome.tabs.onRemoved.addListener(removedTabsListener);
	// Listener onSelectionChanged
	chrome.tabs.onSelectionChanged.addListener(selectionChangedTabsListener);
}

// Restores the state of the extension.
function restoreState() {
	// Fetches the filters.
	fetchFilters();
	// Fetches the maxPopupLength.
	fetchMaxPopupLength();
	// Fetches the showTabShot.
	fetchShowTabShot();
	// Fetches the recentlyClosedTabs.
	fetchRecentlyClosedTabs();
}

// ------------------------------------------------------------------------------
// Function defining the tabInfo object.
// ------------------------------------------------------------------------------
function tabInfo(tabId, windowId, favIconUrl, title, url) {
	this.tabId = tabId;
	this.windowId = windowId;
	this.favIconUrl = favIconUrl;
	this.title = title;
	this.url = url;
	this.tabShot;
}

// ------------------------------------------------------------------------------
// FILTERS
// ------------------------------------------------------------------------------
// Function defining the filter-object.
// @param url url to filter
function filter(url) {
	this.url = url;
}

// Adds url to the filters.
// @param url url to be added
function addUrlToFilters(url) {
	var timestamp = (new Date()).getTime();
	filters[timestamp] = new filter(url);
	storeFilters();
}

// Checks if given url is already in the filters.
// @param url url to be checked if already in the filters then false, if not true.
function isFilterUnique(url) {
  for (var timestamp in filters) {
    if (filters[timestamp].url == url) return false;
  }
  return true;
}

// Adds url to the filters if url is unique.
// @ param url url to be added
function addUrlToFiltersAndCheck(url) {
  if (isFilterUnique(url)) {
    addUrlToFilters(url);
  } else {
    alert('"' + url + '" not added to the filters. The url is already in the filters.');
  }
}

// Removes a filter by index.
// @param i index of element to be removed from the filters
function removeFilterByTimestamp(timestamp) {
	delete filters[timestamp];
	storeFilters();
}

// Removes a filter by url.
// @param url url of element to be removed from the filters
function removeFilterByUrl(url) {
	for (var timestamp in filters)
		if (filters[timestamp].url == url)
			removeFilterByTimestamp(timestamp);
}

// Returns true if the filters contain the given url else false.
// @param url url to check if it is in the filters object
function shouldBeIgnored(url) {
	if (url === undefined)
		return true;
	for (key in filters)
		if (url == filters[key].url)
			return true;
	return false;
}

// ------------------------------------------------------------------------------
// OPENED TABS
// ------------------------------------------------------------------------------
// Sends all opened tabs to be processed.
// @param tabs all opened tabs to be processed
function getAllTabsInWindow(tabs) {
	for ( var key in tabs)
		processOpenedTab(tabs[key]);
}

// Listens to onUpdate event and processes the new data after every tab update.
// @param tabId id of the tab to be updated
// @param changeInfo changeInfo of the tab to be updated
// @param tab tab to be updated
function updatedTabsListener(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete")
		processOpenedTab(tab);
}

// Listens to SelectionChanged event and updates a preview image for an opened
// tab.
// @param tabId id of the tab to update the image for
function selectionChangedTabsListener(tabId) {
  if (showTabShot == 'true') {
    setImgDataUrl(tabId);
  }
}

// Processes tab by inserting a corresponding tabInfo into allOpenedTabs
// and removes rct of tab with the same url that is already opened.
// @param tab tab to be processed
function processOpenedTab(tab) {
	if (tab === undefined)
		return;
	var tabUrl = tab.url;
	if (shouldBeIgnored(tabUrl))
		return;
	var tabId = tab.id;
	allOpenedTabs[tabId] = new tabInfo(tabId, tab.windowId, tab.favIconUrl,
			tab.title, tabUrl);
	if (tab.selected)
		setImgDataUrl(tabId);
	// removes rct if already opened
	removeRecentlyClosedTabByUrl(tabUrl);
}

// Removes an opened tab by tabId.
// @param tabId id of the tab to be removed from the allOpenedTabs
function removeOpenedTabByTabId(tabId) {
	delete allOpenedTabs[tabId];
}

var orgImage = new Image();
var canvas = document.createElement('canvas');
// Puts the dataUrl of the tab specified by the given tabId into the object
// allOpenedTabs.
// @param tabId id of the tab to set the image for
function setImgDataUrl(tabId) {
	if (allOpenedTabs[tabId] !== undefined)
		chrome.tabs.captureVisibleTab(
				allOpenedTabs[tabId].windowId,
				function(snapshotData) {
					// console.log("receiving snapshot data for tabId = " +
					// tabId);
					orgImage.onload = function() {
						// console.log("orgImage size = " + orgImage.width + "x"
						// + orgImage.height);
						var newHeight = 110;
						var newWidth = orgImage.width * newHeight
								/ orgImage.height;
						// Create a canvas with the desired dimensions
						canvas.width = newWidth + 10;
						canvas.height = newHeight + 10;
						var context = canvas.getContext("2d");

						// Scale and draw the source image to the canvas
						context.drawImage(orgImage, 5, 5, newWidth, newHeight);

						// Convert the canvas to a data URL in PNG format
						allOpenedTabs[tabId].tabShot = canvas.toDataURL();

						// Check the result
						// var chkImage = new Image();
						// chkImage.onload = function() {
						// console.log("chkImage size = " + chkImage.width + "x" + chkImage.height); }
						// chkImage.src = allOpenedTabs[tabId].tabShot;
					}
					orgImage.src = snapshotData;
				})
}

// ------------------------------------------------------------------------------
// RECENTLY CLOSED TABS
// ------------------------------------------------------------------------------
// Sends the closed tab to be processed.
// @param tabId id of the tab to be processed
function removedTabsListener(tabId) {
	processClosedTab(allOpenedTabs[tabId]);
}

// Processes tabInfo by removing the corresponding tab from the allOpenedTabs
// array,
// by removing the possible corresponding rct by url from the recentlyClosedTabs
// array and adds the tabInfo object to the recentlyClosedTabs.
// @param tabInfo tabInfo to process
function processClosedTab(tabInfo) {
	if (tabInfo === undefined) return;
	removeOpenedTabByTabId(tabInfo.tabId);
	removeRecentlyClosedTabByUrl(tabInfo.url)
	addClosedTab(tabInfo);
}

// Adds new closedTab to recentlyClosedTabs and saves it.
// @param tabInfo
function addClosedTab(tabInfo) {
	var timestamp = (new Date()).getTime();
	recentlyClosedTabs[timestamp] = tabInfo;
	storeRecentlyClosedTabs();
}

// Opens selected recentlyClosedTab.
// @param i index of recentlyClosedTab array to open
function openRecentlyClosedTab(i) {
	chrome.tabs.create({url : recentlyClosedTabs[i].url});
}

// Removes a rct by url.
// @param url url of the element to be removed from the recentlyClosedTabs
function removeRecentlyClosedTabByUrl(url) {
	for (var timestamp in recentlyClosedTabs)
		if (recentlyClosedTabs[timestamp].url == url)
			removeRecentlyClosedTabByTimestamp(timestamp);
}

// Removes a rct by index.
// @param i index of the element to be removed from the recentlyClosedTabs
function removeRecentlyClosedTabByTimestamp(timestamp) {
	delete recentlyClosedTabs[timestamp];
	storeRecentlyClosedTabs();
}

// Fetches/Initialises the filters from the localStorage.
function fetchFilters() {
	var filterString = localStorage['filters'];
	if (filterString === undefined) {
    filters = {};
	  filters[0] = new filter('chrome://newtab/');
	  filters[1] = new filter('about:blank');
		storeFilters();
	} else {
		filters = JSON.parse(filterString);
		for (var i in filters)
			if (filters[i] == null || filters[i] === undefined)
				filters.splice(i, 1);
	}
}

// Modifys/Persists the filters to the localStorage
// @param newFilters filters object to store in the localStorage
function storeFilters(newFilters) {
	if (newFilters !== undefined)
		filters = newFilters;
	localStorage.setItem('filters', JSON.stringify(filters));
}

// ------------------------------------------------------------------------------
// MAX POPUP LENGTH
// ------------------------------------------------------------------------------
// Fetches/Initialises the maxPopupLength from the localStorage.
function fetchMaxPopupLength() {
	maxPopupLength = localStorage['maxPopupLength'];
	if (maxPopupLength === undefined)
		storeMaxPopupLength(15);
}

// Modifys/Persists the maxPopupLength to the localStorage.
// @param newMaxPopupLength maxPopupLength to store in the localStorage
function storeMaxPopupLength(newMaxPopupLength) {
	maxPopupLength = newMaxPopupLength;
	localStorage.setItem('maxPopupLength', maxPopupLength);
}

// ------------------------------------------------------------------------------
// SHOW TAB SHOT
// ------------------------------------------------------------------------------
// Fetches/Initialises the showTabShot from the localStorage.
function fetchShowTabShot() {
  showTabShot = localStorage['showTabShot'];
  if (showTabShot === undefined)
    storeShowTabShot('false');
}

// Modifys/Persists the showTabShot to the localStorage.
// @param newShowTabShot showTabShot to store in the localStorage
function storeShowTabShot(newShowTabShot) {
  showTabShot = newShowTabShot;
  localStorage.setItem('showTabShot', showTabShot);
}

// Fetches/Initialises the recentlyClosedTabs from the localStorage.
function fetchRecentlyClosedTabs() {
	var recentlyClosedTabsString = localStorage['recentlyClosedTabs'];
	if (recentlyClosedTabsString === undefined) {
		storeRecentlyClosedTabs({});
	} else {
		recentlyClosedTabs = JSON.parse(recentlyClosedTabsString);
	}
	//console.log(recentlyClosedTabs);
}

// Modifys/Persists the recentlyClosedTabs to the localStorage.
// @param newRecentlyClosedTabs recentlyClosedTabs object to store in the
// localStorage
function storeRecentlyClosedTabs(newRecentlyClosedTabs) {
	if (newRecentlyClosedTabs !== undefined)
		recentlyClosedTabs = newRecentlyClosedTabs;
	localStorage.setItem('recentlyClosedTabs', JSON
			.stringify(recentlyClosedTabs));
}

// Checks if the given object is empty.
// @param obj object to be checked
function isEmpty(obj){
  for(var i in obj){ 
    if(obj.hasOwnProperty(i)){return false;}
  }
  return true;
}

// Shows prompt with title and url to edit.
// @param title title of prompt
// @param url   url to be shown for edit purposes
// @return edited url
function showPrompt(title, url) {
  return prompt(title, url);
}

// Shows confirmation with text.
// @return true if ok is pressed, else false
function showConfirm(text) {
  return confirm(text);
}