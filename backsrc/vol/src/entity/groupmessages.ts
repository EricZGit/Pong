import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class groupmessages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iduser : number;

  @Column()
  idgroupchat : number;

  @Column()
  content : string;

  @Column()
  date : Date;
}
