import "src/App.css";
import { Outlet } from "react-router-dom";
import Header from "src/components/header/Header";

function App() {
  return (
    <>
      <Header />
      <div>
        <Outlet />
      </div>
    </>
  );
}

export default App;
