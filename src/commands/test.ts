import { Command } from '@sapphire/framework';
import { Message } from "discord.js";

export class TestCommand extends Command {
    constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'test',
            aliases: ['test'],
            description: "This is a test command.",
        });
    }

    async messageRun(message: Message) {
        return message.reply('If you can see this, then this is working!');
    }
}