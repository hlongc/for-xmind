import { ChangeEvent, useEffect, useState } from "react";
import "./index.scss";
import {
  Button,
  Row,
  Col,
  Select,
  Table,
  Divider,
  Input,
  Modal,
  message,
  DatePicker,
} from "antd";
import type { Moment } from "moment";

import type { IData, IItem, IOption } from "./type";
import { EType, initTmp, months, types, columns } from "./config";

function App() {
  const [originList, setOriginList] = useState<IItem[]>([]);
  const [showList, setShowList] = useState<IItem[]>([]);
  const [categoryList, setCategoryList] = useState<IOption[]>([]);
  const [month, setMonth] = useState<number>(-1);
  const [type, setType] = useState<EType>(-1);
  const [name, setName] = useState<string>("");
  const [cost, setCost] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [show, setShow] = useState<boolean>(false);
  const [tmp, setTmp] = useState<IData>({ ...initTmp });
  const [commitLoading, setCommitLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const getList = () => {
    setLoading(true);
    fetch("/get/list")
      .then((response) => response.json())
      .then((res) => {
        const { ret, msg, result } = res;
        if (ret !== 0) {
          return message.error(msg);
        }
        const set = new Set<string>();
        const categoryArr: IOption[] = [];

        result.forEach((record: IItem, index: number) => {
          record.key = index;
          if (!set.has(record.category)) {
            set.add(record.category);
            categoryArr.push({
              label: record.name,
              value: record.category,
            });
          }
        });
        setCategoryList(categoryArr);
        setOriginList(result);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(getList, []);

  useEffect(() => {
    query(name, month, type);
  }, [originList]);

  useEffect(() => {
    const costList = showList.filter((item) => item.type === EType.COST);
    const incomeList = showList.filter((item) => item.type === EType.INCOME);
    const costAll = costList.reduce((memo, cur) => {
      return memo + cur.amount;
    }, 0);
    const incomeAll = incomeList.reduce((memo, cur) => {
      return memo + cur.amount;
    }, 0);
    setCost(+costAll.toFixed(2));
    setIncome(+incomeAll.toFixed(2));
  }, [showList]);

  const handleMonthChange = (val: number) => {
    setMonth(val);
  };

  const handleTypeChange = (val: EType) => {
    setType(val);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.trim());
  };

  const query = (n: string, m: number, t: EType) => {
    const filterList = originList.filter((item) => {
      return (
        item.name.includes(n) &&
        [-1, item.month].includes(m) &&
        [-1, item.type].includes(t)
      );
    });
    setShowList(filterList);
  };

  const reset = () => {
    setName("");
    setMonth(-1);
    setType(-1);
    query("", -1, -1);
  };

  const handleOk = () => {
    if (commitLoading) return;
    setCommitLoading(true);
    const time = tmp.moment?.valueOf();
    fetch("/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tmp, time }),
    })
      .then((response) => response.json())
      .then(({ ret, msg }) => {
        if (ret !== 0) {
          return message.error(msg);
        }
        setShow(false);
        getList();
      })
      .finally(() => {
        setCommitLoading(false);
      });
  };

  const handleCancel = () => {
    setShow(false);
    setTmp({ ...initTmp });
  };

  const showModal = () => {
    setTmp({ ...initTmp, category: categoryList[0].value });
    setShow(true);
  };

  const onTimeOk = (moment: Moment) => {
    setTmp({ ...tmp, moment });
  };

  return (
    <div className="container">
      <Row>
        <Col span={5}>
          <span>分类：</span>
          <Input
            value={name}
            onChange={handleNameChange}
            style={{ width: 200 }}
            placeholder="请输入分类"
          />
        </Col>
        <Col span={5}>
          <span>月份：</span>
          <Select
            value={month}
            placeholder="请选择月份"
            style={{ width: 200 }}
            onChange={handleMonthChange}
          >
            <Select.Option value={-1}>全部</Select.Option>
            {months.map((item) => (
              <Select.Option value={item} key={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={5}>
          <span>类型：</span>
          <Select
            value={type}
            placeholder="请选择类型"
            style={{ width: 200 }}
            onChange={handleTypeChange}
          >
            <Select.Option value={-1}>全部</Select.Option>
            {types.map((item) => (
              <Select.Option value={item.value} key={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => query(name, month, type)}
            style={{ marginRight: 10 }}
          >
            查询
          </Button>
          <Button type="ghost" onClick={reset} style={{ marginRight: 10 }}>
            重置
          </Button>
          <Button type="dashed" onClick={showModal}>
            添加账单
          </Button>
        </Col>
      </Row>
      <Divider plain />
      <Row>
        <Col span={3}>收入：{income}</Col>
        <Col span={3}>支出：{cost}</Col>
      </Row>
      <Divider plain />
      <Row>
        <Col span={24}>
          <Table
            dataSource={showList}
            columns={columns}
            pagination={false}
            scroll={{ y: 400 }}
            loading={loading}
            rowKey="key"
          />
        </Col>
      </Row>
      <Modal
        title="添加账单"
        visible={show}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={commitLoading}
        okText="提交"
        cancelText="取消"
      >
        <Row>
          <Col span={3}>分类：</Col>
          <Col span={21}>
            <Select
              value={tmp.category}
              placeholder="请选择分类"
              style={{ width: 200 }}
              onChange={(c) => setTmp({ ...tmp, category: c })}
            >
              {categoryList.map((item) => (
                <Select.Option value={item.value} key={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Divider plain />
        <Row>
          <Col span={3}>金额：</Col>
          <Col span={21}>
            <Input
              type="number"
              value={tmp.amount}
              style={{ width: 200 }}
              onChange={(e) =>
                setTmp({ ...tmp, amount: Number(e.target.value) })
              }
            />
          </Col>
        </Row>
        <Divider plain />
        <Row>
          <Col span={3}>类型：</Col>
          <Col span={21}>
            <Select
              value={tmp.type}
              placeholder="请选择类型"
              style={{ width: 200 }}
              onChange={(type) => setTmp({ ...tmp, type })}
            >
              {types.map((item) => (
                <Select.Option value={item.value} key={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Divider plain />
        <Row>
          <Col span={3}>时间：</Col>
          <Col span={21}>
            <DatePicker
              showTime
              value={tmp.moment}
              onOk={onTimeOk}
              allowClear={false}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default App;
