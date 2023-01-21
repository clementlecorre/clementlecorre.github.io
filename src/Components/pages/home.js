import React, { useLayoutEffect } from 'react';
import About from '../About';
import Resume from '../Resume';
import Contact from '../Contact';
import Portfolio from '../Portfolio';
import Header from '../Header';
import { useLocation } from 'react-router-dom';

function Home(props) {
  const location = useLocation()
  useLayoutEffect(() => {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
  }, [location.hash]);

  return <div className="App">
        <Header data={props.state.main}/>
        <About data={props.state.main}/>
        <Resume data={props.state.resume}/>
        <Portfolio data={props.state.portfolio}/>
        <Contact data={props.state.main}/>
    </div>

}

export default Home;