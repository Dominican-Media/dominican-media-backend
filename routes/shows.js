const express = require("express");
const {
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
} = require("../controllers/shows.controller");
const { verifyToken, isPresenter, isAdmin } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Seasons
router.post(
  "/shows",
  verifyToken,
  isPresenter,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleCreateShow
);

router.get("/shows", handleGetShows);

router.patch(
  "/shows/:id",
  verifyToken,
  isPresenter,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleUpdateShow
);

router.delete("/shows/:id", verifyToken, isAdmin, handleDeleteShow);

router.post("/shows/seasons", verifyToken, isAdmin, handleCreateSeason);

router.get("/shows/seasons/:showId", handleGetSeasons);

router.delete("/shows/seasons/:id", verifyToken, isAdmin, handleDeleteSeason);

router.patch(
  "/shows/seasons/episodes/:id",
  verifyToken,
  isPresenter,
  handleAddEpisodesToSeason
);

router.delete(
  "/shows/seasons/episodes/:seasonId/:episodeId",
  verifyToken,
  handleDeleteEpisodeFromSeason
);

router.get("/shows/seasons/episodes/:seasonId", handleGetEpisodesBySeason);

module.exports = router;
