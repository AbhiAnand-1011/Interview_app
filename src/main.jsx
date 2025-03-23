import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store ,{persistor} from "./ReduxStore.jsx";
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import Page from './Page.jsx';
import { PersistGate } from "redux-persist/integration/react";

import '../index.css';
import { SocketProvider } from './socket/SocketProvider.jsx';
import Dashboard from './Dashboard.jsx';

createRoot(document.getElementById('root')).render(
 <SocketProvider>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    
    <Router>
      <Routes>
        
        <Route path="/Signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />}/>
        <Route path='/Dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>

    </PersistGate>
  </Provider>
  </SocketProvider>
);
