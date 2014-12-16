var buttons = require('sdk/ui/button/action');
var toggleButtons = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");
var self = require("sdk/self");
var Request = require("sdk/request").Request;
var prefs = require('sdk/simple-prefs').prefs;
var active = prefs.active;
var autorun = prefs.autorun;
var ffuser = prefs.ffuser;
var serverUrl = 'http://ff.willbeaufoy.net';
// var serverUrl = 'http://127.0.0.1:8000';
var sendUrl = serverUrl + '/handle_selection/';
var searchUrl = serverUrl + '/search_facts/';
var searchIsSetUp = false;

tabs.on('ready', function() {
  // If plugin is on and tab is a web page set up the app
  console.log('Tab ready');
  console.log(tabs.activeTab.url.slice(0,4));
  if(active && tabs.activeTab.url.slice(0,4) == 'http') {
    go();
  }
  if(autorun) {
    searchFacts();
  }
});

function onActiveChange(prefName) {
  console.log('onactivechange')
  console.log(prefs.active)
  active = prefs.active;
  if(active = true) {
    go();
  }
  else stop();
}

function onFfuserChange(prefName) {
  ffuser = prefs.ffuser;
}

require("sdk/simple-prefs").on("active", onActiveChange);
require("sdk/simple-prefs").on("ffuser", onFfuserChange);

var button = toggleButtons.ToggleButton({
  id: "full-fact",
  label: "Full Fact",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleChange
});

var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    // panel.show({
    //   position: button
    // });
  }
  searchFacts();
}

function handleHide() {
  button.state('window', {checked: false});
}

function go() {
  console.log('go called');
  worker = tabs.activeTab.attach({
    contentScriptFile: 
      [self.data.url('select-listen.js')]
  });

  worker.port.emit('highlightListen');

  worker.port.on('sendSelection', function(selectionContent) {
    console.log('sendSelection called');
    selectionContent.submitted_by = ffuser;
    var request = Request({
      url: sendUrl,
      content: selectionContent,
      onComplete: function(response) {
        console.log(response.status);
        console.log(response.statusText);
        console.log(' Request has completed. response below');
        console.log(response);
        if(!response) {
          console.log('Server unreachable or error');
          //stopSpinning();
        }
        // else if(JSON.strinpngy(response.json) == '{}') {
        //   console.log('No matches found');
        //   stopSpinning();
        // }
        else {
          worker.port.emit('selectionSent');
        }
      }
    }).post();
  });
}

function setupSearch() {
  console.log('setupSearch');
  worker = tabs.activeTab.attach({
      contentScriptFile: 
        [self.data.url('highlight-claims.js')]
  });

  worker.port.on('sendPageContent', function(pageContent) {
    var request = Request({
      url: searchUrl,
      content: pageContent,
      onComplete: function(response) {
        console.log(response.status);
        console.log(response.statusText);
        console.log(' Request has completed. json below');
        console.log(response.json);
        console.log(JSON.stringify(response.json));
        if(!response.json) {
          console.log('Server unreachable or error');
          //stopSpinning();
        }
        else if(JSON.stringify(response.json) == '{}' || JSON.stringify(response.json) == '["",""]') {
          console.log('No matches found');
          //stopSpinning();
        }
        else {
          worker.port.emit('updatePage', response.json);
        }
      }
    }).post();
  });
}


function searchFacts() {
  console.log('Search started');
  if(!searchIsSetUp) {
    setupSearch();
  }
  worker.port.emit('getPageContent');
};

function stop() {
  // Find some way to remove the event listener here
};

