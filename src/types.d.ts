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


export interface IUserInfo {
    ok:   boolean;
    user: User;
}

export interface User {
    id:                  string;
    team_id:             string;
    name:                string;
    deleted:             boolean;
    color:               string;
    real_name:           string;
    tz:                  string;
    tz_label:            string;
    tz_offset:           number;
    profile:             { [key: string]: string };
    is_admin:            boolean;
    is_owner:            boolean;
    is_primary_owner:    boolean;
    is_restricted:       boolean;
    is_ultra_restricted: boolean;
    is_bot:              boolean;
    updated:             number;
    is_app_user:         boolean;
    has_2fa:             boolean;
}