const { GuildChannel, ChannelType } = require("discord.js")
const DB = require("../../Structures/Schemas/CounterDB")

module.exports = {
    name: "channelDelete",

    /**
     * 
     * @param {GuildChannel} channel 
     */
    async execute(channel) {
        const { guild } = channel;
        const data = await DB.findOne({ GuildID: guild.id })

        if (!data) return
        if (channel.type === ChannelType.GuildVoice && data.VoiceChannelID && !(channel.id === data.VoiceChannelID)) {
            const vcCount = guild.channels.cache.filter(
                (c) => c.type === ChannelType.GuildVoice
            ).size;

            guild.channels.cache.get(data.VoiceChannelID).setName(`VoiceChannels: ${vcCount}`)
        }

        if (channel.type === ChannelType.GuildText && data.TextChannelID && !(channel.id === data.TextChannelID)) {
            const textCount = guild.channels.cache.filter(
                (c) => c.type === ChannelType.GuildText
            ).size;

            guild.channels.cache.get(data.TextChannelID).setName(`TextChannels: ${textCount}`)
        }

        if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildStageVoice || channel.type === ChannelType.GuildAnnouncement) {
            if (data.TotalChannelID && !(channel.id === data.TotalChannelID)) {
                const channelCount = guild.channels.cache.filter(
                    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildText || c.type === ChannelType.GuildStageVoice || c.type === ChannelType.GuildAnnouncement
                ).size;

                guild.channels.cache.get(data.TotalChannelID).setName(`AllChannels: ${channelCount}`)
            }
        }
    }
}