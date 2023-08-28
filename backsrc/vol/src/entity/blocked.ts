import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class blocked {
  @PrimaryColumn()
  iduser: number;

  @PrimaryColumn()
  idblocked: number;

}
