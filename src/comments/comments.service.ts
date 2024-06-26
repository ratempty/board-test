import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { Role } from '../users/types/userRole.type';
import { PostCategory } from '../posts/types/post.type';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  // 댓글 생성
  async createComment(postId: number, content: string, user: User) {
    const newComment = await this.commentRepository.save({
      content,
      userNickname: user.nickname,
      postId,
      userId: user.id,
    });

    return newComment;
  }

  // 대댓글 생성
  async createReply(
    parentCommentId: number,
    content: string,
    user: User,
    postId: number,
  ) {
    const parentComment = await this.commentRepository.findOne({
      where: { id: parentCommentId, isDelete: false },
    });

    if (!parentComment) {
      throw new NotFoundException('대상 댓글을 찾을 수 없습니다.');
    }

    const reply = await this.commentRepository.findOneBy({
      parentCommentId,
    });

    if (reply) {
      throw new BadRequestException('잘못된 접근입니다.');
    }

    const newReply = await this.commentRepository.save({
      content,
      userNickname: user.nickname,
      postId,
      parentComment,
      userId: user.id,
    });
    return newReply;
  }

  // 댓글 조회
  async getComments(postId: number, user: User) {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.category === PostCategory.Inquiry) {
      if (post.userId !== user.id && user.role !== Role.Admin) {
        throw new ForbiddenException('글을 확인할 권한이 없습니다.');
      }
    }

    const comments = await this.commentRepository.find({
      where: { postId, parentComment: null },
      order: { createdAt: 'ASC' },
    });

    comments.forEach((comment) => {
      if (comment.isDelete) {
        comment.content = '삭제된 댓글입니다.';
      }
    });

    return comments;
  }

  // 댓글 수정
  async updateComment(commentId: number, content: string, user: User) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDelete: false },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== user.id) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    await this.commentRepository.update({ id: commentId }, { content });

    await this.commentRepository.findOne({
      where: { id: commentId, isDelete: false },
    });

    return { message: '댓글이 수정되었습니다.' };
  }

  // 댓글 삭제
  async deleteComment(commentId: number, user: User) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDelete: false },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (user.role !== Role.Admin && comment.userId !== user.id) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }

    await this.commentRepository.update({ id: commentId }, { isDelete: true });

    return { message: '댓글이 삭제 되었습니다.' };
  }
}
