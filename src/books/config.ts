import moment from "moment";
import type { ColumnType } from "antd/es/table";
import type { IOption, IItem, IData } from "./type.d";

export enum EType {
  COST = 0,
  INCOME = 1,
}

export const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const types: IOption[] = [
  { label: "支出", value: 0 },
  { label: "收入", value: 1 },
];

export const columns: ColumnType<IItem>[] = [
  {
    title: "分类",
    dataIndex: "name",
    key: "name",
    showSorterTooltip: false,
    sorter: (a, b) => {
      if (a.category !== b.category) {
        const category1 = a.category;
        const category2 = b.category;
        let i = 0,
          j = 0;
        while (i < category1.length && j < category2.length) {
          if (category1[i].charCodeAt(0) === category2[j].charCodeAt(0)) {
            i++;
            j++;
          }
          return category1[i].charCodeAt(0) - category2[j].charCodeAt(0);
        }
      }
      return 1;
    },
  },
  {
    title: "金额(¥)",
    dataIndex: "amount",
    key: "amount",
    defaultSortOrder: null,
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: "时间",
    dataIndex: "date",
    key: "date",
    defaultSortOrder: null,
    sorter: (a, b) => a.time - b.time,
  },
  {
    title: "类型",
    showSorterTooltip: false,
    defaultSortOrder: null,
    sorter: (a, b) => a.type - b.type,
    render: (record) => (record.type === EType.INCOME ? "收入" : "支出"),
  },
];

export const initTmp: IData = {
  type: EType.COST,
  amount: 0,
  category: "",
  moment: moment(),
};
