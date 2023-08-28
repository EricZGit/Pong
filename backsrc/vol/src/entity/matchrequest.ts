import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class matchrequest {
  @PrimaryColumn()
  idasker: number;

  @PrimaryColumn()
  idreceiver: number;

  @Column()
  accepted: boolean;

}
