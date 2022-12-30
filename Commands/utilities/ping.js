const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("wil respond with pong"),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    return interaction.reply({ content: "pong", ephemeral: true });
  },
};
