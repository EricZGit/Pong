import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class groupchat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  owner: number;

  @Column()
  pass : string;
}
