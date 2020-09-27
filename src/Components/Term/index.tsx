import React from "react";
import { connect } from "react-redux";
import {
  getTermMeaningAction,
  setEditingTermAction,
} from "../../Actions/TermAction";
import { getTermCountInTextAction } from "../../Actions/TextAction";
import { TermLearningLevel } from "../../Enums";
import TermButton from "./TermButton";
import TermTooltip from "./TermTooltip";
import SkippedTerm from "./SkippedTerm";
import { RootState } from "../../RootReducer";
import { TextTermState } from "../../Reducers/TextReducer";

interface TermOwnProps {
  bookmarkRef: any;
  textTermId: number;
  last: any;
  onSpeak: (term: TextTermState) => void;
}

interface TermProps extends TermOwnProps {
  bookmark: boolean;
  term: TextTermState;
  getTermCountInText: (id: number, textId: number) => void;
  getTermMeaning: Function;
  setEditingTerm: Function;
  textId: number;
}

class Term extends React.Component<TermProps> {
  shouldComponentUpdate(nextProps: TermProps) {
    const { term, bookmark, last } = this.props;
    return (
      nextProps.term.learningLevel !== term.learningLevel ||
      nextProps.term.meaning !== term.meaning ||
      nextProps.term.count !== term.count ||
      nextProps.bookmark !== bookmark ||
      last !== nextProps.last
    );
  }

  handleHover = () => {
    const { term, onSpeak } = this.props;
    if (term.meaning === null) {
      this.loadTermsMeaning();
    }
    if (!term.count) {
      this.loadTermCountInText();
    }
    onSpeak(term);
  };

  loadTermCountInText = () => {
    const { getTermCountInText, term, textId } = this.props;
    if (term.id && !term.count) {
      getTermCountInText(term.id, textId);
    }
  };

  loadTermsMeaning = () => {
    const { term, getTermMeaning } = this.props;
    if (
      term.id &&
      term.meaning === undefined &&
      term.learningLevel !== TermLearningLevel.Ignored &&
      term.learningLevel !== TermLearningLevel.Skipped &&
      term.learningLevel !== TermLearningLevel.WellKnow
    ) {
      getTermMeaning(term, term.indexFrom);
    }
  };

  handleTermClick = (e: any) => {
    e.preventDefault();
    const { setEditingTerm, term, onSpeak, getTermMeaning } = this.props;
    // load term meaning if not loaded.
    if (!term.count) {
      this.loadTermCountInText();
    }
    if (term.meaning === null) {
      getTermMeaning(term, term.indexFrom);
    }
    onSpeak(term);
    setEditingTerm(term.indexFrom);
  };

  render() {
    const { term, bookmark, last, bookmarkRef, onSpeak } = this.props;
    if (term.learningLevel === TermLearningLevel.Skipped) {
      return <SkippedTerm term={term} last={last} />;
    }
    if (
      term.learningLevel === TermLearningLevel.WellKnow ||
      term.learningLevel === TermLearningLevel.Ignored ||
      window.innerWidth < 768
    ) {
      return (
        <TermButton
          bookmark={bookmark}
          bookmarkRef={bookmarkRef}
          last={last}
          term={term}
          onClick={this.handleTermClick}
        />
      );
    }

    return (
      <TermTooltip
        onClick={this.handleTermClick}
        bookmarkRef={bookmarkRef}
        onHover={this.handleHover}
        onSpeak={onSpeak}
        term={term}
        last={last}
        bookmark={bookmark}
      />
    );
  }
}

export default connect(
  (state: RootState, ownProps: TermOwnProps) => {
    if (state.text.readingText === null) throw new Error();
    const { terms, id, bookmark } = state.text.readingText;
    const term = terms.find((t) => t?.textTermId === ownProps.textTermId);
    if (!term) throw new Error();
    return {
      term,
      bookmark: bookmark === term.indexFrom,
      textId: id,
    };
  },
  {
    setEditingTerm: setEditingTermAction,
    getTermMeaning: getTermMeaningAction,
    getTermCountInText: getTermCountInTextAction,
  }
)(Term);