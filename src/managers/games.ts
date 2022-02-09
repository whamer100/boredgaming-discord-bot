import {
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbedOptions,
    Snowflake
} from "discord.js";
import {gButton1P} from "../games/gButton1P";
import {botMainColor} from "../constants";

export interface Game {
    id: string
    key: string
    title: string
    description: string
    playerCount: number
    players: GuildMember[]
    message: Message | undefined
    state: object  // any object, up to the game implementation to use
    init: () => Promise<void>  // call after object creation
    update: () => Promise<void>  // main game loop, is called by init once all players are in
    register: (what: "PLAYER" | "MESSAGE", toRegister: GuildMember | Message) => Promise<boolean>
}

// snowflake of user: key for active game
export const activeGames: { [key: Snowflake]: Game; } = {};

export const endGame = (id: string) => {
    const target = activeGames[id];
    console.log(`[GAME::${target.id}] Ending game.`);

    delete activeGames[id];
};

export type GameMetadata = {
    title: string
    description: string
    playerCount: number
}

export const GameMeta: { [game: string]: GameMetadata; } = {
    ["gButton1P"]: {
        title: "Press The Button",
        description: "Press the Button to win!",
        playerCount: 1
    }
};

const abortGame = async (g: Game) => {
    const embed: MessageEmbedOptions = {
        title: "Game has been aborted.",
        color: botMainColor
    };

    g.message?.edit({
        embeds: [embed],
        components: []
    });
};

export const waitForPlayers = async (g: Game) => {
    const joinButton = new MessageButton()
        .setCustomId("join-button")
        .setStyle("SECONDARY")
        .setLabel("Click to join!");

    const abortButton = new MessageButton()
        .setCustomId("abort-button")
        .setStyle("DANGER")
        .setLabel("Abort");

    const actionRow = new MessageActionRow().setComponents([joinButton, abortButton]);

    g.message = await g.message?.edit({
        content: `Waiting for players... (${g.players.length}/${g.playerCount})`,
        components: [actionRow]
    });

    if (g.message === undefined) return;  // this cant happen, but just to make tsc stop yelling at me

    const filter = (interaction: MessageComponentInteraction) =>
        interaction.customId === "join-button" || interaction.customId === "abort-button";
    const collector = g.message.createMessageComponentCollector({filter, time: 60_000});

    collector.on('collect', async (i: MessageComponentInteraction) => {
        if (i.channel === null) return;
        if (!i.isButton()) return;
        if (i.member instanceof GuildMember) {
            const invoker: GuildMember = i.member;
            const host = g.players[0];

            if (i.customId === "abort-button" && invoker === host) {
                await abortGame(g);
                endGame(g.id);
            }
            else if (i.customId === "join-button") {
                g.players.push(invoker);
                await g.init();
                collector.stop();
            }
        }
    });
};

export const generateGameID = (): string => {
    return [...Array(8)].map(
        () => Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
};

export const loadGame = (key: string) => ({
    "gButton1P": gButton1P
})[key];

export const gameKeys = Object.keys(GameMeta);

