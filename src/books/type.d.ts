import { EType } from "./config";
import type { Moment } from "moment";

export interface IData {
  type: EType;
  category: string;
  amount: number;
  moment?: Moment;
}
export interface IItem extends IData {
  time: number;
  month: number;
  name: string;
  date: string;
  key?: number;
}

export interface IOption {
  label: string;
  value: any;
}
