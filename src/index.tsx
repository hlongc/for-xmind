import ReactDOM from "react-dom/client";
import Books from "./books";
import { ConfigProvider } from "antd";
import zh_CN from "antd/es/locale-provider/zh_CN";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ConfigProvider locale={zh_CN}>
    <Books />
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
