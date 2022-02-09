import { Command } from '@sapphire/framework';
import {MessageComponentInteraction, Message, MessageButton} from "discord.js";
import { MessageSelectMenu, MessageActionRow } from "discord.js";
import {deleteAfter} from "../utils";

export class TestMenuCommand extends Command {
    constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'testmenu',
            aliases: ['testmenu'],
            description: "This is a test command for the select menu interaction.",
        });
    }

    async messageRun(message: Message) {
        const testMenu = new MessageSelectMenu()
            .setCustomId("test-menu")
            .setMaxValues(1)
            .setOptions([
                {
                    label: "Click Me!",
                    value: "item0",
                    default: true
                },{
                    label: "No, Click Me!",
                    value: "item1"
                },{
                    label: "Dont trust them, Click Me!",
                    value: "item2"
                },{
                    label: "Click Me, Please!",
                    value: "item3"
                },{
                    label: "i have no idea whats with them",
                    value: "item4"
                },{
                    label: "the j",
                    value: "item5"
                }
            ]);

        const closeButton = new MessageButton()
            .setCustomId("exit")
            .setStyle("DANGER")
            .setLabel("Close");

        const actionRow = new MessageActionRow().setComponents([testMenu]);
        const exitRow = new MessageActionRow().setComponents([closeButton]);

        const replyMsg = await message.reply({
            content: 'If you can see this, then this is working!',
            components: [actionRow, exitRow]
        });

        const filter = (interaction: MessageComponentInteraction) =>
            interaction.customId === "test-menu" || interaction.customId === "exit";
        const collector = replyMsg.createMessageComponentCollector({filter, time: 15_000});

        collector.on('collect', (i: MessageComponentInteraction) => {
            if (i.customId === "exit") collector.stop();
            if (i.channel === null) return;
            if (!i.isSelectMenu()) return;
            const selected = i.values.join(", ");
            const congrats = i.channel.send({content: `Congrats on selecting "${selected}"!`});
            deleteAfter(congrats, 15_000);
            collector.stop();
        });
        collector.on('end', async () => {
            await replyMsg.delete();
        });
    }
}