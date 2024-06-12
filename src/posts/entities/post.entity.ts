import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostCategory } from '../types/post.type';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity({
  name: 'posts',
})
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: PostCategory })
  category: PostCategory;

  @Column({ type: 'int', unsigned: true, default: 0 })
  viewCnt: number;

  @Column({ type: 'varchar' })
  imgUrl: string;

  @Column({ default: false })
  isDelete: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.post)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];
}
