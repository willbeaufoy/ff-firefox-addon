var buttons = require('sdk/ui/button/action');
var toggleButtons = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var Request = require("sdk/request").Request;
var prefs = require('sdk/simple-prefs').prefs;
var autorun = prefs.autorun;
var serverUrl = 'http://127.0.0.1:8000/send_selection/';

console.log('autoruninitial: ' + String(autorun))
//require("sdk/tabs").on("ready", logURL);

function onPrefChange(prefName) {
  autorun = prefs.autorun;
  console.log('autorunafterchange: ' + String(autorun))
}

require("sdk/simple-prefs").on("autorun", onPrefChange);

var button = toggleButtons.ToggleButton({
  id: "search-full-fact",
  label: "Search Full Fact",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  //onClick: searchPb
});

function stopSpinning() {
  button.state('window', {
    icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
    },
  });
}




tabs.on('ready', function(tab) {
  worker = tabs.activeTab.attach({
    contentScriptFile: 
      [self.data.url('contentscript.js')]
  });

  worker.port.emit('highlightListen');

  worker.port.on('sendSelection', function(selectionText) {
    console.log('sendSelection called');
    var request = Request({
      url: serverUrl,
      content: {
        'submittedBy': 'Anonymous',
        'page': tabs.activeTab.url,
        'selection': selectionText
      },
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

});

// function searchPb() {

//   // Start icon spinning
//   //button.icon['16'] = './icon-spinning-16.png';
//   button.state('window', {
//     icon: {
//     "16": "./icon-spinning-16.png",
//     "32": "./icon-32.png",
//     "64": "./icon-64.png"
//     },
//   });
//   console.log('Search started');

//   worker = tabs.activeTab.attach({
//     contentScriptFile: 
//       [self.data.url('contentscript.js')]
//   });

//   worker.port.emit('highlightListen');

//   worker.port.on('sendHTML', function(html) {
//     // var uri = tabs.activeTab.url
//     var uri = html;
//     //console.log(uri);
//     var query = 'http://pb.afnewsagency.org';
//     //var query = 'http://localhost:14590';
//     //console.log(query);
//     var request = Request({
//       url: query,
//       content: html,
//       onComplete: function(response) {
//         console.log(response.status);
//         console.log(response.statusText);
//         console.log(' Request has completed. json below');
//         console.log(response.json);
//         if(!response.json) {
//           console.log('Server unreachable or error');
//           stopSpinning();
//         }
//         else if(JSON.strinpngy(response.json) == '{}') {
//           console.log('No matches found');
//           stopSpinning();
//         }
//         else {
//           worker.port.emit('updateHTML', response.json);
//         }
//       }
//     }).post();
//   });

//   worker.port.on('finishedUpdating', function() {
//     // Reset button to static state
//     console.log('finishedUpdating')
//     button.state('window', {
//       icon: {
//       "16": "./icon-16.png",
//       "32": "./icon-32.png",
//       "64": "./icon-64.png"
//       },
//     });
//   });
// };