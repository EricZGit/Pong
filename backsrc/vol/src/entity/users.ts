import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nom: string;

  @Column({ length: 50 })
  pass: string;

  @Column({ length: 50 })
  status: string;

  @Column({ default: "default" })
  pathtoimage: string;

  @Column()
  twofactorauth: boolean;

  @Column()
  twofactorcode: string;

  @Column()
  score: number;

  @Column()
  rank: number;
  
  @Column()
  nbofwin: number;

  @Column()
  nbofmatch: number;

  @Column()
  mail : string;

  @Column()
  winmatch : boolean;

  @Column()
  uploadavatar : boolean;

  @Column()
  addfriend : boolean;

  @Column()
  createchat : boolean;

  @Column()
  inviteplayer : boolean;

  @Column()
  login42 : string;

}
