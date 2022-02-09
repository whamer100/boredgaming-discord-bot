import {endGame, Game, generateGameID, waitForPlayers} from "../managers/games";
import {
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbedOptions
} from "discord.js";
import {botMainColor} from "../constants";

export class gButton1P implements Game {
    id: string
    key: string
    title = "Press The Button"
    description = "Press the Button to win!"
    playerCount = 1
    players: GuildMember[] = []
    message: Message | undefined = undefined
    state = {}
    init = async () => {
        if (this.players.length < this.playerCount) {
            await waitForPlayers(this);
            await this.init();
        }
        await this.update();
    }
    update = async () => {
        const embed: MessageEmbedOptions = {
            title: "Press the Button to win!",
            description: "You have one minute.",
            color: botMainColor
        };

        const winButton = new MessageButton()
            .setCustomId("win-button")
            .setStyle("SUCCESS")
            .setLabel("The Button");

        const actionRow = new MessageActionRow().setComponents([winButton]);

        this.message = await this.message?.edit({
            embeds: [embed],
            components: [actionRow]
        });

        if (this.message === undefined) return;  // this cant happen but whatever lmao

        const filter = (interaction: MessageComponentInteraction) => interaction.customId === "win-button";
        const collector = this.message.createMessageComponentCollector({filter, time: 60_000});

        collector.on("collect", async (i: MessageComponentInteraction) => {
            // wow!!! it was clicked!
            const host = this.players[0];
            const winEmbed: MessageEmbedOptions = {
                title: "Press the Button to win!",
                description: `Congrats, <@${host.id}>! You pressed the button!`,
                color: botMainColor
            };
            await this.message?.edit({
                embeds: [winEmbed],
                components: []
            });
            endGame(host.id);
        });
    }
    register = async (what: string, toRegister: GuildMember | Message): Promise<boolean> => {
        if (what === "PLAYER" && toRegister instanceof GuildMember) {
            if (this.players.length < this.playerCount) {
                this.players.push(toRegister);
                return true;
            }
        } else if (what === "MESSAGE" && toRegister instanceof Message) {
            if (this.message === undefined) {
                this.message = toRegister;
                return true;
            }
        }
        return false;
    }

    constructor() {
        this.id = generateGameID();
        this.key = "gButton1P";
    }
}

