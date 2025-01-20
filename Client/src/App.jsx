// import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/Home";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;