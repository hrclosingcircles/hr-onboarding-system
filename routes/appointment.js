const express = require("express");
const router = express.Router();
const generateAppointmentLetter = require("../services/appointment");

router.get("/:offer_id", (req, res) => {
  const { offer_id } = req.params;

  generateAppointmentLetter(offer_id, (err, filePath) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.download(filePath);
  });
});

module.exports = router;