const { defineConfig } = require("cypress");

module.exports = defineConfig({
  experimentalSessionAndOrigin: true,
  experimentalModifyObstructiveThirdPartyCode: true,
  watchForFileChanges: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
