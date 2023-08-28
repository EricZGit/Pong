import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class channel_members {
  @PrimaryColumn()
  idgroupchat: number;

  @PrimaryColumn()
  iduser: number;

  @Column()
  is_admin: boolean;

  @Column()
  is_banned: boolean;

  @Column()
  time_ban : Date;
  
  @Column()
  is_muted: boolean;

  @Column()
  time_mute : Date;

  @Column()
  is_kicked: boolean;
}
