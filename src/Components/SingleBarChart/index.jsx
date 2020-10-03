import PropTypes from "prop-types";
import React from "react";
import styles from "./SingleBarChart.module.scss";

const SingleBarChart = ({ data }) => {
  const sum = data.map((i) => i.value).reduce((a, b) => a + b);
  return (
    <span className={`${styles.bar} not-invert`}>
      {data.map((item) =>
        item.value !== 0 ? (
          <span
            key={item.name}
            className={styles.section}
            style={{
              background: item.color,
              paddingLeft: "0.2rem",
              paddingRight: "0.2rem",
              height: "100%",
              flex: item.value,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "0.85rem",
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "0.85rem",
              }}
            >
              {`(${Math.round((item.value * 10000) / sum) / 100}%)`}
            </div>
          </span>
        ) : null
      )}
    </span>
  );
};

SingleBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SingleBarChart;
