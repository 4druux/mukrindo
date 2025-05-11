// controllers/visitController.js
const trackingVisit = require("../models/trackingVisit");
const { v4: uuidv4 } = require("uuid");
const { startOfMonth, endOfMonth, subMonths } = require("date-fns");

const VISITOR_COOKIE_NAME =
  process.env.VISITOR_COOKIE_NAME || "mukrindo_visitor_id";

exports.trackHomepageVisit = async (req, res) => {
  try {
    let visitorId = req.cookies[VISITOR_COOKIE_NAME];

    if (!visitorId) {
      visitorId = uuidv4();
      res.cookie(VISITOR_COOKIE_NAME, visitorId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const updatedVisitEntry = await trackingVisit.findOneAndUpdate(
      { visitorCookieId: visitorId },
      {
        $set: {
          ipAddress: ipAddress,
          userAgent: userAgent,
          visitTimestamp: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Homepage visit tracked/updated successfully",
      visitorId: updatedVisitEntry.visitorCookieId,
    });
  } catch (error) {
    console.error("Error tracking/updating homepage visit:", error);
    res
      .status(500)
      .json({ message: "Internal server error while tracking/updating visit" });
  }
};

// Fungsi untuk mendapatkan statistik kunjungan  dashboard admin
exports.getHomepageVisitStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const prevMonthDate = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    const countUniqueVisitors = async (matchQuery = {}) => {
      const result = await trackingVisit.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$visitorCookieId" } },
        { $count: "uniqueCount" },
      ]);
      return result.length > 0 ? result[0].uniqueCount : 0;
    };

    const totalUniqueVisitorsOverall = await countUniqueVisitors({});

    const uniqueVisitorsThisMonth = await countUniqueVisitors({
      visitTimestamp: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const uniqueVisitorsLastMonth = await countUniqueVisitors({
      visitTimestamp: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });

    res.status(200).json({
      totalUniqueVisitorsOverall,
      uniqueVisitorsThisMonth,
      uniqueVisitorsLastMonth,
    });
  } catch (error) {
    console.error("Error fetching homepage visit stats:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching stats" });
  }
};
