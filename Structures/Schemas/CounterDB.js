const { model, Schema } = require("mongoose");

module.exports = model(
    "CounterDB",
    new Schema({
        GuildID: String,
        CategoryID: String,
        HumansChannelID: String,
        BotChannelID: String,
        TotalMembersChannelID: String,
        VoiceChannelID: String,
        TextChannelID: String,
        TotalChannelID: String,
        BoostsChannelID: String,
    })
);
