const { GuildMember } = require("discord.js")
const DB = require("../../Structures/Schemas/CounterDB")

module.exports = {
    name: "guildMemberUpdate",

    /**
     * 
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     */
    async execute(oldMember, newMember) {
        const { guild } = newMember;
        const data = await DB.findOne({ GuildID: guild.id })

        if (!data) return;

        if (data.BoostsChannelID) {
            if (!oldMember.premiumSince && newMember.premiumSince) {
                const boostCount = guild.premiumSubscriptionCount

                guild.channels.cache.get(data.BoostsChannelID).setName(`Boosts: ${boostCount}`)
            }
        }


    }
}