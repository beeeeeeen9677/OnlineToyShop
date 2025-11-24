import { useEffect, useRef } from "react";
export const useAutoScroll = (
  msg: { senderId: string; message: string; timestamp: string }[]
) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerElem = messageContainerRef.current;
    if (containerElem) {
      containerElem.scrollTo({
        top: containerElem.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [msg]);

  return messageContainerRef;
};

//import { useEffect, useRef, type DependencyList } from "react";
/*
export const useAutoScroll = (dependencies: DependencyList) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerElem = messageContainerRef.current;
    if (containerElem) {
      containerElem.scrollTo({
        top: containerElem.scrollHeight,
        behavior: "smooth",
      });
    }
  }, dependencies);

  return messageContainerRef;
};
*/
