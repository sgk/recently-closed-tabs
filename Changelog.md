**03/05/2010 - 1.2.6:**
  * Replaced the divs showing the urls for the popup rct elements with real tooltips.
  * Fixed showTabShot bug.

**03/05/2010 - 1.2.5:**
  * Introduced the Google Analytics.

**04/2010 - 1.2.4:**
  * Fixed date on options page.

**04/2010 - 1.2.3:**
  * Added limit for recently closed tabs to 100. In a future release that you can define this number in the options.
  * Added popup to show a detailed date on the options date.
  * Removed select box and added range selector for defining the number of shown recently closed tabs element on the popup page.
  * Added popup to show the url on the popup page.

**20/04/2010 - 1.2:**
  * Reimplemented DOM manipulation with jquery library
  * Infos page adjusted for layout purposes.
  * Options page adjusted for layout purposes. A lot of infos about the recently closed tabs are placed here.
  * Popup page adjusted for layout purposes.
  * Added filters to the options page. Now you can add urls to the filters to exclude them from adding to the recently closed tabs list. You also have the possibility to edit the filters.
  * Added option to show or not to show the screenshots for the recently closed tabs. Think of that if you switch the screenshots on the extension will consume more memory.
  * Added &lt;meta http-equiv="Content-type" content="text/html; charset=utf-8" /&gt; so that Draškos name is written properly ;-)

**28/03/2010 - 1.1.1.1:**
  * some annoying bugs fixed ;-)
  * basic info news page on every version change, should be optimised to get triggered on major and minor version change
  * localStorage use and optimised snapshot images (resized via canvas)
  * introduced maxTabs parameter to control the length of the popup list

**15/03/2010 - 1.0.1:**
  * BUGFIX: the number of recently closed tabs shown in the popup is now initially configured to 15

**14/03/2010 - 1.0:**
  * added options page
  * the complete list of entries is schown on the options page
  * on the options page you can customize the number of shown recently closed tabs of the popup

**11/03/2010 - 0.91:**
  * optimized the performance
  * the generation of the preview images is more stable
  * new tabs and blank pages are filtered from the recently closed tabs list

**10/03/2010 - 0.9:**
  * handle the event if you reopen a tab and close it while it is not completely loaded
  * added preview image of the recently closed tabs right in front of the link

**09/03/2010 - 0.81:**
  * setup a google code SVN repository
  * push the extension to the extension gallery site

**08/03/2010:**
  * showing the recently closed tabs in the right order (last closed tab should be the first entry in the list shown in popup.html)
  * css tweaking
  * nicer icon

**05/03/2010 - 0.1:**
  * favicons added to the list shown in popup.html.
  * remove tab entry from the lastClosedTabsArray after it is being re-opened
  * title for onmoveover the extension icon set to "Recently Closed Tabs"
  * added css

**See the changes on our Infospage of the extension, too:**<a href='http://code.google.com/p/recently-closed-tabs/source/browse/trunk/infonews.html'>Infonews</a>