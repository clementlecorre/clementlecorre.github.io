import React from 'react';
import { Link } from 'react-router-dom';

function Footer(props) {

  if (props.data) {
    var networks = props.data.social.map(function (network) {
      return <li key={network.name}><a href={network.url}><i className={network.className}></i></a></li>
    })
  }

  return (
    <footer>

      <div className="row">
        <div className="twelve columns">
          <ul className="social-links">
            {networks}
          </ul>

          <ul className="copyright">
            <li>&copy; Copyright 2018 Clément LE CORRE</li>
            <li>Make with ❤️</li>
          </ul>

        </div>
        <div id="go-top"><Link className="smoothscroll" title="Back to home" to="/#home"><i className="icon-up-open"></i></Link></div>
      </div>
    </footer>
  );
}


export default Footer;
