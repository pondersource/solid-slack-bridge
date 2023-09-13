export interface IMessage {
    client_msg_id: string;
    type:          string;
    text:          string;
    user:          string;
    ts:            string;
    blocks:        Block[];
    team:          string;
    channel:       string;
    event_ts:      string;
    channel_type:  string;
}

export interface Block {
    type:     string;
    block_id: string;
    elements: any[];
}
