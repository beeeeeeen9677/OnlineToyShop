type ChatMessageProps = {
  isSender: boolean;
  message: string;
};

function ChatMessage({ isSender, message }: ChatMessageProps) {
  return (
    <div
      className={`${
        isSender ? "bg-green-300 ml-auto" : "bg-white mr-auto"
      } text-black rounded-2xl p-2 w-fit`}
    >
      {message}
    </div>
  );
}

export default ChatMessage;
