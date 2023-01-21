import React from 'react';
import { Link } from 'react-router-dom';


function Nav(props) {


   return (
      <nav id="nav-wrap">
         <a className="mobile-btn" href="/#nav-wrap" title="Show navigation">Show navigation</a>
         <a className="mobile-btn" href="/#home" title="Hide navigation">Hide navigation</a>

         <ul id="nav" className="nav">
            <li className="current"><Link className="smoothscroll" to="/#home">Home</Link></li>
            <li><Link className="smoothscroll" to="/#about">About</Link></li>
            <li><Link className="smoothscroll" to="/#resume">Resume</Link></li>
            <li><Link className="smoothscroll" to="/#portfolio">Works</Link></li>
            <li><Link className="smoothscroll" to="/#contact">Contact</Link></li>
         </ul>
      </nav>
   );
}


export default Nav;
