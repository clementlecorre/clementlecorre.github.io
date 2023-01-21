import React, { Component } from 'react';

function About(props) {
   if (props.data) {
      var name = props.data.name;
      var profilepic = "images/" + props.data.image;
      var bio = props.data.bio;
      var street = props.data.address.street;
      var city = props.data.address.city;
      var zip = props.data.address.zip;
      var email = props.data.email;
   }

   return (
      <section id="about">
         <div className="row">
            <div className="three columns">
               <img className="profile-pic" src={profilepic} alt="Clément LE CORRE Profile Pic" />
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

export default About;
