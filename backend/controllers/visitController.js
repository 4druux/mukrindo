// controllers/visitController.js
const TrackingVisit = require("../models/TrackingVisit");
const { v4: uuidv4 } = require("uuid");
const {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
} = require("date-fns");

const VISITOR_COOKIE_NAME =
  process.env.VISITOR_COOKIE_NAME || "mukrindo_visitor_id";

// Fungsi untuk tracking visit (tidak berubah)
exports.trackHomepageVisit = async (req, res) => {
  try {
    let visitorId = req.cookies[VISITOR_COOKIE_NAME];
    let isNewVisitor = false;

    if (!visitorId) {
      visitorId = uuidv4();
      isNewVisitor = true;
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

    const updatedVisitEntry = await TrackingVisit.findOneAndUpdate(
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

    res.status(isNewVisitor ? 201 : 200).json({
      message: `Homepage visit ${
        isNewVisitor ? "tracked" : "updated"
      } successfully`,
      visitorId: updatedVisitEntry.visitorCookieId,
    });
  } catch (error) {
    console.error("Error tracking/updating homepage visit:", error);
    res.status(500).json({
      message: "Internal server error while tracking/updating visit",
      error: error.message,
    });
  }
};

// Fungsi untuk get stats (tidak berubah)
exports.getHomepageVisitStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const prevMonthDate = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    const countUniqueVisitors = async (matchQuery = {}) => {
      const result = await TrackingVisit.aggregate([
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
    res.status(500).json({
      message: "Internal server error while fetching stats",
      error: error.message,
    });
  }
};

exports.getHomepageVisitHistory = async (req, res) => {
  try {
    const { period = "daily" } = req.query;
    const now = new Date();
    let startDate, groupBy;

    // Atur range tanggal berdasarkan period
    switch (period) {
      case "weekly":
        startDate = subWeeks(now, 4);
        groupBy = {
          week: { $week: "$visitTimestamp" },
          year: { $year: "$visitTimestamp" },
        };
        break;
      case "monthly":
        startDate = subMonths(now, 12);
        groupBy = {
          month: { $month: "$visitTimestamp" },
          year: { $year: "$visitTimestamp" },
        };
        break;
      case "yearly":
        startDate = subYears(now, 5);
        groupBy = { year: { $year: "$visitTimestamp" } };
        break;
      default: // daily
        startDate = subDays(now, 7);
        groupBy = {
          day: { $dayOfMonth: "$visitTimestamp" },
          month: { $month: "$visitTimestamp" },
          year: { $year: "$visitTimestamp" },
        };
    }

    const visits = await TrackingVisit.aggregate([
      {
        $match: {
          visitTimestamp: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: "$visitTimestamp" },
        },
      },
      { $sort: { date: 1 } },
      {
        $project: {
          _id: 0,
          timestamp: "$date",
          count: 1,
          date: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$date",
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      period,
      data: visits.map((v) => ({
        ...v,
        date: new Date(v.timestamp).toISOString(),
        visits: v.count,
      })),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
