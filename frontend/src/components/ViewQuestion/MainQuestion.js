import { Avatar } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import HistoryIcon from "@material-ui/icons/History";
import ReactQuill from "react-quill";
import Editor from "react-quill/lib/toolbar";
import axios from "axios";
import ReactHtmlParser from "react-html-parser";
import { Link } from "react-router-dom";
import names from './data'
import "./index.css";
import { useSelector } from "react-redux";
import { selectUser } from "../../feature/userSlice";
import { stringAvatar } from "../../utils/Avatar";
import API_URL from "../../api/Api";

function MainQuestion() {
  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    // [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [
      { color: ["#ff0000", "#00ff00", "#0000ff", "#220055"] },
      { background: [] },
    ], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];
  Editor.modules = {
    syntax: false,
    toolbar: toolbarOptions,
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  Editor.formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

  let search = window.location.search;
  const params = new URLSearchParams(search);
  const id = params.get("q");

  const [questionData, setQuestionData] = useState();
  const [answer, setAnswer] = useState("");
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState("");
  const [value, setValue] = useState(0);
  const user = useSelector(selectUser);
  const handleQuill = (value) => {
    setAnswer(value);
  };

  const handleIncrement= async()=>{
    const data=questionData?.votes+1
    let body={title:questionData.title, votes:data}
    const res=await 
    axios.get(`${API_URL}/question/${id}`)
    await axios.put(`${API_URL}/question/${res.data[0]._id}`,body)
    .then(() => {
      setValue(questionData?.votes+1)
    })
    .catch((err) => console.log(err));
  }
  const handleDecrement=async()=>{
    const data=questionData?.votes-1
    let body={title:questionData.title, votes:data}
    const res=await 
    axios.get(`${API_URL}/question/${id}`)
    await axios.put(`${API_URL}/question/${res.data[0]._id}`,body)
    .then(() => {
      setValue(questionData?.votes-1)
    })
    .catch((err) => console.log(err));   
  }

  useEffect(() => {
    async function getFunctionDetails() {
      await axios
        .get(`${API_URL}/question/${id}`)
        .then((res) => {
          setQuestionData(res.data[0])
        })
        .catch((err) => console.log(err));
    }
    getFunctionDetails();
  }, [id]);
 
  async function getUpdatedAnswer() {
    await axios
      .get(`${API_URL}/question/${id}`)
      .then((res) =>{ setQuestionData(res.data[0])
      })
      .catch((err) => console.log(err));
  }

  const handleSubmit = async () => {
    const body = {
      question_id: id,
      answer: answer,
      votes:value,
      user: user,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    await axios
      .post(`${API_URL}/answer`, body, config)
      .then(() => {
        alert("Answer added successfully");
        setAnswer("");
        getUpdatedAnswer();
      })
      .catch((err) => console.log(err));
  };

  const handleComment = async () => {
    if (comment !== "") {
      const body = {
        question_id: id,
        comment: comment, 
        user: user,
      };
      await axios.post(`${API_URL}/comment/${id}`, body).then((res) => {
        setComment("");
        setShow(false); 
        getUpdatedAnswer();
      });
    }
  };
  return (
    <div className="main">
      <div className="main-container">
        <div className="main-top">
          <h2 className="main-question">{questionData?.title} </h2>
          <Link to="/add-question">
            <button>Ask Question</button>
          </Link>
        </div>
        <div className="main-desc">
          <div className="info">
            <p>
              Asked
              <span>{new Date(questionData?.created_at).toLocaleString()}</span>
            </p>
            <p>
              Active<span>today</span>
            </p>
            <p>
              Viewed<span>43times</span>
            </p>
          </div>
        </div>
        <div className="all-questions">
          <div className="all-questions-container">
            <div className="all-questions-left">
              <div className="all-options">
                <p className="arrow" onClick={handleIncrement} style={{cursor:"pointer"}}>▲</p>

                <p className="arrow">{questionData?.votes}</p>

                <p className="arrow" onClick={handleDecrement} style={{cursor:"pointer"}}>▼</p>

                <BookmarkIcon />

                <HistoryIcon />
              </div>
            </div>
            <div className="question-answer">
              <p>{ReactHtmlParser(questionData?.body)}</p>

              <div className="author">
                <small>
                  asked {new Date(questionData?.created_at).toLocaleString()}
                </small>
                <div className="auth-details">
                  <Avatar {...stringAvatar(questionData?.user?.displayName)} />
                  <p>
                    {questionData?.user?.displayName
                      ? questionData?.user?.displayName
                      : "Lisan"}
                  </p>
                </div>
              </div>
              <div className="comments">
                <div className="comment">
                  {questionData?.comments &&
                    questionData?.comments.map((_qd) => (
                      <p key={_qd?._id}>
                        {_qd.comment}{" "}
                        <span>
                          - {_qd.user ? _qd.user.displayName : "Nate Eldredge"}
                        </span>{" "}
                        {"    "}
                        <small>
                          {new Date(_qd.created_at).toLocaleString()}
                        </small>
                      </p>
                    ))}
                </div>
                <p onClick={() => setShow(!show)}>Add a comment</p>
                {show && (
                  <div className="title">
                    <textarea
                      style={{
                        margin: "5px 0px",
                        padding: "10px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        borderRadius: "3px",
                        outline: "none",
                      }}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      type="text"
                      placeholder="Add your comment..."
                      rows={5}
                    />
                    <button
                      onClick={handleComment}
                      style={{
                        maxWidth: "fit-content",
                      }}
                    >
                      Add comment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            flexDirection: "column",
          }}
          className="all-questions"
        >
          <p
            style={{
              marginBottom: "20px",
              fontSize: "1.3rem",
              fontWeight: "300",
            }}
          >
            {questionData && questionData?.answerDetails.length} Answers
          </p>
          {questionData?.answerDetails.map((_q) => (
            <>
              <div
                style={{
                  borderBottom: "1px solid #eee",
                }}
                key={_q._id}
                className="all-questions-container"
              >
                <div className="all-questions-left">
                  <div className="all-options">
                  <p className="arrow" style={{cursor:"pointer"}}>▲</p>
                  <p className="arrow">0</p>
                  <p className="arrow" style={{cursor:"pointer"}}>▼</p>
                    <BookmarkIcon />

                    <HistoryIcon />
                  </div>
                </div>
                <div className="question-answer">
                  {ReactHtmlParser(_q.answer)}
                  <div className="author">
                    <small>
                      asked {new Date(_q.created_at).toLocaleString()}
                    </small>
                    <div className="auth-details">
                      <Avatar {...stringAvatar(_q?.user?.displayName)} />
                      <p>
                        {_q?.user?.displayName
                          ? _q?.user?.displayName
                          : names}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
      <div className="main-answer">
        <h3
          style={{
            fontSize: "22px",
            margin: "10px 0",
            fontWeight: "400",
          }}
        >
          Your Answer
        </h3>
        <ReactQuill
          value={answer}
          onChange={handleQuill}
          modules={Editor.modules}
          className="react-quill"
          theme="snow"
          style={{
            height: "200px",
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "100px",
          maxWidth: "fit-content",
        }}
      >
        Post your answer
      </button>
    </div>
  );
}

export default MainQuestion;
