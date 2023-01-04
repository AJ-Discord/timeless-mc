const { Collection } = require("discord.js");
const emoji = require("../emojis.json");

const Nodeactyl = require('nodeactyl');
const application = new Nodeactyl.NodeactylApplication(process.env.panelAddress, process.env.panelToken);

async function loadCollections(client) {
  client.events = new Collection();
  client.commands = new Collection();
  client.devCommands = new Collection();
  client.developers = process.env.developer_ids;
  client.buttons = new Collection();
  client.selectMenus = new Collection();
  client.modals = new Collection();
  client.emotes = emoji;
  client.panel = application;
}

module.exports = { loadCollections };
