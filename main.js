require('babel/register');
var http = require('http');

try {
  var fs = require('fs');
  var pathToken = process.env.CHAT_BOT_TOKEN;
  var token = pathToken || fs.readFileSync('token.txt', 'utf8').trim();
} catch (error) {
  console.log("Your API token should be placed in a 'token.txt' file, which is missing.");
  return;
}

var Bot = require('./bot');
var bot = new Bot(token);
bot.login();

