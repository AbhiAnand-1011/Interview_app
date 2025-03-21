import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store ,{persistor} from "./ReduxStore.jsx";
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import Page from './Page.jsx';
import { PersistGate } from "redux-persist/integration/react";

import './index.css';
import { SocketProvider } from './socket/SocketProvider.jsx';

createRoot(document.getElementById('root')).render(
 <SocketProvider>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    
    <Router>
      <Routes>
        
        <Route path="/Signup" element={<Signup />} /> 
        <Route path="/" element={<Page />} /> 
        <Route path="/login" element={<Login />}/>
        
      </Routes>
    </Router>

    </PersistGate>
  </Provider>
  </SocketProvider>
);
