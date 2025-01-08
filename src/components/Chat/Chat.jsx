"use client"

import React, { useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import Source from "../Source/Source";
import Answer from "../Answer/Answer";
import Actions from "../Actions/Actions";
import Prompt from "../Prompt/Prompt";
import Chat404 from "../Chat404/Chat404";
import ChatFetch from "../ChatFetch/ChatFetch";
import { useDispatch } from "react-redux";
import {
  addChat,
  updateDictionary,
  updateMode,
  updateSearch,
  updateStock,
  updateWeather,
} from "@/store/chatSlice";
import { generateCitations } from "../../utils/utils";
import { handleMode } from "../../utils/api";

import useChatFetch from "@/hooks/useChatFetch";
import useChatFork from "@/hooks/useChatFork";
import useChatRetry from "@/hooks/useChatRetry";
import useChatAnswer from "@/hooks/useChatAnswer";

const Chat = ({ id }) => {
  const dispatch = useDispatch();
  const { chatThread, isFetching } = useChatFetch(id);
  const { handleFork } = useChatFork(id);
  const { handleRetry } = useChatRetry();

  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [errorFunction, setErrorFunction] = useState(null);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatThread?.chats]);

  const { handleAnswer, handleRewrite, handleCancel } = useChatAnswer({
    threadId: id,
    chatThread,
    setError,
    setErrorFunction,
    setIsStreaming,
    setIsLoading,
    setIsCompleted,
  });

  const lastProcessedChatRef = useRef(0);
  const chatIdCounterRef = useRef(0);

  useEffect(() => {
    const processChatThread = async () => {
      if (chatThread && chatThread.chats.length > 0) {
        const lastChatIndex = chatThread.chats.length - 1;
        const lastChat = chatThread.chats[lastChatIndex];
        const lastChatId = chatIdCounterRef.current;

        if (lastChatId !== lastProcessedChatRef.current) {
          if (!lastChat.mode) {
            try {
              const { mode, arg } = await handleMode(lastChat.question);
              let parsedArg;
              try {
                parsedArg = arg ? JSON.parse(arg) : {};
              } catch (parseError) {
                console.error("Error parsing arguments:", parseError);
              }

              dispatch(
                updateMode({
                  threadId: id,
                  chatIndex: lastChatIndex,
                  mode: mode,
                  arg: parsedArg,
                })
              );
            } catch (error) {
              console.error("Error determining mode and arguments:", error);
              setError("Error determining mode and arguments");
              setErrorFunction(() => handleMode.bind(null, lastChat.question));
            }
            return;
          }

          if (lastChat.mode === "weather" && !lastChat.weatherResults) {
            try {
              await handleWeather(lastChat.arg.location, lastChatIndex);
            } catch (error) {
              setError("Error fetching or processing weather data");
              setErrorFunction(() =>
                handleWeather.bind(null, lastChat.arg.location, lastChatIndex)
              );
              return;
            }
          }

          if (lastChat.mode === "stock" && !lastChat.stocksResults) {
            try {
              await handleStock(lastChat.arg.symbol, lastChatIndex);
            } catch (error) {
              setError("Error fetching or processing stock data");
              setErrorFunction(() =>
                handleStock.bind(null, lastChat.arg.symbol, lastChatIndex)
              );
              return;
            }
          }

          if (lastChat.mode === "dictionary" && !lastChat.dictionaryResults) {
            try {
              await handleDictionary(lastChat.arg.word, lastChatIndex);
            } catch (error) {
              setError("Error fetching or processing dictionary data");
              setErrorFunction(() =>
                handleDictionary.bind(null, lastChat.arg.word, lastChatIndex)
              );
              return;
            }
          }

          if (lastChat.mode === "search" && !lastChat.searchResults) {
            try {
              await handleSearch(lastChatIndex);
            } catch (error) {
              setError("Error fetching or processing search results");
              setErrorFunction(() => handleSearch.bind(null, lastChatIndex));
              return;
            }
          }

          if (
            (lastChat.mode === "chat" || lastChat.mode === "image") &&
            !lastChat.answer
          ) {
            try {
              await handleAnswer(lastChat);
            } catch (error) {
              console.error("Error generating answer:", error);
            }
          } else if (lastChat.answer) {
            setIsLoading(false);
            setIsCompleted(true);
          }

          lastProcessedChatRef.current = lastChatId;
        }

        chatIdCounterRef.current++;
      }
    };

    processChatThread();
  }, [
    chatThread?.chats.length,
    chatThread?.chats[chatThread?.chats.length - 1]?.mode,
    chatThread?.chats[chatThread?.chats.length - 1]?.searchResults,
    chatThread?.chats[chatThread?.chats.length - 1]?.answer,
  ]);

  const handleSearch = async (chatIndex) => {
    const chat = chatThread?.chats[chatIndex];
    setIsLoading(true);
    setIsCompleted(false);

    try {
      if (chat?.mode === "search") {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(
            chat?.query + " " + chat?.question
          )}`
        );

        if (!response.ok) {
          setError("Failed to fetch search results");
          setErrorFunction(() => handleSearch.bind(null, chatIndex));
          return;
        }

        const searchData = await response.json();

        dispatch(
          updateSearch({
            threadId: id,
            chatIndex,
            searchResults: searchData,
          })
        );
        setError("");

        const data = searchData?.data?.webPages?.value?.slice(0, 3);
        if (!data || data.length === 0) {
          throw new Error("No valid search results found to scrape.");
        }

        const urlsToScrape = data.map((item) => item.url).join(",");
        const scrapeResponse = await fetch(`/api/scrape?urls=${urlsToScrape}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!scrapeResponse.ok) {
          throw new Error("Failed to scrape website data");
        }

        const scrapedData = await scrapeResponse.text();
        await handleAnswer(chat, scrapedData);

        return searchData;
      } else {
        throw new Error("Mode is not search");
      }
    } catch (error) {
      console.error("Error fetching or processing search results:", error);
      setError("Error fetching or processing search results");
      setErrorFunction(() => handleSearch.bind(null, chatIndex));
    }
  };

  const handleWeather = async (location, chatIndex) => {
    const chat = chatThread?.chats[chatIndex];
    setIsLoading(true);
    setIsCompleted(false);

    try {
      if (chat?.mode === "weather") {
        const response = await fetch(
          `/api/weather?city=${encodeURIComponent(location)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const weatherData = await response.json();
        dispatch(
          updateWeather({
            threadId: id,
            chatIndex,
            weatherResults: weatherData,
          })
        );
        setError("");
        await handleAnswer(chat, JSON.stringify(weatherData));
      } else {
        throw new Error("Mode is not weather");
      }
    } catch (error) {
      console.error("Error fetching or processing weather data:", error);
      setError("Error fetching or processing weather data");
      setErrorFunction(() => handleWeather.bind(null, location, chatIndex));
    }
  };

  const handleStock = async (stock, chatIndex) => {
    const chat = chatThread?.chats[chatIndex];
    setIsLoading(true);
    setIsCompleted(false);

    try {
      if (chat?.mode === "stock") {
        const response = await fetch(
          `/api/stock?symbol=${encodeURIComponent(stock)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
        }

        const stocksData = await response.json();
        dispatch(
          updateStock({
            threadId: id,
            chatIndex,
            stocksResults: stocksData,
          })
        );
        setError("");
        await handleAnswer(chat, JSON.stringify(stocksData));
      } else {
        throw new Error("Mode is not stock");
      }
    } catch (error) {
      console.error("Error fetching or processing stock data:", error);
      setError("Error fetching or processing stock data");
      setErrorFunction(() => handleStock.bind(null, stock, chatIndex));
    }
  };

  const handleDictionary = async (word, chatIndex) => {
    const chat = chatThread?.chats[chatIndex];
    setIsLoading(true);
    setIsCompleted(false);

    try {
      if (chat?.mode === "dictionary") {
        const response = await fetch(
          `/api/dictionary?word=${encodeURIComponent(word)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dictionary data");
        }

        const dictionaryData = await response.json();
        dispatch(
          updateDictionary({
            threadId: id,
            chatIndex,
            dictionaryResults: dictionaryData,
          })
        );
        setError("");
        await handleAnswer(chat, JSON.stringify(dictionaryData));
      } else {
        throw new Error("Mode is not dictionary");
      }
    } catch (error) {
      console.error("Error fetching or processing dictionary data:", error);
      setError("Error fetching or processing dictionary data");
      setErrorFunction(() => handleDictionary.bind(null, word, chatIndex));
    }
  };

  const chat = chatThread?.chats || [];
  const renderChat = chat.map((message, index) => {
    return (
      <div key={index} className={styles.chatRow}>
        <Prompt message={message} />
        <Actions message={message} handleFork={handleFork} />
        <Source
          message={message}
          citations={generateCitations(message.answer)}
        />
        <Answer
          message={message}
          isLoading={isLoading}
          isCompleted={isCompleted}
          isStreaming={isStreaming}
        />
      </div>
    );
  });

  return (
    <div className={styles.chatContainer}>
      {error ? (
        <Chat404 error={error} errorFunction={errorFunction} />
      ) : isFetching ? (
        <ChatFetch />
      ) : (
        renderChat
      )}
    </div>
  );
};

export default Chat;
