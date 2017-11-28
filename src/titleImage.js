import React from 'react';

export default function TitleImage (props) {
  if (!props.id) {
         return null;
     }

  return(
    <div id="title-img">
      <img src={props.titleimageurl}/>
    </div>
  )
}
