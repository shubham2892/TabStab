
var myTabs = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init() {
      var tabList = [];
      return {
        getGlobalTabList: function() {
          return tabList;
        }
      };
  };

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {

      if ( !instance ) {
        instance = init();
      }

      return instance;
    }
  };
})();


function log() {
  console.log.apply(console, Array.prototype.slice.call(arguments));
}


function getTabList(){
  return myTabs.getInstance().getGlobalTabList();
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
  var idx = indexOfTab(tabId);
  if (idx >= 0){
    tabList.splice(idx,1);
  }
}

function recordTabsAdded(tab){
  getTabList().push(tab);
}

function recordTabsUpdated(tabId){
  var idx = indexOfTab(tabId);
  tabList = getTabList();
  console.log(idx);
  if (idx >= 0){
    var tabs = tabList.splice(idx,1);
    console.log(tabs);
    tabList.unshift(tabs[0]);
  }
}

function init(){

  // count and record all the open tabs for all the windows
  chrome.windows.getAll({populate:true}, function (windows) {

    for(var i = 0; i < windows.length; i++) {
      var t = windows[i].tabs;
      console.log("new window");
      for(var j = 0; j < t.length; j++) {
        console.log("new tab");
        recordTabsAdded(t[j]);
      }

    }

    // set the current tab as the first item in the tab list
    chrome.tabs.query({currentWindow:true, active:true}, function(tabArray) {
      // log('initial selected tab', tabArray);
      recordTabsUpdated(tabArray[0].id);
    });
  });


  // attach an event handler to capture tabs as they are closed
  chrome.tabs.onRemoved.addListener(function(tabId) {
    console.log("------------------------------------------------------");
    console.log("TabId Removed:");
    console.log(tabId);
    recordTabsRemoved(tabId);
    console.log(getTabList());
    console.log("------------------------------------------------------");

  });

  // attach an event handler to capture tabs as they are opened
  chrome.tabs.onCreated.addListener(function (tab) {
    if (tab.id !== chrome.tabs.TAB_ID_NONE ){
      console.log("------------------------------------------------------");
      console.log("TabId created:");
      console.log(tab.id);
      recordTabsAdded(tab);
      console.log(getTabList());
      console.log("------------------------------------------------------");
    }

  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined){
      console.log("------------------------------------------------------");
      console.log("TabId Updated:");
      console.log(tabId);
      var tabList = getTabList();
      var idx = indexOfTab(tabId);
      if (idx >= 0){
        tabList[idx] = tab;
      }
      console.log(getTabList());
      console.log("------------------------------------------------------");
    }
  });

  chrome.tabs.onActivated.addListener(function (info) {
    console.log("------------------------------------------------------");
    console.log("TabId Activated:");
    console.log(info.tabId);
    recordTabsUpdated(info.tabId);
    console.log(getTabList());
    console.log("------------------------------------------------------");

  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId != chrome.windows.WINDOW_ID_NONE) {
      chrome.tabs.query({windowId:windowId, active:true}, function (tabArray) {
        if (tabArray.length === 1){
          console.log("------------------------------------------------------");
          console.log("TabId Activated(Window Changed):");
          console.log(tabArray[0].id);
          recordTabsUpdated(tabArray[0].id);
          console.log(getTabList());
          console.log("------------------------------------------------------");
        }

      });
    }
  });

  chrome.commands.onCommand.addListener(function(command) {
    //log('Command:', command);

    if (command === "quick-next-tab") {
      switchToNextTab();
    }


  });

}

init();
