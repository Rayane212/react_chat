import React from 'react';

const Message = () => {
    return (
        <div className='message owner'>
            <div className="messageInfo">
                <img src="https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                <span>just now</span>
            </div>
            <div className="messageContent">
                <p>Hello</p>
                <img src="https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
            </div>
        </div>
    );
};

export default Message;