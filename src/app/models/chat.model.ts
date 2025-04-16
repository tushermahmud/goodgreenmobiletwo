import { Message } from '@twilio/conversations';

export interface TokenResponse {
    token: string;
    identity: string;
}


export interface MessageMetaObj {
    date: Date;
    id?: string;
    name: any;
    userId: string;
    text: string;
    isReceived: boolean;
    image: string;
    firstMessageOfTheDay: boolean;
    isNew: boolean;
    msgDate: string;
}

export interface UnreadMessageInfo {
    channelName: string;
    id: string;
    noOfUnreadMs: number;
    message: Message;
}
