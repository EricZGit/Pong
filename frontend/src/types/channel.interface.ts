export interface ChannelInterface {
    ID: number;
    canDirectTalk: boolean;
    name: string;
    menbers: UserInterface[];
    type: "public" | "private" | "direct";
    messages: MessageInterface[];
    password: string | null;
    isProtected: boolean;
    IDowner: number;
    nameowner: string;
    direct: DirectInterface[];
    admin: number;
    isbanned: boolean;
    listBlocked: string[];
    nom: string;
}

export interface UserInterface {
    ID: number;
    nom: string;
    status: string;
    is_admin: boolean;
    is_muted: boolean;
    is_banned: boolean;
    is_owner: boolean;
    time_mute: Date;
    time_ban: Date;
}

export interface MessageInterface {
	ID: number,
	nom: string,
	message: string,
    date?: Date | string,
};

export interface DirectInterface {
    // id du chat
    IDchat: number,
    // nom du salon  nom de l'utilisateur visé
    nom: string,
    // id de l'utilisateur visé
    IDuser: number,
}