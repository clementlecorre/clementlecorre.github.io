import React from 'react';
import { Link } from 'react-router-dom';

function Portfolio(props) {
  if (props.data) {
    var projects = props.data.projects.map(function (project) {
      const projectImage = 'images/portfolio/' + project.image;
      if (project.url_internal) {
        return (
          <div key={project.title} className="columns portfolio-item">
            <div className="item-wrap">
              <Link to={project.url}>
                <img alt={project.title} src={projectImage} />
                <div className="overlay">
                  <div className="portfolio-item-meta">
                    <h5>{project.title}</h5>
                    <p>{project.category}</p>
                  </div>
                </div>
                <div className="link-icon"><i className="fa fa-link"></i></div>
              </Link>
            </div>
          </div>
        );
      } else {
        return (
          <div key={project.title} className="columns portfolio-item">
            <div className="item-wrap">
              <a title={project.title} href={project.url} target="_blank" rel="noopener noreferrer">
                <img alt={project.title} src={projectImage} />
                <div className="overlay">
                  <div className="portfolio-item-meta">
                    <h5>{project.title}</h5>
                    <p>{project.category}</p>
                  </div>
                </div>
                <div className="link-icon"><i className="fa fa-link"></i></div>
              </a>
            </div>
          </div>
        );
      }
    });
  }

  return (
    <section id="portfolio">
      <div className="row">
        <div className="twelve columns collapsed">
          <h1>Jetez un coup d'œil à certains de mes projets.</h1>
          <div id="portfolio-wrapper" className="bgrid-quarters s-bgrid-thirds cf">
            {projects}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
