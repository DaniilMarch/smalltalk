import React, { useEffect } from "react";
import io from "socket.io-client";
import { connect } from "react-redux";

import MessagesFeed from "./MessagesFeed";
import MessageForm from "./MessageForm";
import { addMessage, setSocket } from "../../actions/messagesActions";

const Chat = props => {
  useEffect(() => {
    const token = localStorage.token;
    const socket = io
      .connect("http://localhost:4000", {
        query: { token: token }
      })
      .on("message", message => {
        console.log(message);
        props.addMessage(message);
      });
    props.setSocket(socket);
  }, []);
  return (
    <div>
      <MessagesFeed />
      <MessageForm />
    </div>
  );
};

const mapStateToProps = state => {
  return {};
};

export default connect(
  mapStateToProps,
  { addMessage, setSocket }
)(Chat);