import { Max, Min } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  ALL = 'all',
}

@Entity('UserSetting')
export class UserSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { array: true })
  @Min(0)
  @Max(100)
  distance: number[];

  @Column('int', { array: true })
  @Min(18)
  @Max(38)
  old: number[];

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt?: Date;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn()
  user: User;
}
