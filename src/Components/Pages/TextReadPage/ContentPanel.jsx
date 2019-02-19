import PropTypes from "prop-types";
import React from "react";
import styles from "./TextReadPage.module.scss";
import { TermLearningLevel } from "../../../Enums";
import Term from "../../Term";

class ContentPanel extends React.PureComponent {
  render() {
    const { readingText, onTermClick, bookmark } = this.props;
    return (
      <div id="contentPanel" className={styles.contentPanel}>
        {readingText.terms.map((term, index) => {
          if (term.learningLevel === TermLearningLevel.Skipped) {
            return term.content;
          }
          if (index === readingText.bookmark) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={index} ref={bookmark}>
                <Term
                  onTermClick={t => onTermClick(t, index)}
                  index={index}
                  term={term}
                />
              </span>
            );
          }
          return (
            <Term
              onTermClick={t => onTermClick(t, index)}
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              term={term}
              index={index}
            />
          );
        })}
      </div>
    );
  }
}

export default ContentPanel;

ContentPanel.propTypes = {
  bookmark: PropTypes.shape({}).isRequired,
  onTermClick: PropTypes.func.isRequired,
  readingText: PropTypes.shape({}).isRequired
};
