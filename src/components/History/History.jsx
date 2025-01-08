"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname
import styles from "./History.module.css";
import Image from "next/image";
import SpinnerWhite from "../SpinnerWhite/SpinnerWhite";
import { useSelector } from "react-redux";
import { selectAuthState, selectUserDetailsState } from "../../store/authSlice";
import { Skeleton } from "@nextui-org/skeleton";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import Pen from "../../../public/svgs/Pen.svg";
import Bin from "../../../public/svgs/Bin.svg";
import ChatInactive from "../../../public/svgs/sidebar/Chat_Inactive.svg";

const History = () => {
  const router = useRouter(); // For navigation
  const pathname = usePathname(); // For determining the current route
  const isAuthenticated = useSelector(selectAuthState);
  const userDetails = useSelector(selectUserDetailsState);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoginRoute, setIsLoginRoute] = useState(false); // State to track if we're on the login route

  // Monitor route changes dynamically
  useEffect(() => {
    setIsLoginRoute(pathname === "/auth/login");
  }, [pathname]);

  useEffect(() => {
    if (isAuthenticated && userDetails.uid) {
      fetchChatHistory();
    } else {
      setChatHistory([]);
      setLoading(false);
    }
  }, [isAuthenticated, userDetails.uid]);

  const fetchChatHistory = async () => {
    setLoading(true);
    const historyRef = collection(db, "users", userDetails.uid, "history");
    const q = query(historyRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setChatHistory(history);
    setLoading(false);
  };

  const handleDelete = async (threadId) => {
    setDeleting(true);
    await deleteDoc(doc(db, "users", userDetails.uid, "history", threadId));
    fetchChatHistory();
    setDeleting(false);
  };

  return (
    <div className={styles.list}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>Chats</div>
        {/* Conditionally render the New Chat button */}
        {!isLoginRoute && (
          <button
            className={styles.titleButton}
            onClick={() => router.push("/")}
          >
            <Image
              src={Pen}
              alt="New Chat"
              width={20}
              height={20}
              className={styles.titleButtonIcon}
            />
            <span className={styles.titleButtonText}>New Chat</span>
          </button>
        )}
      </div>
      <ScrollShadow hideScrollBar className="h-[calc(100vh_-_50px)] w-full">
        <div className={styles.listContainer}>
          {loading ? (
            <>
              {[...Array(8)].map((_, index) => (
                <Skeleton
                  key={index}
                  className={styles.skeletonListItem}
                />
              ))}
            </>
          ) : chatHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <Image
                src={ChatInactive}
                alt="No chats"
                className={styles.emptyStateIcon}
              />
              <p className={styles.emptyStateText}>No Chat History</p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={styles.listItem}
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                <span>{chat.chats[0].question}</span>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat.id);
                  }}
                >
                  <Image
                    src={Bin}
                    alt="Delete"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollShadow>
    </div>
  );
};

export default History;
