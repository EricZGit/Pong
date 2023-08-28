import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class privatemsg{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idchat: number;

  @Column()
  iduser: number;
  
  @Column()
  content: string;
  
  @Column()
  date : Date;
}
