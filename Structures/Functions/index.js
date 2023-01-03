const { loadCollections } = require("./collectionLoader");
const { loadHandlers } = require("../Handlers");
const { loadSystems } = require("./systemLoader");
const { pagination } = require("./pagination")

async function loadFunctions(client) {
  loadCollections(client);
  loadHandlers(client);
  loadSystems(client);
}

module.exports = { loadFunctions, pagination };
