import { SapphireClient } from "@sapphire/framework";
import { commandCollection } from "./index";
import { formatHelp, boxContents } from "./utils";
import {GameMeta} from "./managers/games";

const logStartup = (client: SapphireClient) => {
    const stat = `Logged in as ${client.user?.tag} [id:${client.user?.id}]`;
    const commands: string[] = commandCollection.map(
        (command) => formatHelp(command)
    );
    const games: string[] = Object.keys(GameMeta).map(
        (k) => `[${k}]: "${GameMeta[k].title}"`
    );
    const out = boxContents(
        "Started Up!", stat,
        commands.length === 0 ? "No commands!" : commands.join("\n"),
        games.length === 0 ? "No games!" : games.join("\n")
    );
    console.log(out);
};

const onReady = (client: SapphireClient) => {
    logStartup(client);
};

export const handleEvents = (client: SapphireClient) => {
    client.on("ready", () => onReady(client));
    client.on('error', console.error);
};
