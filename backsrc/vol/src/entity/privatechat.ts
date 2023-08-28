import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class privatechat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    iduser1: number;

    @Column()
    iduser2: number;
}
