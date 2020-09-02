module.exports = (app) => {
  const mongoose = require("mongoose");
  mongoose.connect("mongodb://localhost:27017/node-vue-wz", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
