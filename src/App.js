import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import './App.css';

import Home from './Components/pages/home';
import ThreeD from './Components/pages/ThreedAtHabx';
import Graphcurl from './Components/pages/GraphcurlAtHabx';
import Cypress from './Components/pages/CypressAtHabx';

import $ from 'jquery';
import Footer from './Components/Footer';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  useEffect(() => {
    ReactGA.initialize('UA-110570651-1');
    ReactGA.pageview(window.location.pathname);
  }, [])

  let [state, setState] = useState(null)

  useEffect(() => {
      $.ajax({
        url:'/resumeData.json',
        dataType:'json',
        cache: false,
        success: setState,
        error: function(xhr, status, err){
          console.log(err);
          alert(err);
        }
      });
    }, [])

    return state ?  (
      <>
      <Router>
          <Routes>
            <Route exact path='/' element={<Home state={state} />} />
            <Route exact path="/3d-at-habx" element={<ThreeD state={state}/>} />
            <Route exact path="/graphcurl-at-habx" element={<Graphcurl state={state}/>} />
            <Route exact path="/cypress-at-habx" element={<Cypress state={state}/>} />
          </Routes>
          <Footer data={state.main}/>
      </Router>

    </>
    ) : null;
}

export default App;
