import React from "react";
import { Routes, Route } from "react-router-dom";
import InvoiceApp from "./invoice";
import ConsentForm from "./ConsentForm";
// import Dashboard from "./Dashboard";


function App() {
  return (
    <Routes>
      <Route path="/consent" element={<ConsentForm />} />
      <Route path="/invoice" element={<InvoiceApp />} />
      {/* <Route path="/dashboard" element={<InvoiceApp />} /> */}


    </Routes>
  );
}

export default App;
