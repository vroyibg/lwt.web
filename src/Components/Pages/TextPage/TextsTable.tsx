import React from "react";
import Table from "@material-ui/core/Table";
import { connect } from "react-redux";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import {
  deleteTextAction,
  getTextsAction,
  loadTermCountAction,
} from "../../../Actions/TextAction";
import { getLanguageAction } from "../../../Actions/LanguageAction";
import TextActions from "./TextActions";
import TextProgress from "./TextProgress";
import { Language, RootState } from "../../../RootReducer";
import { TextItem } from "../../../Reducers/TextReducer";
import TermNumber from "./TermNumber";
import { TermLearningLevel } from "../../../Enums";
import TextStatus from "./TextStatus";
import TotalTerm from "./TotalTerm";

interface TextsTableProps {
  texts: TextItem[];
  onDelete: Function;
  onEdit: Function;
  languages: Language[];
}

const getTextLanguage = (language: string, languages: Language[]) => {
  const lang = languages.find((l) => l.code === language);
  if (lang) {
    return lang.name;
  }
  return "Unknown language";
};

const TextsTable: React.FC<TextsTableProps> = (props) => {
  const { texts, onDelete, onEdit, languages } = props;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Act</TableCell>
            <TableCell>P</TableCell>
            <TableCell>UK</TableCell>
            <TableCell>L1</TableCell>
            <TableCell>L2</TableCell>
            <TableCell>L3</TableCell>
            <TableCell>L4</TableCell>
            <TableCell>L5</TableCell>
            <TableCell>WK</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Language</TableCell>
            <TableCell>I</TableCell>
            <TableCell>T</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {texts.map((text) => (
            <TableRow key={text.id}>
              <TableCell component="th" scope="row">
                {text.title}
              </TableCell>
              <TableCell>
                <TextActions text={text} onDelete={onDelete} onEdit={onEdit} />
              </TableCell>
              <TableCell>
                <TextProgress text={text} />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.UnKnow}
                />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.Learning1}
                />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.Learning2}
                />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.Learning3}
                />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.Learning4}
                />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.Learning5}
                />
              </TableCell>
              <TableCell>
                <TermNumber
                  text={text}
                  learningLevel={TermLearningLevel.WellKnow}
                />
              </TableCell>
              <TableCell>
                <TextStatus text={text} />
              </TableCell>
              <TableCell>
                {getTextLanguage(text.languageCode, languages)}
              </TableCell>
              <TableCell>
                {text.counts ? text.counts[TermLearningLevel.Ignored] : "-"}
              </TableCell>
              <TableCell>
                <TotalTerm value={text.counts} record={text} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default connect(
  (state: RootState) => ({
    texts: state.text.texts,
    filters: state.text.filters,
    page: state.text.page,
    itemPerPage: state.text.itemPerPage,
    total: state.text.total,
    languages: state.language.languages,
  }),
  {
    getTexts: getTextsAction,
    getLanguages: getLanguageAction,
    deleteText: deleteTextAction,
    getTermCount: loadTermCountAction,
  }
)(TextsTable);
