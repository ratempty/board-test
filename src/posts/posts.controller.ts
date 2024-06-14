import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { PostCategory } from './types/post.type';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/users/types/userRole.type';
import { userInfo } from 'os';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/users/utils/userInfo.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 글 검색 - 전체 (제목 + 작성자)
  @Get('search')
  async searchPosts(
    @Query('query') query: string,
    @Query('target') target: string,
  ) {
    return await this.postsService.searchPosts(query, target);
  }

  // 카테고리별 게시글 조회
  @Get('category/:category')
  async getAllPost(
    @Param('category') category: PostCategory,
    @Query('orderBy') orderBy: string,
    @Query('period') period: string,
  ) {
    return await this.postsService.getAllPost(category, orderBy, period);
  }

  // 게시글 상세 조회
  @Get(':postId')
  async getPost(@Param('postId') postId: number, @UserInfo() user: User) {
    return await this.postsService.getPost(postId, user.id);
  }

  // 게시글 생성
  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UserInfo() user: User,
  ) {
    if (
      createPostDto.category === PostCategory.Notice &&
      user.role !== Role.Admin
    ) {
      throw new ForbiddenException('공지사항은 관리자만 생성 가능합니다.');
    }

    return createPostDto.category === PostCategory.Notice
      ? await this.postsService.createNotice(
          createPostDto.title,
          createPostDto.content,
          createPostDto.category,
          user,
        )
      : await this.postsService.createPost(
          createPostDto.title,
          createPostDto.content,
          createPostDto.category,
          user,
        );
  }

  // 게시글 수정
  @Patch(':postId/category/:category')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @UserInfo() user: User,
    @Param('postId') postId: number,
    @Param('category') category: PostCategory,
  ) {
    if (category === PostCategory.Notice && user.role !== Role.Admin) {
      throw new ForbiddenException('공지사항은 관리자만 수정 가능합니다.');
    }

    return category === PostCategory.Notice
      ? await this.postsService.updateNotice(
          updatePostDto.title,
          updatePostDto.content,
          postId,
        )
      : await this.postsService.updatePost(
          updatePostDto.title,
          updatePostDto.content,
          postId,
        );
  }

  // 게시글 삭제
  @Delete(':postId/category/:category')
  async deletePost(
    @UserInfo() user: User,
    @Param('postId') postId: number,
    @Param('category') category: PostCategory,
  ) {
    if (category === PostCategory.Notice && user.role !== Role.Admin) {
      throw new ForbiddenException('공지사항은 관리자만 삭제 가능합니다.');
    }

    return category === PostCategory.Notice
      ? await this.postsService.deleteNotice(postId)
      : await this.postsService.deletePost(postId);
  }
}
