import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'comments',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar' })
  userNickname: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  postId: number;

  @Column({ type: 'int', nullable: true, unique: true })
  parentCommentId: number;

  @Column({ default: false })
  isDelete: boolean;

  @ManyToOne(() => User, (user) => user.comment, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comment, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  parentComment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];
}
