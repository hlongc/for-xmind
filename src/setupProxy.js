const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const bodyParser = require("body-parser");

const readFile = promisify(fs.readFile);
const appendFile = promisify(fs.appendFile);

const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

const addZero = (val) => (val > 9 ? `${val}` : `0${val}`);

const getTime = (timeStamp) => {
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const seconds = date.getSeconds();
  return { year, month, day, hour, minute, seconds };
};

let categoryData = [];
let categoryMap = new Map();

const handleData = (data) => {
  const list = data.split("\n");
  const result = [];
  if (list.length) {
    const [titles, ...datas] = list;
    const titleArr = titles.split(",");
    const map = {};
    const initObj = titleArr.reduce((memo, title, index) => {
      memo[title] = "";
      map[index] = title;
      return memo;
    }, {});
    datas.forEach((row) => {
      const content = row.split(",");
      const cloneObj = { ...initObj };
      content.forEach((col, index) => {
        cloneObj[map[index]] = col;
      });
      result.push(cloneObj);
    });
  }
  return result;
};

module.exports = async function (app) {
  app.use(bodyParser.json());

  app.use("/create", async (req, res) => {
    try {
      const { type, category, amount, time } = req.body;
      if (!categoryMap.has(category)) {
        return res.send({ ret: 1, msg: "分类不合法" });
      }
      const data = `\n${type},${time},${category},${amount}`;
      await appendFile(resolvePath("./file/bill.csv"), data);
      res.send({ ret: 0, msg: "success" });
    } catch (e) {
      console.log(e);
      res.send({ ret: 1, msg: "服务器异常" });
    }
  });

  app.use("/get/list", async (_req, res) => {
    try {
      const data = await readFile(resolvePath("./file/bill.csv"), "utf8");
      const result = handleData(data);
      if (!categoryData.length) {
        const categoryOriginData = await readFile(
          resolvePath("./file/categories.csv"),
          "utf8"
        );
        categoryData = handleData(categoryOriginData);
        // 保存映射关系
        categoryData.forEach((category) => {
          categoryMap.set(category.id, category.name);
        });
      }
      result.forEach((item) => {
        item.name = categoryMap.get(item.category);
        item.time = Number(item.time);
        item.type = Number(item.type);
        item.amount = Number((+item.amount).toFixed(2));
        const { year, month, day, hour, minute, seconds } = getTime(item.time);
        item.month = month;
        item.date = `${year}-${addZero(month)}-${addZero(day)} ${addZero(
          hour
        )}:${addZero(minute)}:${addZero(seconds)}`;
      });
      res.send({ ret: 0, msg: "success", result });
    } catch (e) {
      res.send({ ret: 1, msg: "服务器异常", result: [] });
      console.log(e);
    }
  });
};
