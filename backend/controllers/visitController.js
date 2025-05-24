// backend/controllers/visitController.js
const TrackingVisit = require("../models/trackingVisit"); //
const { v4: uuidv4 } = require("uuid"); //
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
  process.env.VISITOR_COOKIE_NAME || "mukrindo_visitor_id"; //

exports.trackHomepageVisit = async (req, res) => {
  //
  try {
    let visitorId = req.cookies[VISITOR_COOKIE_NAME];
    let isNewVisitorSession = false;
    let httpStatus = 200;

    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const now = new Date();

    if (!visitorId) {
      visitorId = uuidv4();
      isNewVisitorSession = true;
      httpStatus = 201;
      res.cookie(VISITOR_COOKIE_NAME, visitorId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      await TrackingVisit.create({
        visitorCookieId: visitorId,
        visitTimestamp: now,
        ipAddress: ipAddress,
        userAgent: userAgent,
      });
    } else {
      const lastVisit = await TrackingVisit.findOne({
        visitorCookieId: visitorId,
      }).sort({ visitTimestamp: -1 });
      let shouldUpdateTimestamp = true;

      if (lastVisit) {
        const lastVisitDayStart = startOfDay(lastVisit.visitTimestamp);
        const currentDayStart = startOfDay(now);

        if (lastVisitDayStart.getTime() === currentDayStart.getTime()) {
          shouldUpdateTimestamp = false;
        } else {
          isNewVisitorSession = true;
        }
      } else {
        isNewVisitorSession = true;
        httpStatus = 201;
      }
      const updateData = {
        ipAddress: ipAddress,
        userAgent: userAgent,
      };
      if (shouldUpdateTimestamp) {
        updateData.visitTimestamp = now;
      }
      await TrackingVisit.findOneAndUpdate(
        { visitorCookieId: visitorId },
        { $set: updateData },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }
    res.status(httpStatus).json({
      message: `Homepage visit ${
        isNewVisitorSession
          ? "tracked (new session/day or new visitor)"
          : "acknowledged (same day session)"
      } successfully`,
      visitorId: visitorId,
    });
  } catch (error) {
    console.error("Error tracking/updating homepage visit:", error);
    res.status(500).json({
      message: "Internal server error while tracking/updating visit",
      error: error.message,
    });
  }
};

exports.getHomepageVisitStats = async (req, res) => {
  //
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now); // Pastikan startOfMonth diimpor
    const currentMonthEnd = endOfMonth(now); // Pastikan endOfMonth diimpor

    const prevMonthDate = subMonths(now, 1); // Pastikan subMonths diimpor
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
  //
  try {
    const { period = "daily" } = req.query;
    const now = new Date();
    let startDate, groupByFormat, dateFieldForGroup;

    switch (period) {
      case "weekly":
        startDate = subWeeks(now, 4); // Pastikan subWeeks diimpor
        groupByFormat = {
          year: { $year: "$visitTimestamp" },
          week: { $isoWeek: "$visitTimestamp" },
        };
        dateFieldForGroup = {
          $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week" },
        };
        break;
      case "monthly":
        startDate = subMonths(now, 12); // Pastikan subMonths diimpor
        groupByFormat = {
          year: { $year: "$visitTimestamp" },
          month: { $month: "$visitTimestamp" },
        };
        dateFieldForGroup = {
          $dateFromParts: { year: "$_id.year", month: "$_id.month" },
        };
        break;
      case "yearly":
        startDate = subYears(now, 5); // Pastikan subYears diimpor
        groupByFormat = { year: { $year: "$visitTimestamp" } };
        dateFieldForGroup = { $dateFromParts: { year: "$_id.year" } };
        break;
      default: // daily
        startDate = subDays(now, 7); // Pastikan subDays diimpor
        groupByFormat = {
          year: { $year: "$visitTimestamp" },
          month: { $month: "$visitTimestamp" },
          day: { $dayOfMonth: "$visitTimestamp" },
        };
        dateFieldForGroup = {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        };
    }

    const visits = await TrackingVisit.aggregate([
      {
        $match: {
          // Pastikan startOfDay dan endOfDay diimpor jika Anda ingin menggunakannya di sini
          visitTimestamp: { $gte: startOfDay(startDate), $lte: endOfDay(now) },
        },
      },
      {
        $group: {
          _id: groupByFormat,
          uniqueVisitors: { $addToSet: "$visitorCookieId" },
          firstVisitTimestampInPeriod: { $min: "$visitTimestamp" },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$firstVisitTimestampInPeriod",
            },
          },
          visits: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({
      success: true,
      period,
      data: visits.map((v) => ({
        date: v.date,
        visits: v.visits,
      })),
    });
  } catch (error) {
    console.error("Error fetching visit history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
