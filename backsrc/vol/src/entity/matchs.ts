import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class matchs{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  winner: number;

  @Column()
  loser: number;

  @Column()
  score: string;
  
  @Column()
  date : Date;

  @Column()
  mode : string;
}
