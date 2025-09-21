const mongoose = require("mongoose");

const EpisodesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: false, default: "published" },
});

const SeasonSchema = new mongoose.Schema({
  showId: { type: String, required: true },
  episodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episodes",
      required: true,
    },
  ],
});

const ShowsSchema = new mongoose.Schema({
  image: { type: String, required: true },
  description: { type: String, required: true },
  title: { type: String, required: true },
  seasons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seasons" }],
});

module.exports = {
  Shows: mongoose.model("Shows", ShowsSchema),
  Episodes: mongoose.model("Episodes", EpisodesSchema),
  Seasons: mongoose.model("Seasons", SeasonSchema),
};
