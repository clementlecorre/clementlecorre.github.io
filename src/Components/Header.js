import React from 'react';
import Nav from './Nav';
import { Link } from 'react-router-dom';

function Header(props) {
   if (props.data) {
      var name = props.data.name;
      var occupation = props.data.occupation;
      var description = props.data.description;
      var networks = props.data.social.map(function (network) {
         return <li key={network.name}><a href={network.url}><i className={network.className}></i></a></li>
      })
   }
   

   return (
      <header id="home">

         <Nav {...props} />

         <div className="row banner">
            <div className="banner-text">
               <h1 className="responsive-headline">{name}</h1>
               <h3><span>{occupation}</span> {description}</h3>
               <hr />
               <ul className="social">
                  {networks}
               </ul>
            </div>
         </div>

         <p className="scrolldown">
            <Link className="smoothscroll" to="/#about"><i className="icon-down-circle"></i></Link>
         </p>

      </header>
   );
}


export default Header;
