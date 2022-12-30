const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const page = require("../../Structures/Functions/pagination")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("get-all-users")
        .setDescription("It will return a list of users registered on the panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {
        client.panel
            .getAllUsers()
            .then((docs) => {
                const pages = docs.data.map(doc => {
                    const { attributes } = doc

                    const username = attributes.username
                    const email = attributes.email
                    const first_name = attributes.first_name
                    const last_name = attributes.last_name
                    const id = attributes.id

                    const description = [
                        `ID: ${id}`,
                        `Email ID: ${email}`,
                        `First Name: ${first_name}`,
                        `Last Name: ${last_name}`
                    ].join("\n");

                    return {
                        title: `${username}'s Info`,
                        description: description,
                    };
                });

                if (!(pages?.length > 0))
                    return interaction.reply({ embeds: new EmbedBuilder().setTitle(`Oops!! There seems to be trouble`).setDescription(`There was an issue searching for users please make a try after a few minutes if the issue persists contact the developer`).setColor("Red"), ephemeral: true });

                page(interaction, pages, (ephemeral = true))
            })
            .catch((err) => {
                console.log(err)
                interaction.reply({
                    content: "An error occurred while executing this command",
                    ephemeral: true,
                });
            });

    },
};
