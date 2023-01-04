const { MessageEmbed, CommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField } = require("discord.js");
const DB = require("../../Structures/Schemas/CounterDB");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status-counter")
        .setDescription("Setup the status counter channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Create a counter channel")
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Select the counter type to be created")
                        .setRequired(true)
                        .addChoices(
                            { name: "Total Members", value: "members" },
                            { name: "Humans", value: "humans" },
                            { name: "Bots", value: "bots" },
                            { name: "Total Channels", value: "channels" },
                            { name: "Voice Channels", value: "voice" },
                            { name: "Text Channels", value: "text" },
                            { name: "Boosts", value: "boost" },
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName("channel-type")
                        .setDescription("The type of channel that the counter should be created of")
                        .setRequired(true)
                        .addChoices(
                            { name: "Voice Channel", value: "GUILD_VOICE" },
                            { name: "Stage Channel", value: "GUILD_STAGE_VOICE" },
                        )
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Remove a counter channel")
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Select the counter type to be deleted")
                        .setRequired(true)
                        .addChoices(
                            { name: "Total Members", value: "members" },
                            { name: "Humans", value: "humans" },
                            { name: "Bots", value: "bots" },
                            { name: "Total Channels", value: "channels" },
                            { name: "Voice Channels", value: "voice" },
                            { name: "Text Channels", value: "text" },
                            { name: "Boosts", value: "boost" },
                        )
                )
        ),

    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { options, guild } = interaction;
        const { members, channels } = guild;

        await interaction.deferReply({ ephemeral: true });

        const SubCommand = options.getSubcommand();

        switch (SubCommand) {
            case "create":
                {
                    const counterType = options.getString("type");
                    let channelType = options.getString("channel-type");

                    if (channelType === "GUILD_VOICE")
                        channelType = ChannelType.GuildVoice
                    else if (channelType === "GUILD_STAGE_VOICE")
                        channelType = ChannelType.GuildStageVoice

                    let data = await DB.findOne({ GuildID: guild.id })
                    if (!data) data = await DB.create({ GuildID: guild.id })

                    if (data.CategoryID) {
                        const category = channels.cache.get(data.CategoryID);
                        if (!category) {
                            await guild.channels
                                .create({
                                    name: `▬▬SERVER STATS▬▬`,
                                    type: ChannelType.GuildCategory,
                                })
                                .then(async (channel) => {
                                    guild.roles.cache.forEach((r) => {
                                        channel.permissionOverwrites.edit(r.id, {
                                            allow: [PermissionsBitField.Flags.ViewChannel]
                                        });
                                    });

                                    data.CategoryID = channel.id;
                                    data.save()
                                });
                        }
                    } else {
                        await guild.channels
                            .create({
                                name: `▬▬SERVER STATS▬▬`,
                                type: ChannelType.GuildCategory,
                            })
                            .then(async (channel) => {
                                guild.roles.cache.forEach((r) => {
                                    channel.permissionOverwrites.edit(r.id, {
                                        allow: [PermissionsBitField.Flags.ViewChannel]
                                    });
                                });

                                data.CategoryID = channel.id;
                                data.save()
                            });
                    }

                    switch (counterType) {
                        case "humans":
                            {
                                const humanCount = members.cache.filter(
                                    (m) => !m.user.bot
                                ).size;

                                if (data.HumansChannelID) return interaction.editReply({ content: "This server already has a humans counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Humans: ${humanCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { HumansChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content:
                                                "Successfully created the Humans counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                        case "bots":
                            {
                                const botCount = members.cache.filter((m) => m.user.bot).size;

                                if (data.BotChannelID) return interaction.editReply({ content: "This server already has a bot counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Bots: ${botCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { BotChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content: "Successfully created the Bot counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                        case "members":
                            {
                                const memberCount = guild.memberCount;

                                if (data.TotalMembersChannelID) return interaction.editReply({ content: "This server already has a total member counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Members: ${memberCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { TotalMembersChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content:
                                                "Successfully created the Total Members counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                        case "voice":
                            {
                                const vcCount = channels.cache.filter(
                                    (c) => c.type === ChannelType.GuildVoice
                                ).size;

                                if (data.VoiceChannelID) return interaction.editReply({ content: "This server already has a voice channel counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Voice Channels: ${vcCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { VoiceChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content:
                                                "Successfully created the Voice Channel counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                        case "text":
                            {
                                const textCount = channels.cache.filter(
                                    (c) => c.type === ChannelType.GuildText
                                ).size;

                                if (data.TextChannelID) return interaction.editReply({ content: "This server already has a text channel counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Text Channels: ${textCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { TextChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content:
                                                "Successfully created the Text Channel counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                        case "channels":
                            {
                                const channelCount = channels.cache.filter(
                                    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildText || c.type === ChannelType.GuildStageVoice || c.type === ChannelType.GuildAnnouncement
                                ).size;

                                if (data.TotalChannelID) return interaction.editReply({ content: "This server already has a Total Channels counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Total Channels: ${channelCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { TotalChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content:
                                                "Successfully created the Total Channels counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                        case "boost":
                            {
                                const boostCount = guild.premiumSubscriptionCount;

                                if (data.BoostsChannelID) return interaction.editReply({ content: "This server already has a boost counter setup first remove it" })

                                await guild.channels
                                    .create({
                                        name: `Boosts: ${boostCount}`,
                                        type: channelType,
                                        parent: data.CategoryID,
                                    })
                                    .then(async (channel) => {
                                        guild.roles.cache.forEach((r) => {
                                            channel.permissionOverwrites.edit(r.id, {
                                                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect],
                                                allow: [PermissionsBitField.Flags.ViewChannel]
                                            });
                                        });

                                        await DB.findOneAndUpdate(
                                            { GuildID: guild.id },
                                            { BoostsChannelID: channel.id },
                                            { new: true, upsert: true }
                                        );

                                        await interaction.editReply({
                                            content:
                                                "Successfully created the Boosts counter channel",
                                            ephemeral: true,
                                        });
                                    });
                            }
                            break;
                    }
                }
                break;
            case "remove":
                {
                    const counterType = options.getString("type");

                    const data = await DB.findOne({ GuildID: guild.id });
                    if (!data)
                        return interaction.editReply({
                            content:
                                "There are no counter channels setup by this bot in this server. First set it up pls",
                        });

                    if (!data.CategoryID) return

                    const category = channels.cache.get(data.CategoryID);
                    if (!category) {
                        await DB.deleteOne({ GuildID: guild.id })
                        return interaction.editReply({
                            content: "I can't find the original category channel you will have to delete the channels manually"
                        })
                    }


                    switch (counterType) {
                        case "humans":
                            {
                                if (!data.HumansChannelID)
                                    return interaction.editReply({
                                        content: "This server does not have a humans counter setup",
                                    });

                                const channel = channels.cache.get(data.HumansChannelID);
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { HumansChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content: "Successfully removed the human counter channel",
                                });

                            }
                            break;
                        case "bots":
                            {
                                if (!data.BotChannelID)
                                    return interaction.editReply({
                                        content: "This server does not have a bot counter setup",
                                    });

                                const channel = channels.cache.get(data.BotChannelID);
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { BotChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content: "Successfully removed the bot counter channel",
                                });

                            }
                            break;
                        case "members":
                            {
                                if (!data.TotalMembersChannelID)
                                    return interaction.editReply({
                                        content:
                                            "This server does not have a Total Members counter setup",
                                    });

                                const channel = channels.cache.get(
                                    data.TotalMembersChannelID
                                );
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { TotalMembersChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content:
                                        "Successfully removed the Total Members counter channel",
                                });

                            }
                            break;
                        case "voice":
                            {
                                if (!data.VoiceChannelID)
                                    return interaction.editReply({
                                        content:
                                            "This server does not have a voice channel counter setup",
                                    });

                                const channel = channels.cache.get(data.VoiceChannelID);
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { VoiceChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content:
                                        "Successfully removed the voice channel counter channel",
                                });

                            }
                            break;
                        case "text":
                            {
                                if (!data.TextChannelID)
                                    return interaction.editReply({
                                        content:
                                            "This server does not have a text channel counter setup",
                                    });

                                const channel = channels.cache.get(data.TextChannelID);
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { TextChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content:
                                        "Successfully removed the text channel counter channel",
                                });

                            }
                            break;
                        case "channels":
                            {
                                if (!data.TotalChannelID)
                                    return interaction.editReply({
                                        content:
                                            "This server does not have a Total Channel counter setup",
                                    });

                                const channel = channels.cache.get(data.TotalChannelID);
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { TotalChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content:
                                        "Successfully removed the Total Channel counter channel",
                                });

                            }
                            break;
                        case "boost":
                            {
                                if (!data.BoostsChannelID)
                                    return interaction.editReply({
                                        content: "This server does not have a boost counter setup",
                                    });

                                const channel = channels.cache.get(data.BoostsChannelID);
                                if (channel) await channel.delete();

                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { BoostsChannelID: null },
                                    { upsert: true }
                                );

                                return interaction.editReply({
                                    content: "Successfully removed the boost counter channel",
                                });

                            }
                            break;
                    }
                }
                break;
        }
    },
};
