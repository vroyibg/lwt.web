import { Button, Pagination, Popconfirm, Table } from "antd";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ReadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { RouteComponentProps } from "react-router";
import { getLanguageActionCreator } from "../../../Actions/LanguageAction";
import {
  deleteTextActionCreator,
  getTextsActionCreator,
  loadTermCountActionCreator,
} from "../../../Actions/TextAction";
import TextFilterForm from "../../Forms/TextFilterForm";
import TextCreateModal from "../../Modals/TextCreateModal";
import TextEditModal from "../../Modals/TextEditModal";
import { TermLearningLevel } from "../../../Enums";
import styles from "./TextPage.module.scss";
import termStyles from "../../Term/Term.module.scss";
import parseQueryString from "../../../Utilities/queryString";
import TotalTerm from "./TotalTerm";
import TextStatus from "./TextStatus";
import { Language } from "../../../Reducers/LanguageReducer";
import { TextItemState } from "../../../Reducers/TextReducer";
import { TextFilter } from "../../../Apis/TextApi";
import { RootState } from "../../../RootReducer";

function renderTermNumber(record: TextItemState, level: string) {
  const { counts } = record;
  if (!counts) {
    return <span>-</span>;
  }
  const current = counts[TermLearningLevel[level]];
  if (!current) {
    return 0;
  }

  const sum =
    record.termCount -
    counts[TermLearningLevel.Ignored] -
    counts[TermLearningLevel.Skipped];
  return (
    <div
      className={`${termStyles[`term-${TermLearningLevel[level]}`]} not-invert`}
    >
      {`${current}`}
      <br />
      ~
      <br />
      {`${Math.round((current / sum) * 100)}%`}
    </div>
  );
}

interface OwnProps {
  filters: TextFilter;
  getLanguages: () => void;
  getTexts: (
    filters: TextFilter,
    page: number,
    itemPerPage: number
  ) => Promise<void>;
  deleteText: (id: number) => void;
  itemPerPage: number;
  languages: Language[];
  page: number;
  texts: TextItemState[];
  total: number;
}

type TextPageProps = OwnProps & RouteComponentProps;

interface TextPageState {
  isLoading: boolean;
  createModalVisible: boolean;
  editModalVisible: boolean;
  editingText: number | null;
}

/**
 * text page
 */
class TextPage extends React.Component<TextPageProps, TextPageState> {
  columns: ColumnsType<TextItemState> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "30vw",
    },
    {
      title: "Act",
      key: "actions",
      width: "auto",
      render: (_, text) => (
        <span>
          <Link
            // @ts-ignore
            disabled={text.processedIndex === -1}
            className={styles.actionButton}
            to={`/text/read/${text.id}`}
          >
            <ReadOutlined />
          </Link>
          <Popconfirm
            title="Confirm to delete this text."
            onConfirm={() => this.handleDelete(text.id)}
            okText="Delete"
            okType="danger"
          >
            <DeleteOutlined className={styles.deleteButton} />
          </Popconfirm>
          <EditOutlined
            className={styles.editButton}
            onClick={() => this.handleEdit(text.id)}
          />
        </span>
      ),
    },
    {
      title: "P",
      key: "progress",
      dataIndex: "bookmark",
      render: (value, record) => {
        let percentage = 0;
        if (value && value !== 0) {
          percentage = Math.floor((value / record.length) * 10000) / 100;
        }
        return `${percentage}%`;
      },
    },
    {
      title: "UK",
      key: "unknow",
      dataIndex: "counts.unknown",
      render: (value, record) => renderTermNumber(record, "UnKnow"),
    },
    {
      title: "L1",
      key: "Learning1",
      dataIndex: "counts.learning-1",
      render: (value, record) => renderTermNumber(record, "Learning1"),
    },
    {
      title: "L2",
      key: "Learning2",
      dataIndex: "counts.learning-2",
      render: (value, record) => renderTermNumber(record, "Learning2"),
    },
    {
      title: "L3",
      key: "Learning3",
      dataIndex: "counts.learning-3",
      render: (value, record) => renderTermNumber(record, "Learning3"),
    },
    {
      title: "L4",
      key: "Learning4",
      dataIndex: "counts.learning-4",
      render: (value, record) => renderTermNumber(record, "Learning4"),
    },
    {
      title: "L5",
      key: "Learning5",
      dataIndex: "counts.learning-5",
      render: (value, record) => renderTermNumber(record, "Learning5"),
    },
    {
      title: "WK",
      key: "WellKnow",
      dataIndex: "counts.well-known",
      render: (_, record) => renderTermNumber(record, "WellKnow"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => <TextStatus text={record} />,
    },
    {
      title: "Language",
      dataIndex: "languageCode",
      key: "languageCode",
      render: (value) => {
        const { languages } = this.props;
        const language = languages.find((lang) => lang.code === value);
        if (language) {
          return language.name;
        }
        return "Unknown language";
      },
    },
    {
      title: "I",
      key: "Ignored",
      dataIndex: "counts",
      render: (value) => (value ? value[TermLearningLevel.Ignored] : "-"),
    },
    {
      title: "T",
      key: "total",
      dataIndex: "counts",
      render: (value, record) => <TotalTerm value={value} record={record} />,
    },
  ];

  static defaultProps = {
    filters: {},
  };

  constructor(props: TextPageProps) {
    super(props);
    this.showCreateModal = this.showCreateModal.bind(this);
    this.hideCreateModal = this.hideCreateModal.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.filterTexts = this.filterTexts.bind(this);
    this.state = {
      createModalVisible: false,
      editModalVisible: false,
      isLoading: true,
      editingText: null,
    };
    const { filters, location, itemPerPage } = props;
    const query: any = parseQueryString(location.search);
    if (query.page) {
      this.loadingAndGetTexts(filters, parseInt(query.page, 10), itemPerPage);
    } else {
      this.loadingAndGetTexts(filters, 1, itemPerPage);
    }
  }

  componentDidMount() {
    const { getLanguages } = this.props;
    getLanguages();
  }

  componentDidUpdate(prevProps: TextPageProps) {
    const { filters, location, page, itemPerPage } = this.props;
    if (prevProps.location.search !== location.search) {
      const query: any = parseQueryString(location.search);
      if (query.page) {
        const newPage = parseInt(query.page, 10);
        if (newPage !== page) {
          this.loadingAndGetTexts(filters, newPage, itemPerPage);
        }
      }
    }
  }

  onEdit = () => {
    const { filters } = this.props;
    this.filterTexts(filters);
    this.setState((state) => ({ ...state, editingText: null }));
  };

  loadingAndGetTexts = (
    filters: TextFilter,
    page: number,
    itemPerPage: number
  ) => {
    const { isLoading } = this.state;
    const { getTexts } = this.props;
    if (!isLoading) {
      this.setState({ isLoading: true });
    }
    getTexts(filters, page, itemPerPage).then(() => {
      this.setState({ isLoading: false });
    });
  };

  hideEditModal = () => {
    this.setState((prevState) => ({ ...prevState, editModalVisible: false }));
  };

  handleDelete = (textId: number) => {
    const { deleteText } = this.props;
    deleteText(textId);
  };

  handleEdit = (textId: number) => {
    this.setState((state) => ({
      ...state,
      editingText: textId,
      editModalVisible: true,
    }));
  };

  handlePageChange(page: number) {
    const { history } = this.props;
    history.push(`/text?page=${page.toString()}`);
  }

  filterTexts(filters: TextFilter) {
    const { itemPerPage } = this.props;
    this.loadingAndGetTexts(filters, 1, itemPerPage);
  }

  hideCreateModal() {
    this.setState((prevState) => ({ ...prevState, createModalVisible: false }));
  }

  showCreateModal() {
    this.setState((prevState) => ({ ...prevState, createModalVisible: true }));
  }

  render() {
    const { texts, filters, page, total } = this.props;
    const {
      isLoading,
      createModalVisible,
      editModalVisible,
      editingText,
    } = this.state;

    return (
      <React.Fragment>
        <TextEditModal
          hide={this.hideEditModal}
          onEdit={this.onEdit}
          editingText={editingText}
          visible={editModalVisible}
        />
        <TextCreateModal
          onChange={this.filterTexts}
          hide={this.hideCreateModal}
          visible={createModalVisible}
          onCreate={this.filterTexts}
        />
        <Button onClick={this.showCreateModal}>Add text</Button>
        <TextFilterForm onFilterChange={this.filterTexts} value={filters} />
        <Table
          dataSource={texts}
          pagination={false}
          loading={isLoading}
          columns={this.columns}
          rowKey="id"
          className={styles.table}
          rowClassName={styles.row}
          scroll={{ x: 1000 }}
        />
        <Pagination
          total={total}
          current={page}
          hideOnSinglePage={false}
          onChange={this.handlePageChange}
          showQuickJumper
        />
      </React.Fragment>
    );
  }
}

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
    getTexts: getTextsActionCreator,
    getLanguages: getLanguageActionCreator,
    deleteText: deleteTextActionCreator,
    getTermCount: loadTermCountActionCreator,
  }
)(TextPage);
