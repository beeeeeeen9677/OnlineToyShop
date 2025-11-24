import { useTranslation } from "../../i18n/hooks";
import React, { useEffect } from "react";
import io from "socket.io-client";
import { useUserContext } from "../../context/app";
import ChatMessage from "./ChatMessage";
import { useAutoScroll } from "../../hooks/useAutoScroll";

const socket = io(import.meta.env.VITE_SERVER_URL);

function CsChatWindow() {
  const { t } = useTranslation("chat");
  const user = useUserContext();
  const maxMessageLength = 300;

  const [chatRecords, setChatRecords] = React.useState<
    Array<{
      senderId: string;
      message: string;
      timestamp: string;
    }>
  >([]);
  const [inputMessage, setInputMessage] = React.useState("");

  const messageContainerRef = useAutoScroll(chatRecords);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatRecords((prev) => [...prev, data]);
      //console.log("Message received:", data);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  if (!user) return <div>User not exist</div>;

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socket.emit("send_message", {
        senderId: user._id,
        message: inputMessage,
        timestamp: new Date().toISOString(),
      });
      setInputMessage("");
    }
  };

  return (
    <div className="bg-gray-400 flex-1 flex flex-col  ">
      <h1 className="text-center">Chat Room</h1>
      <div
        ref={messageContainerRef}
        className="border-2 border-[#ccc] p-2 overflow-y-auto flex-1 space-y-3"
      >
        {chatRecords.map((msg, index) => {
          // show same date once
          const currentDate = msg.timestamp.split("T")[0];
          const previousDate =
            index > 0 ? chatRecords[index - 1].timestamp.split("T")[0] : null;
          const showDate = currentDate !== previousDate;

          return (
            <React.Fragment key={index}>
              {showDate && (
                <div className="bg-white text-black text-xs w-fit mx-auto p-0.75 rounded-lg">
                  {currentDate}
                </div>
              )}
              <ChatMessage
                userId={user._id}
                isSender={msg.senderId === user._id}
                message={msg.message}
                timestamp={msg.timestamp}
              />
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-end">
        <div className="flex-1 relative m-1">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t("placeholders.typeMessage")}
            maxLength={maxMessageLength}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent newline
                sendMessage();
              }
            }}
            className="w-full overflow-auto resize-none field-sizing-content wrap-anywhere p-2 pb-6 border rounded text-gray-700 max-h-40 bg-white"
          />
          <span className="absolute bottom-2 right-6 text-xs text-gray-500">
            {inputMessage.length}/{maxMessageLength}
          </span>
        </div>

        <button
          onClick={sendMessage}
          className="cursor-pointer p-2 bg-primary text-white rounded-2xl m-1"
        >
          {t("buttons.send")}
        </button>
      </div>
    </div>
  );
}

export default CsChatWindow;
