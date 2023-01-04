const { GuildMember } = require("discord.js")
const DB = require("../../Structures/Schemas/CounterDB")

module.exports = {
    name: "guildMemberAdd",

    /**
     * 
     * @param {GuildMember} member 
     */
    async execute(member) {
        const { guild } = member;
        const data = await DB.findOne({ GuildID: guild.id })

        if (!data) return;

        if (!member.bot && data.HumansChannelID) {
            const humanCount = guild.members.cache.filter(
                (m) => !m.user.bot
            ).size;

            guild.channels.cache.get(data.HumansChannelID).setName(`Humans: ${humanCount}`)
        }

        if (member.bot && data.BotChannelID) {
            const botCount = guild.members.cache.filter((m) => m.user.bot).size;

            guild.channels.cache.get(data.BotChannelID).setName(`Bots: ${botCount}`)
        }

        if (data.TotalMembersChannelID) {
            const memberCount = guild.memberCount;

            guild.channels.cache.get(data.TotalMembersChannelID).setName(`Members: ${memberCount}`)
        }
    }
}