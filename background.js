
tabs = [];


function getTabList(){
  return tabs;
}

function setTabsList(tabArray){
  tabs = tabArray;
}

function indexOfTab(tabId){
  return getTabList().indexOf(tabId);
}

function recordTabsRemoved(tabId){
   tabList = getTabList();
   tabList.splice(indexOfTab(tabId),1);
}

function recordTabsAdded(tabId){
  getTabList().append(tabId);
}

function recordTabsUpdated(tabId){
  tabList = getTabList();
  tabList.splice(indexOfTab(tabId),1);
  tabList.unshift(tabId);

}

function updatePopupHtml(){
  tabList = getTabList();
  var content_list_container = document.getElementById("tab_container");
  if (tabList){
    tabList.forEach(function(tab){
      var tab_element_div = document.createElement('div');
      tab_element_div.className = "item tab open" + tab_element_div.urlStyle;
      var tab_element_div_image = document.createElement('div');
      tab_element_div_image.className = tab.tabImageStyle;
      var image = document.createElement('img');
      image.width = "16";
      image.height = "16";
      image.src = tab.templateTabImage;
      tab_element_div_image.appendChild(image);
      tab_element_div.appendChild(tab_element_div_image);
      content_list_container.appendChild(tab_element_div);
    })
  }
}

function init(){
  // reset the tabs list
  tabs = [];

  // attach an event handler to capture tabs as they are closed
  chrome.tabs.onRemoved.addListener(function(tabId) {
    recordTabsRemoved(tabId);
  });

  // attach an event handler to capture tabs as they are opened
  chrome.tabs.onCreated.addListener(function (tab) {
    recordTabsAdded(tab.id);
  });

  // chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  //   tabs[indexOfTab(tabId)] = tab;
  // });

  chrome.tabs.onActivated.addListener(function (info) {
    // log('onActivated tab', info.tabId);
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

  // chrome.commands.onCommand.addListener(function(command) {
  //   //log('Command:', command);
  //
  //   if (popupMessagePort) {
  //     if (command === "quick-prev-tab") {
  //       popupMessagePort.postMessage({move: "prev"});
  //     } else if (command === "quick-next-tab") {
  //       popupMessagePort.postMessage({move: "next"});
  //     }
  //   } else {
  //     chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
  //       if (tabArray.length > 0) {
  //         // find the index of the current focused tab
  //         var ctIdx = indexOfTab(tabArray[0].id);
  //
  //         if (command === "quick-prev-tab" && tabs.length > 1 && ctIdx > 0) {
  //           //log('select previous tab', tabArray, ctIdx - 1, tabs);
  //           switchTabs(tabs[ctIdx - 1].id)
  //         } else if (command === "quick-next-tab" && tabs.length > 1 && ctIdx < tabs.length - 1) {
  //           //log('select next tab', tabArray, ctIdx + 1, tabs);
  //           switchTabs(tabs[ctIdx + 1].id)
  //         }
  //
  //       }
  //     });
  //
  //   }
  // });
}

init();
