import { Avatar, Button, IconButton, useRadioGroup } from "@material-ui/core";
import  MoreVertIcon  from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import  InsertEmotIcon  from "@material-ui/icons/InsertEmoticon";
import MickIcon  from "@material-ui/icons/mic";
import { useState } from "react";
import firebase from "firebase";
import Message from "./Message";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
import { useRef } from "react";


function ChatScreen({ chat, messages}) {
    const [user] = useAuthState(auth);
    const [input, setInput] = useState("");
    const endOfMessagesRef = useRef(null);
    const router = useRouter();
    const [messagesSnapshot] = useCollection(db.collection('chats').doc(router.query.id).collection('messages').orderBy('timestamp','asc'));
    
    const [recipientSnapshot] = useCollection(
        db.collection('users')
        .where('email', '==', getRecipientEmail(chat.users, useRadioGroup))
    )
    const showMessages = () => {
        if (messagesSnapshot) {
            return messagesSnapshot
            .docs.map(message => (
                <Message 
                    key = {message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime(),
                    }}
                />
            ));
        }else {
            return JSON.parse(messages).map(message => (
                <Message key={message.id} user={message.user} message={message}/>
            ))
        }
    };

   const scrollToBottom = () => {
       endOfMessagesRef.current.scrollIntoView({
           behavior: "smooth",
           block:"start",
       });
   }
    
    const sendMessage = (e) => {
         e.preventDefault();

         db.collection("users")
         .doc(user.uid)
         .set({
             lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
         }, {merge: true});

         db.collection('chats').doc(router.query.id).collection('messages').add({
             timestamp: firebase.firestore.FieldValue.serverTimestamp(),
             message: input,
             user: user.email,
             photoURL : user.photoURL, 
         });

         setInput("");
         scrollToBottom();
    };
    
    const recipient = recipientSnapshot?.docs?.[0]?.data();
    const recipientEmail =  getRecipientEmail(chat.users, user);
    return (
        <Container>
         <Header>
             {recipient ? (
                 <Avatar src={recipient?.photoURL} />
             ): (
                 <Avatar>{recipientEmail[0]}</Avatar>
             )}
              <HeaderInformation>
                  <h3>{recipientEmail}</h3>

                  {recipientSnapshot? (
                    <p> Last Seen: {''}
                       {recipient?.lastSeen?.toDate() ? (
                           <TimeAgo datetime={recipient?.lastSeen?.toDate()}/>
                       ): "Unavailabe"}
                    </p>
                  ) : (
                      <p>Loading Last Seen..</p>
                  )}
              </HeaderInformation>
              <HeaderIcons>
                 <IconButton><MoreVertIcon/></IconButton>
                 <IconButton><AttachFileIcon/></IconButton>
              </HeaderIcons>
         </Header>
         
         <MessageContainer>
           {showMessages()}    
         <EndOfMessage ref={endOfMessagesRef}/>
         </MessageContainer>
         <InputContainer >
             <InsertEmotIcon />
             <Input value={input} onChange={e => setInput(e.target.value)} />
              <Send>
              <Button disabled={!input} type="submit" onClick={sendMessage}>Send</Button>
              </Send>
             <MickIcon />
         </InputContainer>
        </Container>
    )
}

export default ChatScreen

const Container = styled.div``;

const Input = styled.input`
  flex:1;
  outline: 0;
  border:none;
  border-radius: 15px;
  background-color: whitesmoke;
  padding: 20px;
  margin-left: 15px;
  margin-right: 15px;
  
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const Send = styled.div`
 background-color: lightgray;
 color: black;
 border-radius: 20px 10px 15px;
`;

const Header = styled.div`
position: sticky;
background-color:white;
z-index: 100;
top:0;
display:flex;
padding:11px;
height: 80px;
align-items:center;
border-bottom: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
   margin-left: 15px;
   flex: 1; 

   >h3 {
       margin-bottom: 3px;
   }
   > p {
       font-size:14px;
       color:gray;
   }
`;

const HeaderIcons = styled.div``;

const EndOfMessage = styled.div`
 margin-bottom: 50px;
`;

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`;