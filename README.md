# hubot-hipchat-trello-retrospectives

A hubot script that allows users to add cards to a trello board used to run project retrospectives, inspired by Jessica Barnett's [fantastic article](https://medium.com/@redheadjessica/a-step-by-step-guide-to-using-trello-for-team-retrospectives-da327daf7e47)

See [`src/hipchat-trello-retrospectives.js`](src/hipchat-trello-retrospectives.js) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-hipchat-trello-retrospectives --save`

Then add **hubot-hipchat-trello-retrospectives** to your `external-scripts.json`:

```json
["hubot-hipchat-trello-retrospectives"]
```

## Sample Interaction

```
user1>> hubot retro: Start writing unit tests
hubot>> Successfully added retrospective card: https://trello.com/c/lxmuhQ26
```
