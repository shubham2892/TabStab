
tabs = [];

function log() {
  console.log.apply(console, Array.prototype.slice.call(arguments));
}


function getTabList(){
  return tabs;
}

function setTabsList(tabArray){
  tabs = tabArray;
}




function switchToNextTab(){
  tabList = getTabList();
  switchTabs(tabList[1].id);
}

function indexOfTab(tabId){
  tabList = getTabList();
  for (var j =0; j<tabList.length; j++){
    if (tabList[j].id === tabId){
      return j;
    }
  }
  return -1;
}

function switchTabs(tabId){
  var index = indexOfTab(parseInt(tabId,10));
  var windowId = getTabList()[index].windowId;
  chrome.windows.update(windowId, {focused:true}, function () {
      chrome.tabs.update(parseInt(tabId,10), {active:true});
  });
}


function recordTabsRemoved(tabId){
   tabList = getTabList();
   tabList.splice(indexOfTab(tabId),1);
}

function recordTabsAdded(tab){
  getTabList().push(tab);
}

function recordTabsUpdated(tabId){
  var idx = indexOfTab(tabId);
  tabList = getTabList();
  var tab = tabList[idx];
  tabList.splice(idx,1);
  tabList.unshift(tab);

}

function init(){
  // reset the tabs list
  tabs = [];

  // count and record all the open tabs for all the windows
  chrome.windows.getAll({populate:true}, function (windows) {

    for(var i = 0; i < windows.length; i++) {
      var t = windows[i].tabs;

      for(var j = 0; j < t.length; j++) {
        recordTabsAdded(t[j]);
      }

    }

    // set the current tab as the first item in the tab list
    // chrome.tabs.query({currentWindow:true, active:true}, function(tabArray) {
    //   log('initial selected tab', tabArray);
      // recordTabsUpdated(tabArray[0].id);
    // });
  });


  // attach an event handler to capture tabs as they are closed
  chrome.tabs.onRemoved.addListener(function(tabId) {
    recordTabsRemoved(tabId);
  });

  // attach an event handler to capture tabs as they are opened
  chrome.tabs.onCreated.addListener(function (tab) {
    recordTabsAdded(tab);
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    tabs[indexOfTab(tabId)] = tab;
  });

  chrome.tabs.onActivated.addListener(function (info) {
    recordTabsUpdated(info.tabId);
  });

//   chrome.windows.onFocusChanged.addListener(function(windowId) {
//     if (windowId != chrome.windows.WINDOW_ID_NONE) {
//       chrome.tabs.query({windowId:windowId, active:true}, function (tabArray) {
// //        log('onFocusChanged tab', tabArray);
//         updateTabsOrder(tabArray);
//       });
//     }
//   });

  chrome.commands.onCommand.addListener(function(command) {
    //log('Command:', command);

    if (command === "quick-next-tab") {
      switchToNextTab();
    }


  });

}

init();
