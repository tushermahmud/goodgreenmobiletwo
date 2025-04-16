import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Client, Conversation, JSONValue, State } from '@twilio/conversations';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { environment } from 'src/environments/environment';
import { AppSettings } from '../../utils/app-settings';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { TokenResponse } from 'src/app/models/chat.model';
import { TwilioChat } from '../twilio/twilio';
@Injectable({
	providedIn: 'root'
})
export class ChatService {

	private GG_INTG = environment.ggIntegrationsChat;
	private openChatObs: BehaviorSubject<any> = new BehaviorSubject(null);
	private conversationsClient: Client; // use this
	private username: string;

	public openChatObs$ = this.openChatObs.asObservable();
	public chatConnectedEmitter: EventEmitter<any> = new EventEmitter<any>();
	public chatDisconnectedEmitter: EventEmitter<any> = new EventEmitter<any>();

	getAuthState: Observable<AuthState>;
	authData;
	tokenResponse: TokenResponse;


	constructor(
		private store: Store<AppState>,
		private http: HttpClient
	) {
		this.getAuthState = this.store.select(selectAuthData);
		this.getAuthState.subscribe(data => {
			this.authData = data;
		});
	}


	async connect(token: TokenResponse) {
		// if client exist close and open new client
		if (this.conversationsClient) {
			await this.conversationsClient.shutdown();
		} else {

			this.conversationsClient =  new Client(token.token);
			this.conversationsClient.on('stateChanged', async (state: State) => {
				if (state === 'initialized') {
					console.log(`received conversation client state:${state}`);
					this.chatConnectedEmitter.emit(true);
				} else {
					console.log(`failed to initialize chat, state:${state}`);
					this.chatConnectedEmitter.emit(false);
				}
			});

		}
	}

	async initializeChatService(refresh = false/* this param is not being used for now , need to build logic arround this */) {
		this.username = this.authData.authMeta?.customer?.email;
		await this.authenticate(false, this.authData.authMeta.customer.email , this.authData.authMeta.customer.fullname)
			.then((data) => {
				console.log(`got chat token for:${data.identity}`);
				return data;
			}).then(async data => {
				console.log(`got chat token for:${data.identity}`);
			}).catch((err) => {
				console.log(`failed to get chat token`);
			});

		await this.connect(this.tokenResponse).then(() => {
			console.log(`connected to twilio`);
		}).catch(err => {
			console.log(`failed to connect twilio ==> ${err}`);
			throw err;
		});
		console.log(`authService token ${JSON.stringify(this.tokenResponse)}`);

		return this.tokenResponse;
	}

	async authenticate(refresh: boolean, username: string, friendlyNm: string) {
		if (refresh) {
			// call api get new token
		} else {
			// use existing token from localstorage
			this.tokenResponse = this.authData.authMeta.chatToken;
		}
		return this.tokenResponse;
	}


	private async initializeChannelEvents() {
		this.conversationsClient.on(Client.conversationAdded, conversation => {
			this.addChatroom(conversation);
		});
	}

	async addChatroom(conversation: Conversation) {
		if (conversation.status === 'notParticipating') {
			await conversation.join().catch(err => {
				console.log('error==>', err);
			});
		}

		// getting unread messages count from each channel
		const noOfUnreadMsg = await conversation.getUnreadMessagesCount();



	}

	// getPublicChannels() {
	// 	return this.chatClient.getSubscribedConversations();
	// }

	async getTwilioConversation(sid: string): Promise<Conversation> {
		return await this.conversationsClient.getConversationBySid(sid);
	}

	// createChannel(name: string) {
	// 	return this.chatClient.createConversation({
	// 		friendlyName: name,
	// 		uniqueName: (+new Date()).toString(),
	// 		attributes: {
	// 			id: '123456789',
	// 			channelName: 'channel 1',
	// 			partnerId: 'PRTNR_56g7567567567567'
	// 		}
	// 	}).then((conv) => {
	// 		conv.join();
	// 	});
	// }

	getConversation(contextId): Observable<any> {
		return this.http.get(this.GG_INTG + `chat/conversations/${contextId}`);
	}

	/**
	 * converts time stamp to a formated date , returns formated date
	 *
	 * @returns
	 */
	getDateFromTimeStamp(timeStamp) {
		const formateddate = moment(timeStamp).format('L');
		return formateddate;

	}

	groupBy(messagesArray: any[], key) {

		return messagesArray[0].reduce((rv, x) => {
			console.log('rv, x', rv, x);

			(rv[x[key]] = rv[x[key]] || []).push(x);
			return rv;
		}, {});

	};

	createarrayToBind(array) {

		const spaghettiProperties = Object.keys(array);
		console.log('spaghettiProperties', spaghettiProperties);
		const neededArray = [];
		let i = 0;
		for (const prop of spaghettiProperties) {
			neededArray.push(array[prop]);
			neededArray[i].date = prop;
			i++;
			// console.log('SPEGGITYARR',prop)

		}
		return neededArray;

	}

	/**
	 * gets the user metadata sent as attributes for every chat message
	 *
	 * @returns
	 */
	 getMessageAttributes() {

		return {
			email: this.tokenResponse.identity,
			username: this.authData.authMeta.customer.fullname,
			profileImage: this.authData.authMeta.profileUrl,
			userId: this.authData.authMeta.userId,
			type: this.authData.authMeta.type,
			mailId: this.authData.authMeta.customer.email
		};
	}

	async disconnect() {
		if (this.conversationsClient) {
			await this.conversationsClient.shutdown();
			this.conversationsClient = null;
			// this.chatDisconnectedEmitter.next(true);
		}
	}
}
