import React from "react";
import Image from "next/image";
import styles from "./Source.module.css";
import File from "../File/File";
import Search from "../Search/Search";
import Stock, { StockType } from "../../app/plugins/stocks/page";
import Widget from "../Widget/Widget";
import Weather from "../Weather/Weather";
import Dictionary from "../Dictionary/Dictionary";
import {
  FileInfo,
  SearchType,
  WeatherType,
  DictionaryType,
} from "@/utils/types";

import SourceLogo from "../../../public/svgs/Source.svg";

const Source = ({ mode, fileInfo, searchResults, stockResults, weatherResults, dictionaryResults }) => {
  if (mode !== "chat") {
    return (
      <div className={styles.sourceContainer}>
        <div className={styles.sourceTextRow}>
          <Image src={SourceLogo} alt="Source" className={styles.sourceImg} />
          <p className={styles.sourceText}>Source</p>
        </div>

        {mode === "image" && fileInfo && (
          <div className={styles.sourceRow}>
            <File fileInfo={fileInfo} />
          </div>
        )}

        {mode === "search" && searchResults && (
          <>
            <Search searchResults={searchResults} />
            <Widget searchResults={searchResults} />
          </>
        )}

        {mode === "stock" && stockResults && (
          <div className={styles.sourceRow}>
            <Stock stockResults={stockResults} />
          </div>
        )}

        {mode === "weather" && weatherResults && (
          <div className={styles.sourceRow}>
            <Weather weatherResults={weatherResults} />
          </div>
        )}

        {mode === "dictionary" && dictionaryResults && (
          <div className={styles.sourceRow}>
            <Dictionary dictionaryResults={dictionaryResults} />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Source;
