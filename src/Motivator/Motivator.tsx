import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Motivator.module.sass';

import { SETTINGS } from '../settings';

import ContentBasicInfo from './ContentBasicInfo';
import ContentImageInfo from './ContentImageInfo';
import ContentLectureInfo from './ContentLectureInfo';

type T_motivator = {
  name_kor: string,
  name_eng: string,
  id: number,
  image: string | File,
  image_thumb: string,
};

const emptyData:T_motivator = {
  name_kor: "한글 이름 입력",
  name_eng: "Please enter english name",
  id: 0,
  image: "",
  image_thumb: ""
};

function MotivatorItem(props:any){
  return(
    <div className={styles.motivatorItem} onClick={()=>props.onClick ? props.onClick() : ''}>
      <div style={{
        background: "url(" + props.image_thumb + ")"
      }}>
      </div>
      <div>
        <p>{props.name_kor} <span>{props.name_eng}</span></p>
        <p>informations...</p>
      </div>
    </div>
  );
}

function Motivator() {

  const [motivatorList, setMotivatorList] = useState([]);
  const [motivator, setMotivator] = useState(emptyData);

  const refreshData = () => {

    axios.get(SETTINGS.REST_URL + '/motivators/')
    .then((res) => {
      if(res.status === 200){
        let motList = res.data.results.reduce((acc:any, curr:any, idx:number)=>{
          let mot:T_motivator = {
            name_eng: curr.name_eng,
            name_kor: curr.name_kor,
            image: curr.image,
            image_thumb: curr.image_thumb,
            id: curr.id
          };
          acc.push(mot);
          return acc;
        }, []);

        console.log(motList);
        setMotivatorList(motList);
      }
    }); 
 
  };

  useEffect(() => {

    refreshData();

  },[]);

  const onClickMotivator = (n:number) => {
    axios.get(SETTINGS.REST_URL + '/motivators/' + n)
      .then((res) => {
        if(res.status === 200){
          setMotivator({
            name_eng: res.data.name_eng,
            name_kor: res.data.name_kor,
            image: res.data.image,
            image_thumb: res.data.image_thumb,
            id: res.data.id
          });
        }
      });
  };

  const onBasicInfoChange = (new_mot:T_motivator) => {
    let mot = {...motivator};
    mot.name_kor = new_mot.name_kor;
    mot.name_eng = new_mot.name_eng;
    setMotivator(mot);
  };

  const onImageInfoChange = (file:File) => {
    let mot = {...motivator};
    mot.image = file;
    setMotivator(mot);
  };

  const onSaveMotivator = () => {
    let form = new FormData();
    form.append('name_eng', motivator.name_eng);
    form.append('name_kor', motivator.name_kor);

    if(motivator.image instanceof File){
      form.append('image', motivator.image);
    }

    if(motivator.id === 0){ // Create new instance

      axios.post(SETTINGS.REST_URL + "/motivators/", form)
        .then((res) => {
          console.log(res);
          if(res.status === 201){
            alert("저장 성공");
            onClickMotivator(res.data.id);
          }

          refreshData();
      });

    }else{ // Modify exist instance

      axios.put(SETTINGS.REST_URL + "/motivators/" + motivator.id + "/", form)
      .then((res) => {
        if(res.status === 200) alert("저장 성공");
        refreshData();
      });

    }
  };

  const onDeleteMotivator = () => {
    if(window.confirm("정말로 삭제하시겠습니까?")){
      axios.delete(SETTINGS.REST_URL + "/motivators/" + motivator.id + "/")
        .then((res) => {
          setMotivator(emptyData);
          refreshData();
        });
    }
  };

  return (
    <div className={styles.root}>

      <div className={styles.motivatorList}>
        <div
          className={styles.motivatorItem + ' ' + styles.new}
          onClick={()=>setMotivator(emptyData)}>
          추가하기
        </div>

        {motivatorList.map((d:T_motivator, i:number) => {
          return <MotivatorItem {...d} key={i} onClick={()=>onClickMotivator(d.id)} />
        })}
      </div>

      <div className={styles.content}>
        <ContentImageInfo src={motivator.image} onChange={onImageInfoChange} />
        <ContentBasicInfo data={motivator} onChange={onBasicInfoChange} />
        <ContentLectureInfo />
        <div className={styles.saveBox} onClick={()=>onSaveMotivator()}>
          <p>저장하기</p>
        </div>
        <div className={styles.deleteBox} onClick={()=>onDeleteMotivator()}>
          <p>삭제하기</p>
        </div>
      </div>

    </div>
  );
}

export default Motivator;
export type { T_motivator };
