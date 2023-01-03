const { model, Schema } = require("mongoose");

module.exports = model(
    "McServerStatsDB",
    new Schema({
        GuildID: String,
        Platform: String,
        ServerName: String,
        ChannelID: String,
        IP: String,
        Port: Number,
        MessageID: String,
    })
)