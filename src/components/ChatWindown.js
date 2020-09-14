import React, { useState, useEffect, useRef } from "react";
import "./ChatWindown.css";

import Api from "../Api";

import MessageItem from "./MessageItem";

import SearchIcon from "@material-ui/icons/Search";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import CloseIcon from "@material-ui/icons/Close";
import SendIcon from "@material-ui/icons/Send";
import MicIcon from "@material-ui/icons/Mic";
import EmojiPicker from "emoji-picker-react";

export default ({ user, data }) => {
  let recognition = null;
  let SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition !== undefined) {
    recognition = new SpeechRecognition();
  }

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);

  const body = useRef();

  useEffect(() => {
    if (body.current.scrollHeight > body.current.offsetHeight) {
      body.current.scrollTop =
        body.current.scrollHeight - body.current.offsetHeight;
    }
  }, [list]);

  useEffect(() => {
    setList([]);
    let unsub = Api.onChatContent(data.chatId, setList, setUsers);
    return unsub;
  }, [data.chatId]);

  const handleEmojiClick = (e, emojiObject) => {
    setText(text + emojiObject.emoji);
  };

  const handleOpenEmoji = () => {
    setEmojiOpen(true);
  };

  const handleCloseEmoji = () => {
    setEmojiOpen(false);
  };

  const handleMicClick = () => {
    if (recognition !== null) {
      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onresult = (e) => {
        setText(e.results[0][0].transcript);
      };

      recognition.start();
    }
  };

  const handleSendClick = () => {
    if (text !== "") {
      Api.sendMessage(data, user.id, "text", text, users);
      setText("");
      setEmojiOpen(false);
    }
  };

  const handleInputKeyUp = (e) => {
    if (e.keyCode === 13) {
      handleSendClick();
    }
  };

  return (
    <div className="chatWindow">
      <div className="chatWindow--header">
        <div className="chatWindow--headerinfo">
          <img className="chatWindow--avatar" src={data.image} alt="avatar" />
          <div className="chatWindow--name">{data.title}</div>
        </div>
        <div className="chatWindow--headerbuttons">
          <div className="chatWindow--btn">
            <SearchIcon style={{ color: "#919191" }} />
          </div>
          <div className="chatWindow--btn">
            <AttachFileIcon style={{ color: "#919191" }} />
          </div>
          <div className="chatWindow--btn">
            <MoreVertIcon style={{ color: "#919191" }} />
          </div>
        </div>
      </div>
      <div ref={body} className="chatWindow--body">
        {list.map((item, key) => (
          <MessageItem key={key} data={item} user={user} />
        ))}
      </div>
      <div
        className="chatWindow--emojiarea"
        style={{ height: emojiOpen ? "200px" : "0px" }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          disableSearchBar
          disableSkinTonerPicker
        />
      </div>
      <div className="chatWindow--footer">
        <div className="chatWindow--pree">
          <div
            className="chatWindow--btn"
            onClick={handleCloseEmoji}
            style={{ width: emojiOpen ? 40 : 0 }}
          >
            <CloseIcon style={{ color: "#919191" }} />
          </div>
          <div className="chatWindow--btn" onClick={handleOpenEmoji}>
            <InsertEmoticonIcon
              style={{ color: emojiOpen ? "#009688" : "#919191" }}
            />
          </div>
        </div>
        <div className="chatWindow--inputarea">
          <input
            placeholder="Digite uma mensagem"
            type="text"
            className="chatWindow--input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyUp={handleInputKeyUp}
          />
        </div>
        {text === "" && (
          <div onClick={handleMicClick} className="chatWindow--pos">
            <MicIcon style={{ color: listening ? "#126ece" : "#919191" }} />
          </div>
        )}
        {text !== "" && (
          <div onClick={handleSendClick} className="chatWindow--pos">
            <SendIcon style={{ color: "#919191" }} />
          </div>
        )}
      </div>
    </div>
  );
};
