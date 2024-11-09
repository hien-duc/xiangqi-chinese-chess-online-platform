import ChineseChess from "../components/ChineseChess";
// import XiangqiBoard from "../components/XiangqiBoard";
import global from "../app/globals.css";

export default function Home() {
  return (
    <main className={global}>
      <ChineseChess />
    </main>
  );
}
