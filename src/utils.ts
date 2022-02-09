import { Command } from "@sapphire/framework";
import {GuildMember, Message} from "discord.js";
import { chain, equals } from "ramda";

export const boxContents = (...texts: string[]) => { // borrowed from another bot, thanks xetera o/
    const getLines = (text: string) => text.split("\n").map((line) => line.length);
    const splitTexts = chain(getLines);
    const maxLength = Math.max(...splitTexts(texts));
    const [head, ...tail] = texts;

    const spacer = "-".repeat(maxLength);
    return tail.reduce((all, text) => [...all, text, spacer], [spacer, head, spacer]).join("\n");
};

export const isOwner = (id: string): boolean => (process.env.OWNERS!)
    .split(",")
    .some(equals(id));

export const isMod = (member: GuildMember): boolean =>
    member.permissions.has("KICK_MEMBERS") || isOwner(member.id);

export const formatHelp = (mod: Command) => {
    if (mod.description.includes("|")) {
        const segments = mod.description.split("|");
        if (segments.length === 1) return `${process.env.PREFIX}${mod.name}: ${segments[0]}`;
        else return `${process.env.PREFIX}${mod.name} ${segments[0]}: ${segments[1]}`;
    }
    return `${process.env.PREFIX}${mod.name}: ${mod.description}`;
};


export const deleteAfter = (m: Promise<Message>, t: number) =>
    setTimeout(() => {m.then((i) => i.delete());}, t);

export type PromiseOrder<T> = { i: number, v: T; }

export const PromiseAllOrder = async <T>(P: Promise<PromiseOrder<T>>[]): Promise<T[]> => {
    const nP = new Array(P.length);
    const PP = await Promise.all(P);
    PP.forEach((value => {
        const index = value.i;
        nP[index] = value.v;
    }));
    return nP;
};