import { MessagesService } from './../../../services/messages.service';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.interface';
import { Messages } from 'src/app/models/messages.interface';
import { io } from 'socket.io-client';
import * as moment from 'moment';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {

  receiverId: string = '';
  receiverName: string = '';
  receiverUser = {} as User;
  senderUser = {} as User;
  messagesResponse = {} as Messages;
  message!: string;
  socket: any;
  typing: boolean = false;
  typingMessage!: NodeJS.Timeout;
  constructor(private route: ActivatedRoute, private usersService: UsersService, private tokenService: TokenService, private messagesService: MessagesService) {
    this.socket = io('http://localhost:3000'); // connect to the socket
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.receiverId = params['id']; // get the receiver id from the url
      this.getUser(); // get the receiver
    })
    this.senderUser = this.tokenService.getPayload(); // get the sender
    this.getMessages(this.senderUser._id, this.receiverId); // get all messages
    this.socket.on('reload', () => {
      this.getMessages(this.senderUser._id, this.receiverId); // get all messages after emit reload
    }
    );
    this.socket.on('is-typing', (data: { sender: string, receiver: string }) => {
      if (data.sender === this.receiverId) {
        this.typing = true;
      }
    });
    this.socket.on('stoped-typing', (data: { sender: string, receiver: string }) => {
      if (data.sender === this.receiverId) {
        this.typing = false;
      }
    });
  }
  ngAfterViewInit() {
    const params = { // object with snder id and receiver id
      sender: this.senderUser._id,
      receiver: this.receiverId
    }
    this.socket.emit('join-chat', params); // emit an event with params
  }

  getUser() {
    this.usersService.getUSerById(this.receiverId).subscribe({ //get reciver data
      next: (user) => {
        this.receiverUser = user; // set the receiver data
        this.receiverName = user.username; // set the receiver name

      },
      error: (err) => { console.log(err) },
      complete: () => { }

    }) // get the receiver

  }
  sendMessage() {
    this.messagesService.sendMessage(this.senderUser._id, this.receiverUser._id, this.receiverUser.username, this.message).subscribe({
      next: (data) => {
        this.message = ''; //reset message
      },
      error: (err) => { console.log(err) },
      complete: () => {
        this.socket.emit('reload'); // emit an event to reload the posts
      }

    })
  }

  getMessages(senderId: string, receiverId: string) {
    this.messagesService.getAllMessages(senderId, receiverId).subscribe({
      next: (data) => {
        this.messagesResponse = data; //get all messages
      },
      error(err) {
        console.log(err);
      }, complete() {

      },
    })
  }
  time(time: Date) {
    return moment(time).fromNow(); // return time from now
  }

  isTyping() {
    this.socket.emit('start-typing', {
      sender: this.senderUser._id,
      receiver: this.receiverId
    })
    if (this.typingMessage) {
      clearTimeout(this.typingMessage)
    }
    this.typingMessage = setTimeout(() => {
      this.socket.emit('stop-typing', {
        sender: this.senderUser._id,
        receiver: this.receiverId
      })
    }, 1000)
  }

}
