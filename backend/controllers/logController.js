const handleClusteringLog = (req, res) => {
  try {
    const logData = req.body;

    console.log("[CLUSTERING WORKER LOG]:", JSON.stringify(logData, null, 2));

    res.status(200).json({
      status: "success",
      message: "Log received successfully.",
    });
  } catch (error) {
    console.error("Error handling clustering log:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while processing log.",
    });
  }
};

module.exports = {
  handleClusteringLog,
};
