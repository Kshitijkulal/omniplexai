import React, { useEffect, useState } from "react";
import styles from "./Library.module.css";
import Image from "next/image";
import SpinnerWhite from "../SpinnerWhite/SpinnerWhite";
import { Skeleton } from "@nextui-org/skeleton";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { getRelativeDateLabel, cutString } from "@/utils/utils";
import { useSelector } from "react-redux";
import { selectAuthState, selectUserDetailsState } from "../../store/authSlice";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import Bin from "../../../public/svgs/Bin.svg";
import FolderInactive from "../../../public/svgs/sidebar/Folder_Inactive.svg";
import { useRouter } from "next/navigation"; // Importing the router

const Library = () => {
  const router = useRouter(); // Initialize the router
  const isAuthenticated = useSelector(selectAuthState);
  const userDetails = useSelector(selectUserDetailsState);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [libraryData, setLibraryData] = useState([]);

  useEffect(() => {
    fetchLibraryData();
  }, [isAuthenticated, userDetails.uid]);

  const fetchLibraryData = async () => {
    if (isAuthenticated && userDetails.uid) {
      setLoading(true);
      const libraryRef = collection(db, "users", userDetails.uid, "library");
      const q = query(libraryRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const library = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibraryData(library);
      setLoading(false);
    } else {
      setLibraryData([]);
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (isAuthenticated && userDetails.uid) {
      setDeleting(true);
      await deleteDoc(doc(db, "users", userDetails.uid, "library", itemId));
      fetchLibraryData();
      setDeleting(false);
    }
  };

  // Handle authentication button click to redirect to the login page
  const handleAuth = () => {
    if (!isAuthenticated) {
      router.push("/auth/login"); // Redirect to login page
    }
  };

  return (
    <div className={styles.list}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>Documents</div>
      </div>
      <ScrollShadow hideScrollBar className="h-[calc(100vh_-_50px)] w-full">
        <div className={styles.listContainer}>
          {loading ? (
            <React.Fragment>
              <Skeleton className={styles.skeletonListHeader} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
              <Skeleton className={styles.skeletonListItem} />
            </React.Fragment>
          ) : libraryData.length === 0 ? (
            <div className={styles.emptyState}>
              <Image
                src={FolderInactive}
                alt="Folder Empty"
                className={styles.emptyStateIcon}
              />
              <p className={styles.emptyStateText}>No Documents Uploaded</p>
            </div>
          ) : (
            libraryData.map((item, index, array) => {
              const header =
                index === 0 || item.date !== array[index - 1].date ? (
                  <div key={`header-${index}`} className={styles.listHeader}>
                    {getRelativeDateLabel(item.date)}
                  </div>
                ) : null;
              return (
                <React.Fragment key={item.id}>
                  {header}
                  <div className={styles.listItem}>
                    {cutString(item.name, 24)}
                    {deleting ? (
                      <div className={styles.spinner}>
                        <SpinnerWhite />
                      </div>
                    ) : (
                      <Image
                        src={Bin}
                        alt="Bin"
                        className={styles.bin}
                        onClick={() => handleDelete(item.id)}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </ScrollShadow>
      {!isAuthenticated && (
        <div className={styles.modalOverlay}>
          <div className={styles.button} onClick={handleAuth}>
            Sign In
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
