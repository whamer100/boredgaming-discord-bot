import { Command } from '@sapphire/framework';
import { MessageComponentInteraction, Message } from "discord.js";
import { MessageButton, MessageActionRow } from "discord.js";
import {deleteAfter} from "../utils";

export class TestButtonCommand extends Command {
    constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'testbutton',
            aliases: ['testbutton'],
            description: "This is a test command for the button interaction.",
        });
    }

    async messageRun(message: Message) {
        const testButton = new MessageButton()
            .setCustomId("test-button")
            .setLabel("Click Me")
            .setStyle("PRIMARY");

        const actionRow = new MessageActionRow().setComponents([testButton]);

        const replyMsg = await message.reply({
            content: 'If you can see this, then this is working!',
            components: [actionRow]
        });

        const filter = (interaction: MessageComponentInteraction) => interaction.customId === "test-button";
        const collector = replyMsg.createMessageComponentCollector({filter, time: 15_000});

        collector.on('collect', (i: MessageComponentInteraction) => {
            if (i.channel === null) return;
            const congrats = i.channel.send({content: "Congrats on clicking!"});
            deleteAfter(congrats, 15_000);
            collector.stop();
        });
        collector.on('end', async () => {
            await replyMsg.delete();
        });
    }
}