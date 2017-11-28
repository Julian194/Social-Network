import React from 'react';

export default function ProfilePic (props) {
  if (!props.user.id) {
         return null;
     }

  return(
    <div id="profilePic">
      <img onClick={props.onClick} src={props.user.profilePicUrl} alt={`${props.user.firstName} ${props.user.lastName}`}></img>
    </div>
  )
}
