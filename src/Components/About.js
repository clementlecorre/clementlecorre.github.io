import React, { Component } from 'react';

class About extends Component {
  render() {

    if(this.props.data){
      var name = this.props.data.name;
      var profilepic= "images/"+this.props.data.image;
      var bio = this.props.data.bio;
      var street = this.props.data.address.street;
      var city = this.props.data.address.city;
      var zip = this.props.data.address.zip;
      var email = this.props.data.email;
    }

    return (
      <section id="about">
      <div className="row">
         <div className="three columns">
            <img className="profile-pic"  src={profilepic} alt="Clément LE CORRE Profile Pic" />
         </div>
         <div className="nine columns main-col">
            <h2>A propos de moi</h2>

            <p>{bio}</p>
            <div className="row">
               <div className="columns contact-details">
                  <h2>Contact</h2>
                  <p className="address">
						   <span>{name}</span><br />
						   <span>{street}<br />
						         {city}, {zip}
                   </span><br />
                     <span>{email}</span>
					   </p>
               </div>

            </div>
         </div>
      </div>

   </section>
    );
  }
}

export default About;