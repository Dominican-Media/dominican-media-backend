const { uploadFile } = require("../helpers/uploadToCloudinary");
const { Shows, Seasons, Episodes } = require("../models/Shows");

const handleCreateShow = async (req, res) => {
  try {
    const { description, title } = req.body;
    const files = req.files;

    if (!description || !title) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const imageUpload = files?.image?.[0]
      ? await uploadFile(files.image[0].buffer, "shows")
      : null;

    const [showImage] = await Promise.all([imageUpload]);

    const showImageUrl = showImage?.secure_url || showImage?.url || null;

    const show = new Shows({
      title,
      description,
      image: showImageUrl,
    });

    await show.save();

    return res
      .status(201)
      .json({ message: `Created show '${title}' successfully` });
  } catch (error) {
    console.error("Error creating show:", error);
    return res
      .status(500)
      .json({ error: "There was an error creating this show" });
  }
};

const handleGetShows = async (req, res) => {
  try {
    const shows = await Shows.find();

    return res.status(200).json({ shows });
  } catch (error) {
    console.log("There was an issue retrieving shows:", error);
    res.status(500).json({ error: "There was an issue retrieving show" });
  }
};

const handleUpdateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const files = req.files;

    if (!id) {
      return res.status(400).json({ error: "Id is needed to get this show" });
    }

    const show = await Shows.findById(id);

    if (!show) {
      return res.status(400).json({ error: "This show does not exist" });
    }

    if (title) show.title = title;
    if (description) show.description = description;
    if (files.image) {
      const imageUpload = files?.image?.[0]
        ? await uploadFile(files.image[0].buffer, "shows")
        : null;

      const [showImage] = await Promise.all([imageUpload]);

      const showImageUrl = showImage?.secure_url || showImage?.url || null;

      show.image = showImageUrl;
    }

    await show.save();

    return res
      .status(200)
      .json({ message: `${title || "SHow"} updated successfully `, show });
  } catch (error) {
    console.log("There was an issue updating show:", error);
    res.status(500).json({ error: "There was an issue updating show" });
  }
};

const handleDeleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Id parameter is required." });
    }

    const show = await Shows.findOne({ id });

    if (!show) {
      return res.status(404).json({ error: "Show not found." });
    }

    await Shows.deleteOne({ id });

    return res
      .status(200)
      .json({ message: `Show '${show?.title || ""}' deleted successfully.` });
  } catch (error) {
    console.error("Error deleting show:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete show. Please try again later." });
  }
};

const handleCreateSeason = async (req, res) => {
  try {
    const { episodes, showId } = req.body;

    if (!showId) {
      return res
        .status(400)
        .json({ error: "A show must be attached to a season" });
    }

    if (!Array.isArray(episodes) || episodes.length === 0) {
      return res
        .status(400)
        .json({ error: "Episodes must be a non-empty array" });
    }

    const createdEpisodes = await Episodes.insertMany(episodes);
    const episodeIds = createdEpisodes.map((ep) => ep._id);

    const season = new Seasons({
      showId,
      episodes: episodeIds,
    });

    await season.save();

    await Shows.findByIdAndUpdate(
      showId,
      { $push: { seasons: season._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Season and episodes created successfully",
      season,
      episodes: createdEpisodes,
    });
  } catch (err) {
    console.error("Error creating season:", err);
    return res.status(500).json({
      error: "Failed to create season. Please try again later.",
    });
  }
};

const handleGetSeasons = async (req, res) => {
  try {
    const { showId } = req.params;

    if (!showId) {
      return res.status(400).json({ error: "ShowId is needed" });
    }

    const seasons = await Seasons.find({
      showId,
    }).populate("showId");

    return res.status(200).json({ seasons });
  } catch (err) {
    console.error("Error reterieving sseasons:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve seasons. Please try again later." });
  }
};

const handleDeleteSeason = async (req, res) => {
  try {
    const seasonId = req.params.id;

    const season = await Seasons.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    await Episodes.deleteMany({ _id: { $in: season.episodes } });

    await Seasons.findByIdAndDelete(seasonId);

    await Shows.updateMany(
      { seasons: seasonId },
      { $pull: { seasons: seasonId } }
    );

    return res
      .status(200)
      .json({ message: "Season and its episodes deleted successfully" });
  } catch (error) {
    console.error("Error deleting season:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleAddEpisodesToSeason = async (req, res) => {
  try {
    const seasonId = req.params.id;
    const episodesData = req.body.episodes;

    if (!Array.isArray(episodesData) || episodesData.length === 0) {
      return res.status(400).json({ message: "No episodes provided" });
    }

    const season = await Seasons.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    const newEpisodes = await Episodes.insertMany(episodesData);
    const episodeIds = newEpisodes.map((ep) => ep._id);

    season.episodes.push(...episodeIds);
    await season.save();

    res.status(200).json({
      message: "Episodes added to season successfully",
      season,
      newEpisodes,
    });
  } catch (error) {
    console.error("Error adding episodes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleDeleteEpisodeFromSeason = async (req, res) => {
  try {
    const { seasonId, episodeId } = req.params;

    await Seasons.findByIdAndUpdate(seasonId, {
      $pull: { episodes: episodeId },
    });

    await Episodes.findByIdAndDelete(episodeId);

    res.status(200).json({ message: "Episode deleted from season" });
  } catch (error) {
    console.error("Error deleting episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleUpdateEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const updateData = req.body;

    const updatedEpisode = await Episodes.findByIdAndUpdate(
      episodeId,
      updateData,
      { new: true }
    );

    if (!updatedEpisode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    res
      .status(200)
      .json({ message: "Episode updated", episode: updatedEpisode });
  } catch (error) {
    console.error("Error updating episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleGetEpisodesBySeason = async (req, res) => {
  try {
    const seasonId = req.params.seasonId;

    const season = await Seasons.findById(seasonId).populate({
      path: "episodes",
      select: "-__v",
    });

    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    res.status(200).json({
      seasonId: season._id,
      episodes: season.episodes,
    });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleCreateShow,
  handleGetShows,
  handleUpdateShow,
  handleDeleteShow,
  handleCreateSeason,
  handleGetSeasons,
  handleDeleteSeason,
  handleAddEpisodesToSeason,
  handleDeleteEpisodeFromSeason,
  handleUpdateEpisode,
  handleGetEpisodesBySeason,
};
