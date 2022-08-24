import React, { useState, useEffect, useRef } from 'react';

import './ReviewWindow.scss';
const ReviewWindow = () => {
  const [isReturned, setIsReturned] = useState(false);
  const [reviewList, setReviewList] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const reviewModifyInput = useRef(false);
  const reviewsCount = useRef(0);

  let isReviewExist = useRef(false);
  if (reviewList.length !== 0) isReviewExist.current = true;

  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsImV4cCI6MTY2MTM0OTE1OSwiaWF0IjoxNjYxMzEzMTU5fQ.P_njpAGkb9ckDFtiUlfClK8VM7A-ZJjg6GKQZrXc5bQ';

  const modifiedReviewList = reviewList.map(review => {
    let maskedName = review.name.replace(/^(.).*(.)$/, '$1**$2');
    let newDate = review.created_at.slice(0, review.created_at.indexOf('T'));
    return { ...review, name: maskedName, created_at: newDate };
  });

  // const reviewCount = reviewList.length;

  const authValidation = () => {
    fetch('http://10.58.2.193:3000/common/access', {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.result === true) {
          isReviewExist.current = !isReviewExist.current;
          setIsReturned(!isReturned);
        } else {
          alert('로그인이 필요한 기능입니다.');
        }
      });
  };

  const inputAuthValidation = () => {
    fetch('http://10.58.2.193:3000/common/access', {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.result !== true) alert('로그인이 필요한 기능입니다.');
      });
  };

  const putRevText = e => {
    setReviewText(e.target.value);
  };

  const submitReview = () => {
    fetch('http://10.58.2.193:3000/review/product/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ contents: reviewText }),
    }).then(() => {
      setIsReturned(!isReturned);
      setReviewText('');
    });
  };

  const openMyReviewListButton = () => {
    reviewModifyInput.current = true;
    setIsButtonClicked(!isButtonClicked);
  };

  const deleteMyReview = id => {
    fetch(`http://10.58.2.193:3000/review/product/1/${id}/my`, {
      method: 'DELETE',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reviewId: id }),
    }).then(() => setIsButtonClicked(!isButtonClicked));
  };

  const firstUpdate = useRef(false);

  useEffect(() => {
    if (firstUpdate.current) {
      fetch('http://10.58.2.193:3000/review/product/1/my', {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else if (res.ok === false) {
            alert('로그인이 필요힙니다.');
          }
        })
        .then(data => {
          setReviewList(data.data);
        });
    }
    firstUpdate.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isButtonClicked]);

  useEffect(() => {
    fetch('http://10.58.2.193:3000/review/product/1', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(res => {
        setReviewList(res.reviewList);
        reviewsCount.current = res.reviewCount['count(*)'];
      });
  }, [isReturned]);

  return (
    <div className="reviewWindow">
      <div className="reviewWindowWrap">
        <div className="reviewHeader">
          <h1 className="reviewHeaderTitle">상품 사용 후기</h1>
          <p className="reviewDescription">
            로그인하신 고객이 남겨주시는 상품후기입니다.
          </p>
          <div className="subHeader">
            <span className="subHeaderTitle">REVIEW |</span>
            <span className="subHeaderTitleDescription">
              모두 솔직한 상품평을 작성해 보아요!
            </span>

            <span className="reviewCount">({reviewsCount.current})</span>
            <p className="showMyReviewWrapper">
              <button className="showMyReview" onClick={openMyReviewListButton}>
                내 리뷰 보기.
              </button>
            </p>
          </div>
        </div>
        <div className="reviewContent">
          {!isReviewExist.current && (
            <div className="noReview">
              <p className="phraseNoReview">리뷰가 없습니다.</p>
              <p className="phrasePleaseReview">리뷰를 작성해 보세요!</p>
              <button className="openReviewInput" onClick={authValidation}>
                상품평 작성하기
              </button>
            </div>
          )}

          <div className={isReviewExist.current ? 'reviews' : 'reviewsHide'}>
            {modifiedReviewList.map(review => {
              return (
                <div className="reviewContainer" key={review.id}>
                  <div className="review">
                    <p className="reviewText">{review.contents}</p>
                  </div>
                  <div className="userInfo">
                    <div className="userInfoWrap">
                      <div className="userName">
                        <span className="userLevelTag">Basic</span>
                        <span className="reviewer">{review.name}</span>님의
                        리뷰입니다.
                      </div>
                      <div className="dateReviewWritten">
                        <span className="date">작성날짜: </span>
                        {review.created_at}
                      </div>
                    </div>
                    {reviewModifyInput.current && (
                      <div className="buttonWrapper">
                        <button
                          className="deleteThisReview"
                          onClick={() => deleteMyReview(review.id)}
                        >
                          삭제하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isReviewExist.current && (
              <div className="reviewInput">
                <div className="modifyInputWindow">
                  <textarea
                    className="reviewTextArea"
                    placeholder="내용을 입력하세요."
                    onChange={putRevText}
                    value={reviewText}
                    onClick={inputAuthValidation}
                  />

                  <div
                    className={
                      isReviewExist.current
                        ? 'reviewButtons'
                        : 'reviewButtonsHide'
                    }
                  >
                    <button className="cancelInput">작성취소</button>
                    <button className="registerInput" onClick={submitReview}>
                      등록하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReviewWindow;
