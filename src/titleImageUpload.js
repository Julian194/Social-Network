import React from 'react'
import axios from 'axios';


export default function TitleImageUpload(props) {

  const setFile = (e) => {
    var file = e.target.files[0];
    upload(file)
  }

  const upload = (file) => {
    var formData = new FormData();
    formData.append('file', file);
    axios.post('/uploadTitleImage',
    formData
    ).then(({data}) => {
      if(data.success){
        props.updateTitleImg(data.url)
      }
    })
  }

  return(
    <div>
      <label  id="title-upload-button" htmlFor="file"><i className="fa fa-cloud-upload"></i></label>
      <input type="file" id="file" onChange={setFile}></input>
    </div>
  )
}
