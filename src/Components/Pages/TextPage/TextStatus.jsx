import React from "react";
import { connect } from "react-redux";
import {
  getTermCountAction,
  getProcessedTermCountAction,
} from "../../../Actions/TextAction";

const TextStatus = ({ text, getTermCount, getProcessedTermCount }) => {
  const [getTermCountInterval, setGetTermCountInterval] = React.useState(null);
  const [
    getProcessedTermCountInterval,
    setGetProcessedTermCountInterval,
  ] = React.useState(null);
  React.useEffect(() => {
    if (text.termCount === 0) {
      if (!getTermCountInterval) {
        const interval = setInterval(() => {
          getTermCount(text.id);
        }, 2000);
        setGetTermCountInterval(interval);
      }
    } else {
      clearInterval(getTermCountInterval);
    }
  }, [getTermCount, getTermCountInterval, text.id, text.termCount]);

  React.useEffect(
    () => () => {
      clearInterval(getTermCountInterval);
      clearInterval(getProcessedTermCountInterval);
    },
    [getProcessedTermCountInterval, getTermCountInterval]
  );

  React.useEffect(() => {
    if (text.processedTermCount < text.termCount) {
      if (!getProcessedTermCountInterval) {
        const interval = setInterval(() => {
          getProcessedTermCount(text.id);
        }, 2000);
        setGetProcessedTermCountInterval(interval);
      }
    } else {
      clearInterval(getProcessedTermCountInterval);
    }
  }, [
    getProcessedTermCount,
    getProcessedTermCountInterval,
    getTermCountInterval,
    text.id,
    text.processedTermCount,
    text.termCount,
  ]);

  if (text.termCount === 0) {
    return <span style={{ backgroundColor: "#FF0101" }}>Processing</span>;
  }
  if (text.termCount === text.processedTermCount) {
    return <span style={{ backgroundColor: "#009700" }}>Done</span>;
  }
  return (
    <span style={{ backgroundColor: "#5AB7D4" }}>
      {`${text.processedTermCount}/${text.termCount}(${Math.floor(
        (text.processedTermCount * 100) / text.termCount
      )}%)`}
    </span>
  );
};

export default connect(null, {
  getTermCount: getTermCountAction,
  getProcessedTermCount: getProcessedTermCountAction,
})(TextStatus);
