import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import styles from "./TextReadPage.module.scss";
import Term from "../../Term";
import ProgressBar from "./ProgressBar";
import GoToBookmarkButton from "./GoToBookmarkButton";
import {
  getTextTermsAction,
  setTermIndexBeginAction,
  setViewingTermAction,
  setTermIndexEndAction,
} from "../../../Actions/TextAction";
import { setEditingTermAction } from "../../../Actions/TermAction";
import Loading from "../../Loading/Loading";
import { LAST_BEGIN_INDEX_ID } from "../../Term/TermButton";
import TermObserver from "../../Term/TermObserver";

const TermCountPerProgressPoint = 50;

class ContentPanel extends React.Component {
  constructor(props) {
    super(props);
    if (window.innerWidth > 700) {
      // desktop
      this.displayTerms = 1000;
      this.loadTerms = 300;
    } else {
      // mobile
      this.displayTerms = 750;
      this.loadTerms = 150;
    }

    this.begin = React.createRef();
    this.container = React.createRef();
    this.loading = true;
  }

  componentDidMount() {
    const {
      end,
      setTermIndexEnd,
      begin,
      termCount,
      setTermIndexBegin,
    } = this.props;
    setTermIndexBegin(Math.max(begin - Math.floor(this.displayTerms / 2), 0));
    setTermIndexEnd(Math.min(end + this.displayTerms, termCount - 1));
  }

  componentDidUpdate(prevProps) {
    const { begin, end, getTextTerms, textId, terms } = this.props;
    if (begin < prevProps.begin) {
      getTextTerms(textId, begin, prevProps.begin);
    }

    if (prevProps.terms[begin] !== terms[begin]) {
      this.scrollToLast();
    }

    // scroll to the bookmark ofter initial loading
    if (terms[begin] && terms[end] && this.loading) {
      const bookmarkEl = document.getElementById("bookmark");
      if (bookmarkEl) {
        this.loading = false;
        bookmarkEl.scrollIntoView({ block: "center" });
      }
    }

    if (end > prevProps.end) {
      getTextTerms(textId, prevProps.end, end);
    }
  }

  scrollToLast = () => {
    const lastBeginEl = document.getElementById(LAST_BEGIN_INDEX_ID);
    if (lastBeginEl) {
      lastBeginEl.scrollIntoView();
      this.renderingLast = false;
    } else {
      this.renderingLast = true;
    }
  };

  goToBookmark = () => {
    const bookmarkEl = document.getElementById("bookmark");
    if (bookmarkEl) {
      bookmarkEl.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  handleScroll = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.id !== "contentPanel") {
      return;
    }
    const {
      termCount,
      begin,
      editingTerm,
      setEditingTerm,
      end,
      setTermIndexEnd,
      setTermIndexBegin,
      terms,
    } = this.props;
    if (editingTerm) {
      setEditingTerm(null);
    }
    // loading
    if (!terms[begin] || !terms[end]) {
      return;
    }

    if (this.renderingLast) {
      this.scrollToLast();
      return;
    }

    const top = e.target.scrollTop < 100;
    if (top) {
      if (begin > 0) {
        setTermIndexBegin(Math.max(begin - this.loadTerms, 0));
        return;
      }
    }
    const bottom =
      e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 100;
    if (bottom) {
      if (end < termCount - 1) {
        setTermIndexEnd(Math.min(end + this.loadTerms, termCount - 1));
      }
    }
  };

  handleTermVisible = (index) => (visible) => {
    if (visible) {
      const { setViewingTerm } = this.props;
      clearTimeout(window.setViewingTermTimeout);
      window.setViewingTermTimeout = setTimeout(() => {
        setViewingTerm(index);
      }, 200);
    }
  };

  render() {
    const { terms } = this.props;
    const { begin, end, onSpeak, editingTerm } = this.props;
    // initial loading
    if ((!terms[begin] || !terms[end]) && this.loading) {
      return (
        <div style={{ height: "50%" }}>
          <Loading />;
        </div>
      );
    }
    const termElements = [];
    for (let i = begin; i <= end; i += 1) {
      if (terms[i]) {
        if (i % TermCountPerProgressPoint === 0) {
          termElements.push(
            <TermObserver index={i}>
              <Term
                onSpeak={onSpeak}
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                index={i}
              />
            </TermObserver>
          );
        } else {
          termElements.push(
            <Term
              onSpeak={onSpeak}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              index={i}
            />
          );
        }
      }
    }

    return (
      <>
        <div
          onScroll={this.handleScroll}
          id="contentPanel"
          className={styles.contentPanel}
          ref={this.container}
        >
          {/* end loading */}
          {!terms[begin] && <Loading className={styles.loading} />}
          {termElements}
          {/* begin loading */}
          {!terms[end] && <Loading className={styles.loading} />}
          <ProgressBar />
        </div>
        {!editingTerm && <GoToBookmarkButton onClick={this.goToBookmark} />}
      </>
    );
  }
}

ContentPanel.defaultProps = {
  terms: null,
  editingTerm: null,
};

ContentPanel.propTypes = {
  terms: PropTypes.arrayOf(PropTypes.shape()),
  textId: PropTypes.number.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  setTermIndexBegin: PropTypes.func.isRequired,
  setTermIndexEnd: PropTypes.func.isRequired,
  termCount: PropTypes.number.isRequired,
  getTextTerms: PropTypes.func.isRequired,
  onSpeak: PropTypes.func.isRequired,
  editingTerm: PropTypes.number,
  setEditingTerm: PropTypes.func.isRequired,
  setViewingTerm: PropTypes.func.isRequired,
};
export default connect(
  (state) => ({
    terms: state.text.readingText.terms,
    begin: state.text.readingText.termIndexBegin,
    end: state.text.readingText.termIndexEnd,
    termCount: state.text.readingText.termCount,
    editingTerm: state.term.editingTerm,
  }),
  {
    getTextTerms: getTextTermsAction,
    setTermIndexBegin: setTermIndexBeginAction,
    setTermIndexEnd: setTermIndexEndAction,
    setEditingTerm: setEditingTermAction,
    setViewingTerm: setViewingTermAction,
  }
)(ContentPanel);
