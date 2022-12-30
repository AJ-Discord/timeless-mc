const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    Client,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register-user")
        .setDescription("adds a user to the pterodactyl panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("email")
                .setDescription("email id of the user to be registered")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("username")
                .setDescription("username of the user to be registered")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("first-name")
                .setDescription("first-name of the user to be registered")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("last-name")
                .setDescription("last-name of the user to be registered")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("password")
                .setDescription("password of the user to be registered")
                .setRequired(true)
        ),

    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {

        const { options } = interaction;

        const email = options.getString("email")
        const username = options.getString("username")
        const first_name = options.getString("first-name")
        const last_name = options.getString("last-name")
        const password = options.getString("password")

        client.panel.createUser(email, username, first_name, last_name, password)
            .then(response => {
                return interaction.reply({ content: `Successfully registered ${username} onto the panel`, ephemeral: true });
            })
            .catch(error => {
                console.log(error);
                return interaction.reply({ content: `Error Registering ${username} onto the panel`, ephemeral: true });
            })


    },
};
