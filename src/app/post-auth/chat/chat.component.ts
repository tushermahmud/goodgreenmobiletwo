import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonicModule, IonTextarea } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Conversation, JSONValue, Message } from '@twilio/conversations';
import { Observable, Subject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ChatService } from 'src/app/core/services/chat/chat.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { TokenResponse } from 'src/app/models/chat.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatComponent implements OnInit , OnDestroy {

	@ViewChild('chatElement') chatElement: any;
	@ViewChild('chatDisplay') chatDisplay: any;
	@ViewChild('txtArea') chatMsgInput: IonTextarea;

	@ViewChild("chatAreaContent") content: IonContent;

	token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzE2NTgxNGRmMDRmMWI5NWYxNWUxYmI2M2U0NjYyMWIzLTE2NTI2NzIwMDUiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJVU0VSX2Y3MjI5ZjJkLTgyMjAtNDI1Yi05MmQyLWRkYjk1OGM2MWI0YyIsImNoYXQiOnsic2VydmljZV9zaWQiOiJJU2NiZDdiMWVlOGQ5YjRjMmM5NjI3MmU2OTQwYmI2YTgxIn19LCJpYXQiOjE2NTI2NzIwMDUsImV4cCI6MTY1Mjc1ODQwNSwiaXNzIjoiU0sxNjU4MTRkZjA0ZjFiOTVmMTVlMWJiNjNlNDY2MjFiMyIsInN1YiI6IkFDNGJhYTJlOTRiZDcwYTYyYzk0ZjZkMTkyMGZlNDRkNWUifQ.itXkuXE8HL4fosV93ccsLPEVJM_nUX6QcxQw2zev1hk';
	dummyPP = 'https://prakya-360.s3.amazonaws.com/pa/orgs/ORG_1b7bdc67-23f7-4d32-8f56-6e6240c8db4d/users/profiles/11f00b27-b01e-4458-85a4-0772c48e1b46.jfif';
	dummyPP2 = 'https://prakya-360.s3.amazonaws.com/pa/orgs/ORG_1b7bdc67-23f7-4d32-8f56-6e6240c8db4d/users/profiles/87b183ef-4e02-450e-a854-ab64333df379.png';


	heraderInfo: GlobalHeaderObject = {
		isBackBtnVisible: true,
		isnotificationIconVisible: false,
		isUserProfileVisible: true,
		headerText: `Chat`
	};


	public isConnected = false;
	public isConnecting = false;
	public isGettingChannels = false;
	public channels: any[] = [];
	public channelObj: any;
	public chatMessage: string;
	public currentChannel: Conversation;
	public typeObservable: any;
	public messages: Message[] = [];
	public chatMsg: any[] = [];// holds all messages of convo
	public currentUsername: string = localStorage.getItem('twackUsername');
	public isMemberOfCurrentChannel = false;
	public membersTyping: any = [];
	serviceRequestData: any;

	authData: any;

	private conSub: any;
	private disconSub: any;
	getAuthState: Observable<any>;
	tokenResponse: any;

	// convo of a selected SR
	conversation: any;

	conVoFromTwilio: Conversation;
	chatDetail: any = [];
	participantsCount = 0;
	participantsList: any = null;

	// usingVArs
	public incomingMessage: Subject<Message> = new Subject();
	msgTxt = '';

	loader;

	constructor(
		private chatService: ChatService,
		private authService: AuthService,
		private loaderService: IonLoaderService,
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router
	) {
		this.getAuthState = this.store.select(selectAuthData);
		this.activatedRoute.queryParams.subscribe(params => {
			if (this.router.getCurrentNavigation().extras.state) {
				this.serviceRequestData = this.router.getCurrentNavigation().extras.state.opportunityId;
				console.log('this.serviceRequestData', this.serviceRequestData);

			}
		});
	}

	async ngOnInit() {
		this.isConnecting = true;
		// get getAuthState and Data
		this.getAuthState.subscribe(authMeta => {
			this.authData = authMeta;
			console.log('this.authData', this.authData);
			this.tokenResponse = this.authData.authMeta.chatToken;
			console.log('this.tokenResponse', this.tokenResponse);
		});

	    await this.loaderService.createLoading('Please wait, loading this conversation...');
		this.initChat();

	}

	initChat() {
		this.chatService.initializeChatService().then(async (tokenResp: TokenResponse) => {
			this.currentUsername = tokenResp.identity;
			console.log(`finished intializing channel listeners and window`);
			this.chatService.chatConnectedEmitter.subscribe((data: boolean) => {
				if(data) {
					this.isConnected = true;
					this.isConnecting = false;
					this.getConversationForSR(this.serviceRequestData);
				} else {
					this.isConnected = false;
					this.isConnecting = false;
					console.log('Error while connecting, Please try again ');
				}
			});
		});

		// this.initChat();
	}



	async getConversationForSR(srId) {
		console.log('srId / Opportunity Id===>>>', srId);
		this.chatService.getConversation(srId).subscribe({
			next: (data) => {
				if(!data) {return;}
				this.conversation = data;
				console.log('this.conversation', this.conversation);

				this.initializeEvents(this.conversation).then(() => {
					console.log('Initializing Events completed');
					this.loaderService.dismissLoading();
				}).catch(err => {
					console.log('initializeEvents Failed ==> ', err);
					this.loaderService.dismissLoading();
				});

				//  this.conVoFromTwilio.getParticipants().then(async (participants:Participant[]) => {
				// 	this.participantsCount = participants.length;

				// 	await Promise.all(
				// 		participants.map(async (particiapant:Participant) => {

				// 			const user = await particiapant.getUser();

				// 			this.participantsList.push({
				// 				identity: particiapant.identity,
				// 				friendlyName: user.friendlyName,
				// 				online: user.isOnline
				// 			})

				// 		})

				// 	).catch(err => {
				// 		console.log(`error fetching user for channel at getParticipantsInfo${err}`);
				// 	})

				// }).
				// catch(err => {
				// 	console.log(`error fetching user for channel ${err}`);
				// })
			},
			error: (error) => {
				this.loaderService.dismissLoading();
				console.log('Error in getting Conversations', error);
			}
		});

	}

	async initializeEvents(conversation ,  noOfUnreadMsg: number = 0) {

		this.chatService.getTwilioConversation(conversation.sid).then(async convoData => {

			console.log('getChannelgetChannel', convoData);
			this.conVoFromTwilio = convoData;

			this.conVoFromTwilio.on('messageAdded', (m) => {
				console.log('messageAdded', m);
				// this.messages.push(m);
				this.incomingMessage.next(m);
			});

			this.conVoFromTwilio.on('typingStarted', (m) => {
				console.log('typingStarted');

				this.membersTyping.push(m);
			});

			this.conVoFromTwilio.on('typingEnded', (m) => {
				console.log('typingEnded');
				const mIdx = this.membersTyping.findIndex(mem => mem.identity === m.identity);
				this.membersTyping = this.membersTyping.splice(mIdx, 0);
			});

			await this.conVoFromTwilio.getMessages().then(async msgObj => {
				console.log('msgObj ===>>>', msgObj);
				await this.conVoFromTwilio.setAllMessagesRead();
				this.populateChats(msgObj);

				this.incomingMessage.subscribe({
					next: (message) => {
						// this.scrollToBottomHandler();
						this.onMessageAdded(message);
						this.chatMsg = [...this.chatMsg];
					}
				});
				console.log('chatMsg ====>>>',this.chatMsg);
				this.scrollToBottom();
			});

		}).catch(err => {
			console.log('err');
			if(err){
				this.loaderService.dismissLoading();
			}

		});

	}

	transformMessages(){
		const tempArr = this.chatService.groupBy(this.chatMsg, 'msgDate');
		this.chatMsg = [...this.chatService.createarrayToBind(tempArr)];
		this.chatMsg =this.chatMsg;
	}

	convertToArrayObj(transformedMessages) {
		return Object.keys(transformedMessages).map((key) => [Number(key), transformedMessages[key]]);
	}

	onMessageAdded(message) {
		console.log(`UI received message from:${message.author}`, message);
		const msgObj = {
		  date: this.chatService.getDateFromTimeStamp(message.dateCreated),
		  id: message.sid,
		  name: message.attributes.username,
		  userId: message.author,
		  text: message.body,
		  isReceived: this.isRecieverOrSender(message?.author),
		  image: message?.attributes?.profileUrl,
		  firstMessageOfTheDay: false,
		  time: message.dateCreated,
		  msgDate:this.chatService.getDateFromTimeStamp(message.dateCreated),
		  meta:  message?.attributes
		};
		this.chatMsg.push(msgObj);

	}

	populateChats(msgObj) {
		this.chatMsg = [];
		msgObj.items?.forEach((message: any, i) => {
			const mo = {
				date: this.chatService.getDateFromTimeStamp(message?.dateCreated),
				id: message?.sid,
				name: message?.attributes?.username,
				userId: message?.author,
				text: message?.body,
				isReceived: this.isRecieverOrSender(message?.author),
				image: message?.attributes?.profileUrl,
				firstMessageOfTheDay: false,
				time: message?.dateCreated,
				msgDate: this.chatService.getDateFromTimeStamp(message?.dateCreated),
				meta:  message?.attributes
			};
			this.chatMsg.push(mo);
		});
	}

	isRecieverOrSender(author){
		return this.currentUsername === author ? false : true;
	}



	typing() {
		this.conVoFromTwilio.typing();
	}

	whosTyping() {
		return this.membersTyping.map(m => {
			if (m.identity !== this.currentUsername) {
				return m.identity;
			}
		}).join(', ');
	}

	submitMessage(txtArea){
		const msgTxt = txtArea.trim();
		const attributes = this.chatService.getMessageAttributes();
		console.log('Before sending ===>>', attributes);

		this.sendMessage(msgTxt, attributes).then((d) => {
			console.log('sendMessage', d);
			this.chatMsgInput.value = '';
			this.scrollToBottom();
		});
	}

	async sendMessage(message: string, attributes: object) {
        //await this.channel.messages(message, attributes);
        const messageAttributes = attributes as JSONValue;
        console.log('messageAttributes:', messageAttributes);
        await this.conVoFromTwilio.sendMessage(message, messageAttributes);
    }

	ngOnDestroy() {
		this.chatService.disconnect();
	}

    scrollToBottom() {
		if(this.content.scrollToBottom) {
			this.content.scrollToBottom();
		}
	}

	ionViewDidEnter() {
		this.scrollToBottom();
	}
}
