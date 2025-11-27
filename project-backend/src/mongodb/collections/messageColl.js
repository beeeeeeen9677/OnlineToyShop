import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Message from "../models/Message.js";

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const HK_TIMEZONE = "Asia/Hong_Kong";

export const getMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).lean().exec();

    // Convert timestamps from UTC to HK timezone
    const messagesWithHKTime = messages.map((msg) => ({
      ...msg,
      timestamp: dayjs(msg.timestamp)
        .tz(HK_TIMEZONE)
        .format("YYYY-MM-DDTHH:mm:ss"),
    }));

    res.json(messagesWithHKTime);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
};
