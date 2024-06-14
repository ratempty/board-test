import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/users/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { userInfo } from 'os';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiTags('COMMENT')
@Controller('post/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: '댓글 생성', description: '댓글을 작성합니다.' })
  @Post()
  async createComment(
    @Body('content') content: string,
    @UserInfo() user: User,
    @Param('postId') postId: number,
  ) {
    if (!content) {
      throw new BadRequestException('댓글 내용을 작성해주세요');
    }
    return await this.commentsService.createComment(postId, content, user);
  }

  @ApiOperation({ summary: '대댓글 생성', description: '대댓글을 작성합니다.' })
  @Post(':parentId')
  async createReply(
    @Param('postId') postId: number,
    @Param('parentId') parentId: number,
    @Body('content') content: string,
    @UserInfo() user: User,
  ) {
    if (!content) {
      throw new BadRequestException('댓글 내용을 작성해주세요');
    }
    return await this.commentsService.createReply(
      parentId,
      content,
      user,
      postId,
    );
  }

  @ApiOperation({
    summary: '댓글 조회',
    description: '해당 게시글의 전체 댓글을 조회합니다.',
  })
  @Get()
  async getComments(@Param('postId') postId: number, @UserInfo() user: User) {
    return await this.commentsService.getComments(postId, user);
  }

  @ApiOperation({
    summary: '댓글 수정',
    description: '해당 댓글을 수정합니다.',
  })
  @Patch(':commentId')
  async updateComment(
    @Param('commentId') commentId: number,
    @Body('content') content: string,
    @UserInfo() user: User,
  ) {
    if (!content) {
      throw new BadRequestException('댓글 내용을 작성해주세요');
    }
    return await this.commentsService.updateComment(commentId, content, user);
  }

  @ApiOperation({
    summary: '댓글 삭제',
    description: '해당 댓글을 삭제합니다.',
  })
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: number,
    @UserInfo() user: User,
  ) {
    return await this.commentsService.deleteComment(commentId, user);
  }
}
