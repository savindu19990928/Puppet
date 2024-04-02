const { defineConfig } = require("cypress");
const mongoose = require('mongoose');

module.exports = defineConfig({
  experimentalSessionAndOrigin: true,
  experimentalModifyObstructiveThirdPartyCode: true,
  watchForFileChanges: false,

  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        getDynamicEntries: async (pageurl) => {
          const uri = 'mongodb+srv://ssw1naruto:Devrious45Uzumaki@cluster0.02z5qpg.mongodb.net/puppet?retryWrites=true&w=majority&appName=Cluster0';
          await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
          const db = mongoose.connection.useDb('puppet');
          const Collection = db.collection('links');
          return await Collection.find({ page_url: pageurl, uploaded: true }).toArray();
        },
      });
    },
  },
});
