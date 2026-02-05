import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RefreshSession } from './refresh-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  login!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => RefreshSession, (s) => s.user)
  sessions!: RefreshSession[];
}
