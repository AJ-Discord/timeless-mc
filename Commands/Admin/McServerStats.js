const { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const mc_util = require("minecraft-server-util");
const DB = require("../../Structures/Schemas/McServerStatsDB")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mc-stats-setup")
        .setDescription("Setup a self updating Minecraft Server Status System")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("platform")
                .setDescription("Select the base platform of the server")
                .setRequired(true)
                .addChoices(
                    { name: "Minecraft Java", value: "java" },
                    { name: "Minecraft Bedrock/Pocket Edition", value: "bedrock" },
                )
        )
        .addStringOption(option =>
            option
                .setName("server-name")
                .setDescription("The name of the minecraft server that should be displayed in the message")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to send the status of the server to")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option
                .setName("ip")
                .setDescription("The ip of the minecraft server you want the status of")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName("port")
                .setDescription("The port of the server if there is no port leave it as it is")
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options } = interaction;

        interaction.deferReply({ ephemeral: true });

        let Options = {
            timeout: 10000,
        };

        const platform = options.getString("platform");
        const server_name = options.getString("server-name");
        const channel = options.getChannel("channel");
        const ip = options.getString("ip");
        let port = options.getNumber("port");

        const Embed = new EmbedBuilder()
        switch (platform) {
            case "java":
                {
                    if (!port) port = 25565;
                    if (ip.length < 2) {
                        Embed.setColor("Red");
                        Embed.setTitle("Error!");
                        Embed.setDescription("Expected ip to have a length greater than 2");

                        return interaction.editReply({
                            embeds: [Embed],
                        });
                    }

                    await mc_util
                        .statusLegacy(ip, port, Options)
                        .then(async () => {
                            Embed.setColor("Green").setDescription(
                                "Please Wait The Bot is fetching the status... it may take upto 20 seconds."
                            );

                            const message = await guild.channels.cache
                                .get(channel.id)
                                .send({ embeds: [Embed], fetchReply: true });

                            Embed.setDescription("Successfully generated the status message");
                            await interaction.editReply({ embeds: [Embed] });

                            await DB.create({
                                GuildID: guild.id,
                                Platform: "java",
                                ServerName: server_name,
                                ChannelID: channel.id,
                                IP: ip,
                                Port: port,
                                MessageID: message.id,
                            });
                        })
                        .catch(async (error) => {
                            if (error.code === "ENOTFOUND") {
                                Embed.setColor("Red");
                                Embed.setTitle("Error!");
                                Embed.setDescription("You provided a invalid ip/port!");

                                return interaction.editReply({
                                    embeds: [Embed],
                                });
                            }

                            Embed.setColor("Red");
                            Embed.setTitle("An Error Occurred! Please try again later");
                            Embed.description = "```" + error + "```";

                            return await interaction.editReply({ embeds: [Embed] });
                        });
                }
                break;
            case "bedrock":
                {
                    if (!port) port = 19132;
                    if (ip.length < 2) {
                        Embed.setColor("Red");
                        Embed.setTitle("Error!");
                        Embed.setDescription("Expected ip to have a length greater than 2");

                        return interaction.editReply({
                            embeds: [Embed],
                        });
                    }

                    await mc_util
                        .statusBedrock(ip, port, Options)
                        .then(async () => {
                            Embed.setColor("Green").setDescription(
                                "Please Wait The Bot is fetching the status... it may take upto 20 seconds."
                            );

                            const message = await guild.channels.cache
                                .get(channel.id)
                                .send({ embeds: [Embed], fetchReply: true });

                            Embed.setDescription("Successfully generated the status message");
                            await interaction.editReply({ embeds: [Embed] });

                            await DB.create({
                                GuildID: guild.id,
                                Platform: "bedrock",
                                ServerName: server_name,
                                ChannelID: channel.id,
                                IP: ip,
                                Port: port,
                                MessageID: message.id,
                            });
                        })
                        .catch(async (error) => {
                            if (error.code === "ENOTFOUND") {
                                Embed.setColor("Red");
                                Embed.setTitle("Error!");
                                Embed.setDescription("You provided a invalid ip/port!");

                                return interaction.editReply({
                                    embeds: [Embed],
                                });
                            }

                            Embed.setColor("Red");
                            Embed.setTitle("An Error Occurred! Please try again later");
                            Embed.description = "```" + error + "```";

                            return interaction.editReply({ embeds: [Embed] });
                        });
                }
                break;
        }

    }
}
