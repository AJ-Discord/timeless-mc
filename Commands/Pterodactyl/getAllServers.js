const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const { pagination } = require("../../Structures/Functions")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("get-all-servers")
        .setDescription("Gives a list of users registered on the panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {
        interaction.deferReply({ ephemeral: true })

        client.panel
            .getAllServers()
            .then((docs) => {
                const pages = docs.data.map(doc => {
                    const { attributes } = doc

                    const id = attributes.id
                    const name = attributes.name
                    const cpu = attributes.limits.cpu == 0 ? "unlimited cpu" : attributes.limits.cpu
                    const ram = `${attributes.limits.memory / 1024} GB`
                    const disk = attributes.limits.disk == 0 ? "unlimited storage" : `${attributes.limits.disk / 1024} GB`
                    const database = attributes.feature_limits.databases
                    const backups = attributes.feature_limits.backups
                    const allocations = attributes.feature_limits.allocations

                    const description = [
                        `ID: ${id}`,
                        `Ram: ${ram}`,
                        `Storage Space: ${disk}`,
                        `No. of CPU cores: ${cpu}`,
                        `No. of Database: ${database}`,
                        `No. of Allocations: ${allocations}`,
                        `No. of Backups: ${backups}`
                    ].join("\n");

                    return {
                        title: `${name} Server's Info`,
                        description: description,
                    };
                });

                if (!(pages?.length > 0))
                    return interaction.editReply({ embeds: new EmbedBuilder().setTitle(`Oops!! There seems to be trouble`).setDescription(`There was an issue searching for users please make a try after a few minutes if the issue persists contact the developer`).setColor("Red"), ephemeral: true });

                pagination(interaction, pages, (ephemeral = true))
            })
            .catch((err) => {
                console.log(err)
                interaction.editReply({
                    content: "An error occurred while executing this command",
                    ephemeral: true,
                });
            });

    },
};
