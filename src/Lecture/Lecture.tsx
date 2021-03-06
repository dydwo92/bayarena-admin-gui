import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Lecture.module.sass';

import { SETTINGS } from '../settings';

import ContentImageInfo from './ContentImageInfo';
import ContentBasicInfo from './ContentBasicInfo';
import ContentMotivatorInfo from './ContentMotivatorInfo';

type T_lecture = {
  id: number,
  title: string,
  subtitle: string,
  date: string,
  motivators: number[],
  thumbs: string[],
  image: string | File,
};

const emptyData:T_lecture = {
  title: "Enter title",
  subtitle: "Enter sub titme",
  id: 0,
  date: "",
  motivators: [],
  thumbs: [],
  image: "",
};

function LectureItem(props:any){
  return(
    <div className={styles.lectureItem} onClick={()=>props.onClick ? props.onClick() : ''}>
      <p>{props.date}</p>
      <p className={styles.lectureTitle}>{props.title} <span>{props.subtitle}</span></p>
      <div className={styles.lectureThumb}>
        {props.thumbs.map((d:string, i:number) => {
          return <img src={SETTINGS.REST_URL + d} alt="" key={i} />
        })}
      </div>
    </div>    
  );
}

function Lecture() {

  const [lectureList, setLectureList] = useState([]);
  const [lecture, setLecture] = useState(emptyData);

  const refreshData = () => {
   axios.get(SETTINGS.REST_URL + '/lectures/')
    .then((res) => {
      if(res.status === 200){
        let lectureList = res.data.results.reduce((acc:any, curr:any, idx:number)=>{
          let lec:T_lecture = curr;
          acc.push(lec);
          return acc;
        }, []);

        console.log(lectureList);
        setLectureList(lectureList);
      }
    });   
  };

  useEffect(()=>{
    refreshData();
  }, []);

  const onClickLecture = (n:number) => {
    axios.get(SETTINGS.REST_URL + '/lectures/' + n)
      .then((res) => {
        if(res.status === 200){
          setLecture(res.data);
        }
      });
  };

  const onBasicInfoChange = (new_lec:T_lecture) => {
    let lec = {...lecture};
    lec.title = new_lec.title;
    lec.subtitle = new_lec.subtitle;
    lec.date = new_lec.date;
    setLecture(lec);
  };

  const onImageInfoChange = (file:File) => {
    let lec = {...lecture};
    lec.image = file;
    setLecture(lec);
  };

  const onSaveLecture = () => {

    let form = new FormData();
    form.append('title', lecture.title);
    form.append('subtitle', lecture.subtitle);
    form.append('date', lecture.date);
    form.append('motivators', "1");

    if(lecture.image instanceof File){
      form.append('image', lecture.image);
    }

    if(lecture.id === 0){ // Create new instance

      axios.post(SETTINGS.REST_URL + "/lectures/", form)
        .then((res) => {
          console.log(res);
          if(res.status === 201){
            alert("?????? ??????");
            onClickLecture(res.data.id);
          }

          refreshData();
      });

    }else{ // Modify exist instance

      axios.put(SETTINGS.REST_URL + "/lectures/" + lecture.id + "/", form)
      .then((res) => {
        if(res.status === 200) alert("?????? ??????");
        refreshData();
      });

    }

  };

  const onDeleteLecture = () => {
    if(window.confirm("????????? ?????????????????????????")){
      axios.delete(SETTINGS.REST_URL + "/lectures/" + lecture.id + "/")
        .then((res) => {
          setLecture(emptyData);
          refreshData();
        });
    }
  };

  return (
    <div className={styles.root}>

      <div className={styles.lectureList}>
        <div className={styles.newClass} onClick={()=>setLecture(emptyData)}>????????????</div>
        {lectureList.map((d:T_lecture,i:number) => {
          return <LectureItem {...d} key={i} onClick={()=>onClickLecture(d.id)} />
        })}
      </div>

      <div className={styles.content}>
        <ContentImageInfo src={lecture.image} onChange={onImageInfoChange}/>
        <ContentBasicInfo data={lecture} onChange={onBasicInfoChange} />
        <ContentMotivatorInfo />
        <div className={styles.saveBox} onClick={()=>onSaveLecture()}>
          <p>????????????</p>
        </div>
        <div className={styles.deleteBox} onClick={()=>onDeleteLecture()}>
          <p>????????????</p>
        </div>
      </div>
    </div>
  );
}

export default Lecture;
export type { T_lecture };