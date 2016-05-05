const rx = require('rx');
const _ = require('underscore-plus');
const Slack = require('slack-client');

const MessageHelpers = require('./message-helpers');


class Bot {
  // Public: Creates a new instance of the bot.
  //
  // token - An API token from the bot integration
  constructor(token) { //Mike version
    this.slack = new Slack(token, true, true);

    this.gameConfig = {};
    this.gameConfigParams = ['timeout'];
  }

  // Public: Brings this bot online and starts handling messages sent to it.
  login() {
    rx.Observable.fromEvent(this.slack, 'open')
      .subscribe(() => this.onClientOpened());

    this.slack.login();
    this.respondToMessages();
  }

  // Private: Listens for messages directed at this bot
  //
  // Returns a {Disposable} that will end this subscription
  respondToMessages() {
    let messages = rx.Observable.fromEvent(this.slack, 'message')
      .where(e => e.type === 'message');

    let atMentions = messages.where(e =>
      MessageHelpers.containsUserMention(e.text, this.slack.self.id));

    let disp = new rx.CompositeDisposable();

    disp.add(this.handleChatMessages(messages, atMentions));

    return disp;
  }

  handleChatMessages(messages, atMentions) {
    this.messageHelper('erlich',this.getErlichUrls(), atMentions);
  }

  messageHelper(chatInput, chatOutput, atMentions)
  {
    atMentions
       .where(e => e.text && e.text.toLowerCase().match(chatInput))
       .map(e => this.slack.getChannelGroupOrDMByID(e.channel))
       .flatMap(channel => {
        let length = chatOutput.length;
        if (length > 1) {
         channel.send(chatOutput[Math.floor(Math.random() * chatOutput.length)]);
        }
        else {
         channel.send(chatOutput[0]);
        }
        return rx.Observable.return(null);
        })
        .subscribe();
  }


  // Private: Save which channels and groups this bot is in and log them.
  onClientOpened() {
    this.channels = _.keys(this.slack.channels)
      .map(k => this.slack.channels[k])
      .filter(c => c.is_member);

    this.groups = _.keys(this.slack.groups)
      .map(k => this.slack.groups[k])
      .filter(g => g.is_open && !g.is_archived);

    this.dms = _.keys(this.slack.dms)
      .map(k => this.slack.dms[k])
      .filter(dm => dm.is_open);

    console.log(`Welcome to Slack. You are ${this.slack.self.name} of ${this.slack.team.name}`);

    if (this.channels.length > 0) {
      console.log(`You are in: ${this.channels.map(c => c.name).join(', ')}`);
    } else {
      console.log('You are not in any channels.');
    }

    if (this.groups.length > 0) {
      console.log(`As well as: ${this.groups.map(g => g.name).join(', ')}`);
    }

    if (this.dms.length > 0) {
      console.log(`Your open DM's: ${this.dms.map(dm => dm.name).join(', ')}`);
    }
  }

  // Erlich urls
  getErlichUrls() {
    var selectUrls = ['http://giphy.com/gifs/silicon-valley-l3V0y6ZsNMt2icm3K',
    'http://giphy.com/gifs/siliconvalleyhbo-silicon-valley-hbo-erlich-3o7qE7QBNrErd5l64E',
    'http://giphy.com/gifs/3o6ozxMJHCtku2IXPW',
    'http://giphy.com/gifs/hbo-silicon-valley-sxsw-pied-piper-xTiTnvc9IlOffSwlPi',
    'http://giphy.com/gifs/siliconvalleyhbo-erlich-bachman-private-party-3o85xqZ37anBjdPzbO',
    'http://giphy.com/gifs/hit-beat-ptDRdwFkFVAkg',
    'http://giphy.com/gifs/siliconvalleyhbo-hbo-season-1-silicon-valley-26BkMadvsqSlAJdkY',
    'http://giphy.com/gifs/siliconvalleyhbo-xT1XGvcV4fa2eV4KS4',
    'http://giphy.com/gifs/silicon-valley-siliconvalleyedit-fatcd1PnHPTDW',
    'http://giphy.com/gifs/silicon-valley-siliconvalleyedit-OA68KNcxFFuAE',
    'http://giphy.com/gifs/silicon-valley-siliconvalleyedit-YzFJ7NL4zCgkE',
    'http://giphy.com/gifs/silicon-valley-YlYHnxsd7YvFC',
    'http://giphy.com/gifs/entertainment-describing-bachman-COgmzJQkqVE6k',
    'http://giphy.com/gifs/entertainment-describing-bachman-i5EIzDBOrhAjK',
    'http://giphy.com/gifs/entertainment-describing-bachman-111Y3FU5i7JDGM',
    'http://giphy.com/gifs/valley-fire-piKXr2hEDsO1G',
    'http://giphy.com/gifs/season-3-silicon-valley-new-trailer-3osxYbz61vsfo3BUCA',
    'http://giphy.com/gifs/siliconvalleyhbo-3o7qDHm7y5hWEnNxvi',
    'http://giphy.com/gifs/siliconvalleyhbo-l0K461PvDhmsgiAHm',
    'http://giphy.com/gifs/siliconvalleyhbo-3o6ozvnatQNgGlqrfO',
    'http://giphy.com/gifs/siliconvalleyhbo-26h0p7c6YkkvGlJxS',
    'http://giphy.com/gifs/siliconvalleyhbo-3o7qDY8ip5vxkOo0i4',
    'http://giphy.com/gifs/siliconvalleyhbo-hbo-silicon-valley-jack-barker-xT1XGNIqDOamdWPQ5i',
    'http://giphy.com/gifs/season-3-money-unicorn-3osxYamKD88c6pXdfO',
    'http://giphy.com/gifs/siliconvalleyhbo-26AHJhPfMObvwafKg'];

    return selectUrls;
  }
}

module.exports = Bot;
