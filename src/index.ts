import {handleEvents} from "./events";

require('dotenv').config();
import {CommandStore, SapphireClient} from '@sapphire/framework';
import {PresenceData, ActivitiesOptions, MessageMentionTypes} from "discord.js";
import "./startup";

const prefix = process.env.PREFIX!;
const TOKEN  = process.env.BOT_TOKEN!;
const owners = process.env.OWNERS!;

const defaultActivity: ActivitiesOptions = {
    name: "board games, probably"
};

const presence: PresenceData = {
    status: "online",
    afk: false,
    activities: [defaultActivity]
};

const allowedMentionTypes: MessageMentionTypes[] = ["roles", "users"];

const client = new SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES'],
    defaultPrefix: prefix,
    presence: presence,
    allowedMentions: {
        parse: allowedMentionTypes
    }
});

export const commandCollection: CommandStore = client.stores.get("commands");

handleEvents(client);

console.log("Connecting bot...");
// noinspection JSIgnoredPromiseFromCall becasue im annoying
client.login(TOKEN);

// TODO LIST OF THINGS TO DO
// TODO: get bot framework started <- picked Sapphire
//       - this shit: E:\Random Project Things\programming things\bandori-discord-bot\src
// TODO: start working on game handler
//       - Game class
//       - GamePlayer class + registering players
//       - GameEvent, GameState, etc etc whatever just get it working 4Head
// TODO: make a basic game example (click the button to win!)
// TODO: click the button to win 2 player edition
// TODO: make connect four
// TODO: ???
// TODO: profit
