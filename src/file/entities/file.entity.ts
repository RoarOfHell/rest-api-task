import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  originalName!: string;

  @Column()
  extension!: string;

  @Column()
  mimeType!: string;

  @Column('bigint')
  size!: number;

  @CreateDateColumn()
  uploadedAt!: Date;

  @Column()
  storageName!: string;
}
