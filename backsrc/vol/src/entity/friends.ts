import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class friends {
  @PrimaryColumn()
  iduser: number;

  @PrimaryColumn()
  idfriend: number;
}
