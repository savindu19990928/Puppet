const { defineConfig } = require("cypress");
const mongoose = require('mongoose');
const { exec } = require('child_process');

module.exports = defineConfig({
  experimentalSessionAndOrigin: true,
  experimentalModifyObstructiveThirdPartyCode: true,
  watchForFileChanges: false,
  experimentalTaskParallelization: true,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  chromeWebSecurity: false,

  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        getDynamicEntries: async (pageurl) => {
          const uri = 'mongodb+srv://ssw1naruto:Devrious45Uzumaki@cluster0.02z5qpg.mongodb.net/puppet?retryWrites=true&w=majority&appName=Cluster0';
          await mongoose.connect(uri);
          const db = mongoose.connection.useDb('puppet');
          const Collection = db.collection('links');
          return await Collection.find({ page_url: pageurl, uploaded: false }).limit(100).toArray();
        },
        updateDynamicEntry: async (data) => {
          const iD = JSON.stringify(data.videoID);
          const resultID = iD.substring(1, iD.length - 1);
          exec(`curl -X POST -H "Content-Type: application/json" http://localhost:3000/deletevideo/${resultID}`, (err, stdout, stderr) => {
            if (err) {
              console.error(err);
            } else {
              console.log(stdout);
            }
          });
          return "Done!"
        }
      });
    },
  },
});
