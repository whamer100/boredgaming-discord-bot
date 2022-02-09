import {Command} from '@sapphire/framework';
import {
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbedOptions,
    MessageSelectMenu,
    MessageSelectOptionData
} from "discord.js";
import {activeGames, Game, gameKeys, GameMeta, GameMetadata, loadGame} from "../managers/games";
import {deleteAfter} from "../utils";
import {botMainColor} from "../constants";

const handleRegister = async (i: MessageComponentInteraction, g: Game, t: "PLAYER" | "MESSAGE", o: any) => {
    const result = await g.register(t, o);

    if (!result) {
        console.log(`[INIT::${t}::FATAL] Registering to game (${g.id}->${g.key}) failed.`);
        await i.reply({
            content: `Unexpected error when initializing game #${g.id} during init step "${t}"!`,
            ephemeral: true
        });
    }
};

export class PlayCommand extends Command {
    constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'play',
            aliases: ['play'],
            description: "Play a game.",
        });
    }

    async messageRun(message: Message) {
        if (message.member === null) return; // how?

        const invoker = message.member;

        if (invoker.id in activeGames) {
            const reject = message.reply("You already have a game in progress!");
            deleteAfter(reject, 6_000);
            return;
        }

        // time for a new game! prompt user for game selection
        // console.log(gameKeys);
        const gameMenuOptions: MessageSelectOptionData[] = gameKeys.map((k) => {
            const game: GameMetadata = GameMeta[k];
            const gameInfo: MessageSelectOptionData = {
                label: game.title,
                value: k,
                description: `${game.description} (${game.playerCount} player${(game.playerCount === 1) ? '' : 's'})`
            };
            // console.log(gameInfo);
            return gameInfo;
        });

        const gameMenu = new MessageSelectMenu()
            .setCustomId("game-menu")
            .setMaxValues(1)
            .setPlaceholder("Select a game to play!")
            .setOptions(gameMenuOptions);

        const closeButton = new MessageButton()
            .setCustomId("exit")
            .setStyle("DANGER")
            .setLabel("Cancel");

        const actionRow = new MessageActionRow().setComponents([gameMenu]);
        const exitRow = new MessageActionRow().setComponents([closeButton]);

        const replyMsg = await message.reply({
            content: 'Let the games begin.',
            components: [actionRow, exitRow]
        });

        const filter = (interaction: MessageComponentInteraction) =>
            interaction.customId === "game-menu" || interaction.customId === "exit";
        const collector = replyMsg.createMessageComponentCollector({filter, time: 60_000});

        collector.on('collect', async (i: MessageComponentInteraction) => {
            if (i.customId === "exit") collector.stop();
            if (i.channel === null) return;
            if (!i.isSelectMenu()) return;

            // create game class and pass the created message to the class
            const selected = i.values.join(', '); // you can only pick one game, so this is okay to do.
            const game = loadGame(selected);
            // console.log(game, selected, i.values);
            if (game === undefined) return; // this shouldnt happen, but if it does uh oh
            activeGames[invoker.id] = new game();

            const newGame = activeGames[invoker.id];

            console.log(`[INIT::${newGame.id}] Creating game ${newGame.key}...`);

            const embed: MessageEmbedOptions = {
                title: `Initializing game "${newGame.title}"...`,
                color: botMainColor
            };

            const gameMessage = i.channel.send({embeds: [embed]});
            // activeGames[invoker.id].registerMessage(gameMessage);

            // the chain of initialization
            gameMessage.then(async (g: Message) => {
                await Promise.all([
                    await handleRegister(i, newGame, "MESSAGE", g),
                    await handleRegister(i, newGame, "PLAYER",  invoker)
                ]);
            }).then(async () => {
                await newGame.init();
            });
            // activeGames[invoker.id].waitForPlayers();

            // clean up current event handling
            collector.stop();
        });
        collector.on('end', async () => {
            await replyMsg.delete();
        });
    }
}