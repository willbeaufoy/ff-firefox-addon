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

  document.body.addEventListener('click', function(e) {
    var ffpopup = document.getElementById('ffpopup');
    console.log(String(ffpopup));
    console.log('target: ' + String(e.target));
    if(ffpopup && e.target != ffpopup && !ffpopup.contains(e.target)) {
      ffpopup.parentNode.removeChild(ffpopup);
      ffpopup = null;
    }
  })

  console.log('hightlightListen called');
  document.body.addEventListener('mouseup', function() {
    var selection = window.getSelection();
    var selectionText = selection.toString();
    console.log(selection);
    console.log(selectionText);
    // If there's a selection (i.e. if the user has actually highlighted something not just clicked), open a popup
    if(selectionText) {
      //self.port.emit('sendSelection', selectionText);
      console.log('There is selection text');
      var popup = document.createElement('div');
      setTimeout(function() {
        popup.id = 'ffpopup';
      }, 50);
      popup.className = 'ffpopup';
      console.log(String(selection.anchorNode));
      var rect = getOffsetRect(selection.anchorNode.parentElement);
      //var popup = document.getElementById('pbpopup' + e.target.id.replace('pbtitle', ''));
      popup.style.position = 'absolute';
      // popup.style.top = e.clientY + 'px';
      // popup.style.left = e.clientX + 'px';
      popup.style.top = rect.top + 'px';
      popup.style.left = rect.left + 'px';
      popup.style.display = 'block';

      popup.style.zIndex = 999;
      popup.style.maxWidth = '500px';
      popup.style.backgroundColor = '#eee';
      popup.style.padding = '10px'; 
      popup.style.border = '1px solid #999';
      popup.style.borderRadius = '5px';
      //     .pbpopop a, .pbpopup a:visited, .pbpopup a:link { color:#1a0dab; } \

      var content_p = document.createElement('p');
      content_p.innerHTML = 'Send the claim: ' + selectionText + ' to Full Fact?';
      content_p.style.fontSize = '14px';
      content_p.style.fontWeight = 'normal';
      content_p.style.textAlign = 'left';
      content_p.style.color = '#333';
      content_p.style.whiteSpace = 'normal';
      // content_p.style.fontFamily = 'Open-sans', sans-serif;}";
      popup.appendChild(content_p);

      var submitted_by = document.createElement('input');
      submitted_by.placeholder = 'Submit as';
      popup.appendChild(submitted_by);

      var tags = document.createElement('input');
      submitted_by.placeholder = 'Add optional tags (separated by a comma and/or space';
      popup.appendChild(submitted_by);

      var send_button = document.createElement('div');
      send_button.id = 'ffsendbutton';
      send_button.innerHTML = 'Send';
      send_button.style.cursor = 'pointer';
      send_button.style.color = '#fff';
      send_button.style.fontWeight = '#bold';
      send_button.style.backgroundColor = '#ff7d01';
      send_button.style.border = '1px solid #5566ee';
      send_button.style.borderRadius = '5px';
      send_button.addEventListener('click', function() {
        self.port.emit('sendSelection', selectionText);
      })

      popup.appendChild(send_button);

      document.body.appendChild(popup);
    }


  })
})

self.port.on('selectionSent', function() {
  var ffpopup = document.getElementById('ffpopup');
  var sendButton = document.getElementById('ffsendbutton');
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
