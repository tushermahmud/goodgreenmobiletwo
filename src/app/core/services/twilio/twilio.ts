import { Conversation, JSONValue, Message } from '@twilio/conversations';
import { Subject } from 'rxjs';
// import { UnreadMessageInfo } from "src/app/models/chat.model";

export class TwilioChat {

	readonly currentUsername: string;
	readonly lastMessageTime: Date;
	id: string;
	uniqueName: string;
	friendlyName: string;
	conversation: Conversation;
	messages: Message[];
	membersTyping: any = [];
	noOfUnreadMsg: number;

	public incomingMessage: Subject<Message>;
    public typingUsers: Subject<string>;

    public videoChannel: Subject<any>;

    public noOfUnreadMsgObs: Subject<any>;

    constructor(currentUsername: string, lastMessageTime: Date) {
        this.currentUsername = currentUsername;
        this.lastMessageTime = lastMessageTime;
        this.incomingMessage = new Subject();
        this.typingUsers = new Subject();
        this.videoChannel = new Subject();
        this.noOfUnreadMsgObs = new Subject();
    }


    get CurrentUser() {
        return this.currentUsername;
    }

	async initialize() {

		this.messages = [];
		this.membersTyping = [];

		this.conversation.on('messageAdded', (message) => {
			this.messages.push(message);
			this.incomingMessage.next(message);
			console.log('TwilioChat ===>>',this.messages );

			this.conversation.getUnreadMessagesCount().then( noOfUnreadMsg => {
				this.noOfUnreadMsg = noOfUnreadMsg;
				this.noOfUnreadMsgObs.next({
					channelName: this.conversation.friendlyName,
					id: this.conversation.sid,
					message,
					noOfUnreadMs: noOfUnreadMsg
				});
			});

		});

		this.conversation.on('typingStarted', (message) => {
			this.membersTyping = [...this.membersTyping, message];
			this.typingUsers.next(this.whosTyping());
		});

		this.conversation.on('typingEnded', (message) => {
			const mIdx = this.membersTyping.findIndex(mem => mem.identity === message.identity);
            this.membersTyping = this.membersTyping.splice(mIdx, 0);
			this.typingUsers.next(this.whosTyping());
		});

	}

	uninitialize() {
		this.conversation.removeAllListeners('messageAdded');
		this.conversation.removeAllListeners('typingStarted');
		this.conversation.removeAllListeners('typingEnded');
	}

	whosTyping() {
		return this.membersTyping.map(m => {
			if (m.identity !== this.currentUsername) {
				return m.identity;
			}
		}).join(', ');
	}

	iamTyping() {
        this.conversation.typing();
    }

	async getMembers() {
        return await this.conversation.getParticipants();
    }

    async getMembersCount() {
        return await this.conversation.getParticipantsCount();
    }

    async getMessages() {
        return await this.conversation.getMessages(50);
    }

    async getPreviousPageMessages(lastIndex: number) {
        return await this.conversation.getMessages(50, lastIndex);
    }

    async getParticipantsInfo() {
        return await this.conversation.getParticipants();
    }

	async sendMessage(message: string, attributes: object) {
        //await this.channel.messages(message, attributes);
        const messageAttributes = attributes as JSONValue;
        console.log('messageAttributes:', messageAttributes);
        await this.conversation.sendMessage(message, messageAttributes);
    }

	// Mark all messages read
	async markAllMessageRead() {
        await this.conversation.setAllMessagesRead();
    }

	// Mark all messages Unread
	async markAllMessageUnread() {
		await this.conversation.setAllMessagesUnread();
    }


}
