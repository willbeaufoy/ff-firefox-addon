var highlight_listen_called = false;

function getOffsetRect(elem) {
  // (1)
  var box = elem.getBoundingClientRect()
  
  var body = document.body
  var docElem = document.documentElement
  
  // (2)
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
  
  // (3)
  var clientTop = docElem.clientTop || body.clientTop || 0
  var clientLeft = docElem.clientLeft || body.clientLeft || 0
  
  // (4)
  var top  = box.top +  scrollTop - clientTop
  var left = box.left + scrollLeft - clientLeft
  
  return { top: Math.round(top), left: Math.round(left) }
}

self.port.on('highlightListen', function() {

  console.log('highlightListen called');

  /* If this is the first time this function has been called, set up the necessary CSS and document event listeners */

  if(!highlight_listen_called) {
    var style = document.createElement('style');
    var css = " \
      .ff_send_popup { position:absolute; z-index:999; max-width:400px; background-color:#86d174; padding:10px; border:1px solid #999; border-radius:5px; font-family: 'FS Me Web Bold', Helvetica, sans-serif; text-align: left } \
      .ff_send_popup p { font-size:16px; font-weight:normal; text-align:left; color:#333; white-space: normal; font-family: 'FS Me Web Bold', Helvetica, sans-serif } \
      .ff_send_selection_text { color:#fff; background-color:#000; padding:0 4px } \
      .ff_send_extra_info { width:180px; height:90px; float:left } \
      .ff_send_submitted_by { width:140px } \
      .ff_send_tags { width:210px } \
      .ff_send_send_button_wrapper { margin-top:10px } \
      .ff_send_send_button { cursor:pointer; color:#fff; font-weight:bold; background-color:#ff7d01; border:1px solid #A2652B; border-radius:5px; padding:8px; font-size:16px } \
    ";

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    /* Event listener to close the popup */

    document.body.addEventListener('click', function(e) {
      var ffpopup = document.getElementById('ff_send_popup');
      console.log(String(ffpopup));
      console.log('target: ' + String(e.target));
      if(ffpopup && e.target != ffpopup && !ffpopup.contains(e.target)) {
        ffpopup.parentNode.removeChild(ffpopup);
        ffpopup = null;
      }
    })

    highlight_listen_called = true;
  }

  document.body.addEventListener('mouseup', function() {
    var selection = window.getSelection();
    var selectionText = selection.toString();
    console.log(selection);
    console.log(selectionText);
    // If there's a selection (i.e. if the user has actually highlighted something not just clicked), open a popup
    if(selectionText) {
      //self.port.emit('sendSelection', selectionText);
      console.log('There is selection text');

      var ff_send_popup = document.createElement('div');
      ff_send_popup.className = 'ff_send_popup';
      setTimeout(function() {
        ff_send_popup.id = 'ff_send_popup';
      }, 50);

      console.log(String(selection.anchorNode));
      var rect = getOffsetRect(selection.anchorNode.parentElement);
      ff_send_popup.style.top = rect.top + 'px';
      ff_send_popup.style.left = rect.left + 'px';

      var selection_text = document.createElement('span');
      selection_text.className = 'ff_send_selection_text';
      selection_text.textContent = selectionText;

      var content_p = document.createElement('p');
      content_p.appendChild(document.createTextNode('Send the claim: '));
      content_p.appendChild(selection_text);
      content_p.appendChild(document.createTextNode(' to Full Fact?'));
      ff_send_popup.appendChild(content_p);

      var extra_info = document.createElement('textarea');
      extra_info.className = 'ff_send_extra_info';
      extra_info.placeholder = 'Any extra info?';
      ff_send_popup.appendChild(extra_info);

      // var submitted_by = document.createElement('input');
      // submitted_by.className = 'ff_send_submitted_by';
      // submitted_by.placeholder = 'Submit as';
      // For now can only submit as anonymous
      //submitted_by.value = 'Anonymous';
      //submitted_by.readOnly = true;
      // ff_send_popup.appendChild(submitted_by);

      var tags = document.createElement('input');
      tags.className = 'ff_send_tags';
      tags.placeholder = 'Tags (separated by a space)';
      ff_send_popup.appendChild(tags);

      var send_button_wrapper = document.createElement('div');
      send_button_wrapper.className = 'ff_send_send_button_wrapper';
      var send_button = document.createElement('span');
      send_button.id = 'ff_send_send_button';
      send_button.className = 'ff_send_send_button';
      send_button.innerHTML = 'Send';

      send_button.addEventListener('click', function() {
        var selectionContent = {
          'page': document.URL,
          'selection': selectionText,
          'extra_info': extra_info.value,
          'tags': tags.value,
          // 'submitted_by': submitted_by.value,
          'submitted_by': '',
        };
        self.port.emit('sendSelection', selectionContent);
      })
      send_button_wrapper.appendChild(send_button)
      ff_send_popup.appendChild(send_button_wrapper);

      document.body.appendChild(ff_send_popup);
    }


  })
})

self.port.on('selectionSent', function() {
  var ffpopup = document.getElementById('ff_send_popup');
  var sendButton = document.getElementById('ff_send_send_button');
  sendButton.style.backgroundColor = '#86D174';
  sendButton.innerHTML = 'Selection sent';
  ffpopup.style.opacity = '0';
  ffpopup.style.transition = 'opacity 2s';
  // ffpopup.style.mozTransition = 'opacity 1s';
  setTimeout(function() {
    ffpopup.parentNode.removeChild(ffpopup);
    ffpopup = null;
  }, 2000)
})
