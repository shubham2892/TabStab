
/**
 * lazy variable to address the background page
 */
var bg = chrome.extension.getBackgroundPage();



function closeWindow() {
  /**
   * unon document events before closing the popup window, see issue
   * Chrome shortcuts do not work immediately after using quicktabs #95
   */
  $(document).unon();
  window.close();
  return false;
}


function scrollToFocus_discarded() {
  var element = $(".withfocus");
  var container_element = $(".tab_container");
  var offset = element.offset().top;
  var elementHeight = element.outerHeight(true);

  var visible_area_start = container_element.scrollTop();
  var visible_area_end = visible_area_start + container_element.innerHeight();

  console.log(offset);
  console.log(visible_area_end);
  console.log(elementHeight);

  if (offset < visible_area_start + elementHeight) {
    // scrolling up
    container_element.animate({scrollTop: offset - elementHeight}, 10);
    return false;
  } else if (offset > visible_area_end - elementHeight) {
    // scrolling down
    container_element.animate({scrollTop: offset - container_element.innerHeight() + elementHeight}, 10);
    return false;
  }
  return true;
}


function scrollToFocus(){
  var container_element = $(".withfocus");
  var container = $(".tab_container");
  var container_top = container.offset().top;
  var container_element_top = container_element.offset().top;
  var container_hieght = container.innerHeight();
  var  container_element_height = container_element.innerHeight() * 2;
  var container_end = container_top + container_hieght;
  var container_element_end = container_element_top + container_element_height;
  var container_scrollTop = container.scrollTop();
  if (container_end - container_element_end <= 0){
    container.animate({scrollTop: container_scrollTop + container_element_height}, 10);
    // container.scrollTop = container_element_end + container_element_height;
    return false;
  }else if (container_element_top - container_top <= container_element_height) {
    container.animate({scrollTop: container_scrollTop - container_element_height},10);
  }
  return true;
}


function focus(elem) {
  $(".withfocus").removeClass('withfocus');
  elem.addClass('withfocus');
}

function entryWithFocus() {
  return $(".withfocus");
}

function isFocusSet() {
  return entryWithFocus().length > 0;
}

function focusFirst() {
  return $(".item:first").addClass("withfocus");
}

function focusLast() {
  return $(".item:last").addClass("withfocus");
}


function focusPrev(skip) {
  skip = skip || 1;
  entryWithFocus().removeClass('withfocus').prevAll(".item").eq(skip - 1).addClass('withfocus');
  if (!isFocusSet()) {
    (skip == 1 ? focusLast : focusFirst)();
  }

  scrollToFocus();
}

function focusNext(skip) {
  skip = skip || 1;

  entry = entryWithFocus().removeClass('withfocus').nextAll(".item").eq(skip - 1).addClass('withfocus');
  if (!isFocusSet()) {
    (skip == 1 ? focusFirst : focusLast)();
  }

  scrollToFocus();
}

function focusSecond(){
  focusFirst();
  focusNext();
}


function updatePopupHtml(){
  var tabList = bg.getTabList();
  // console.log(tabList);
  var content_list_container = document.getElementById("tab_container");
  if (tabList){
    tabList.forEach(function(tab){
      var tab_element_div = document.createElement('div');
      tab_element_div.className = "item";
      tab_element_div.id = tab.id;
      var content = document.createTextNode(tab.title);
      var image = document.createElement('img');
      image.className = "tabimage";
      image.src = tab.favIconUrl;
      tab_element_div.appendChild(image);
      tab_element_div.appendChild(content);
      content_list_container.appendChild(tab_element_div);
    });
  }
  focusSecond();

  $('.item').on('click', function() {
    bg.switchTabs(this.id);
  });

}

$(document).keydown(function(e) {
    switch(e.which) {
        case 38: // up
          focusPrev();
          break;


        case 40: // down
          focusNext();
          break;

        case 13: // return
          if (!isFocusSet()) {
            focusFirst();
          }

          if (isFocusSet()) {
            entryWithFocus().trigger("click");
          }


        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).ready(function() {
  updatePopupHtml();
});
