/***
#
# Description
#   A hubot script that allows users to add cards to a trello board used to run 
#   project retrospectives
#
# Configuration:
#   TRELLO_KEY
#		TRELLO_TOKEN
#		TRELLO_ORGANIZATION
#
# Commands:
#   hubot retro: (text of issue) -  Adds a card to the Trello board with the 
#                 name of the current HipChat room within a specified Trello 
#                 organization.  If the board doesn't exist, the board is 
#                 created and assigned lists representing commonly used 
#                 retrospective categories.
# Notes:
# 
# Author:
#   Aaron Fritsch[@CASE Inc]
#
***/

var moment = require('moment');
var _ = require('lodash');
var async = require('async');
var request = require('request');
var Trello = require("node-trello");
var t = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
var retroColumns = [
  "Uncategorized",
  "Went Well",
  "Needs to Change",
  "Question & Discussion",
  "Action Items"
];

//***** HUBOT RESPONSE *****

module.exports = function(robot) {
    robot.respond(/retro: (.*)/i, function(msg) {
      var cardText = msg.match[1],
        room = msg.message.room;
      checkIfBoardExists(room, function(boardId) {
        if (boardId !== false) {
          createCard(cardText, boardId, function(card) {
            msg.send("Successfully added retrospective card: " +
              card.shortUrl);
          });
        } else {
          createBoard(room, function(boardId) {
            createCard(cardText, boardId, function(card) {
              msg.send(
                "Successfully added retrospective card: " +
                card.shortUrl);
            });
          });
        }
      });
    });
  }

//***** HELPER FUNCTIONS *****

function createBoard(room, callback) {
  t.post("/1/boards", {
    idOrganization: process.env.TRELLO_ORGANIZATION,
    name: room,
    prefs_permissionLevel: "org"
  }, function(err, data) {
    if (err) throw err;
    var boardId = data.id;
    async.series(
      [
        function(subcallback) {
          removeDefaultLists(boardId, subcallback);
        },
        function(subcallback) {
          addRetroLists(boardId, retroColumns, subcallback);
        }
      ], function(err, results) {
        callback(boardId);
      });
  });
  return false;
}

function removeDefaultLists(boardId, callback) {
  t.get("/1/boards/" + boardId + "/lists", function(listsErr, lists) {
    if (listsErr) throw lists_err;
    async.eachSeries(lists, function(list, subcallback) {
      t.put("/1/lists/" + list.id + "/closed", {
        value: true
      }, function(listClosedErr) {
        if (listClosedErr) throw listClosedErr;
        subcallback();
      });
    }, function(asyncError) {
      if (asyncError) throw asyncError;
      callback();
    });
  });
}

function addRetroLists(boardId, columns, callback) {
  async.eachSeries(columns, function(column, subcallback) {
    t.post("/1/lists/", {
      name: column,
      idBoard: boardId,
      pos: 'bottom'
    }, function(newListErr, newList) {
      if (newListErr) throw newListErr;
      subcallback();
    });
  }, function(asyncError) {
    if (asyncError) throw asyncError;
    callback();
  });
}

function checkIfBoardExists(roomName, callback) {
  t.get("/1/organizations/" + process.env.TRELLO_ORGANIZATION + "/boards", {
    filter: "open"
  }, function(err, data) {
    if (err) throw err;
    var boardId = false;
    async.eachSeries(data, function(board, subcallback) {
      if (board.name == roomName) boardId = board.id;
      subcallback();
    }, function(boardErr) {
      if (boardErr) throw boardErr;
      callback(boardId);
    });
  });
}

function createCard(cardText, boardId, callback) {
  t.get("1/boards/" + boardId + "/lists", {
    filter: "open"
  }, function(err, lists) {
    if (err) throw err;
    if (lists.length) {
      t.post("1/cards/", {
        due: null,
        idList: lists[0].id,
        urlSource: null,
        name: cardText
      }, function(cardErr, card) {
        if (cardErr) throw cardErr;
        callback(card);
      })
    }
  })
}
