import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../shared/models/user.model';
import {WebSocketSubject} from 'rxjs/observable/dom/WebSocketSubject';
import {IMessage} from '../shared/models/message.model';
import {AuthService} from '../shared/services/auth.service';
import {ChatService} from '../shared/services/chat.service';
import 'rxjs/add/operator/filter';

@Component({
    selector: 'benamix-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
    serverMessages: IMessage[];
    private socket$: WebSocketSubject<string>;
    currentUser: IUser;
    roomId: string;
    onlineUsers: IUser[] = [];

    constructor(private router: Router,
                private auth: AuthService,
                private chat: ChatService,
                private route: ActivatedRoute) {
        this.serverMessages = [];

        this.socket$ = WebSocketSubject.create('ws://195.110.58.76:8999');
        // this.socket$ = WebSocketSubject.create('ws://localhost:8999');
        this.socket$.subscribe(
            (message) => {
                const msg: IMessage = typeof message === 'string' ? JSON.parse(message) : message;
                if (msg.type && msg.type === 'MESSAGE_ID_TO_DELETE') {
                    this.serverMessages.forEach((messTD, index, array) => {
                        if (messTD._id === msg.id) {
                            this.serverMessages.splice(index, 1);
                        }
                    });
                } else {
                    if (msg.sender_id === '666' && msg.content === 'ONLINE_USERS') {
                        if (msg.chat_id instanceof Array && msg.chat_id.length) {

                            this.onlineUsers = msg.chat_id;

                        }
                    } else {
                        this.serverMessages.push(msg);
                    }
                }
            },
            (error) => {
                console.log(error);
            },
            () => {
                console.warn('Completed!');
            }
        );
    }

    ngOnInit() {
        this.currentUser = this.auth.getUser();

        this.route.queryParams
            .subscribe(
                param => {
                    if (param.room) {
                        this.roomId = param.room;
                    } else if (param.private) {
                        this.roomId = param.private;
                    }



                    this.chat.getAll().subscribe((chatMessages: IMessage[]) => {
                        this.serverMessages = chatMessages;
                        // this.scrollToBottom();
                    }, error => {
                        console.log(error);
                    });
                }
            );
        if (this.currentUser._id) {
            const status = {
                content: 'USER_CONNECTED',
                sender_id: this.currentUser._id,
                sender: this.currentUser.name,
                date: Date.now().toString(),
                chat_id: this.roomId,
                read: false
            };
            this.socket$.next(JSON.stringify(status));
        }
    }

    ngOnDestroy() {
        const status = {
            content: 'USER_DISCONNECTED',
            sender_id: this.currentUser._id,
            sender: this.currentUser.name,
            date: Date.now().toString(),
            chat_id: this.roomId,
            read: false
        };
        this.socket$.next(JSON.stringify(status));
        this.socket$.unsubscribe();
    }

    sendMessage(event: string) {
        this.socket$.next(event);
    }

}
