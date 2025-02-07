if (process.versions.electron) {
  module.exports = require("./main/electron");
} else {
  module.exports = require("./main/node");
}