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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { PostCategory } from './types/post.type';
import { Role } from '../users/types/userRole.type';
import { User } from '../users/entities/user.entity';
import { UserInfo } from '../users/utils/userInfo.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';

@UseGuards(AuthGuard('jwt'))
@ApiTags('POST')
@ApiBearerAuth()
@Controller('post')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({
    summary: '글 검색',
    description: '게시글을 검색합니다.',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: '검색할 단어',
  })
  @ApiQuery({
    name: 'target',
    required: false,
    type: String,
    description: '검색 대상 (title 또는 user)',
  })
  @Get('search')
  async searchPosts(
    @Query('query') query: string,
    @Query('target') target: string,
    @UserInfo() user: User,
  ) {
    return await this.postsService.searchPosts(query, user, target);
  }

  @ApiOperation({
    summary: '게시글 조회',
    description:
      '게시글을 카테고리 별로 조회합니다. category에는 1:1문의,Q&A,공지사항만 입력할 수 있습니다.',
  })
  @ApiQuery({
    name: 'orderBy',
    required: true,
    type: String,
    description: '정렬 방식 선택 (popular 또는 recent)',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    description: '정렬 기간 선택 (week,month,year 중 한가지)',
  })
  @Get('category/:category')
  async getAllPost(
    @Param('category') category: PostCategory,
    @Query('orderBy') orderBy: string,
    @Query('period') period: string,
    @UserInfo() user: User,
  ) {
    return await this.postsService.getAllPost(category, orderBy, period, user);
  }

  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '게시글을 선택해서 조회합니다.조회수가 증가됩니다.',
  })
  @Get(':postId')
  async getPost(@Param('postId') postId: number, @UserInfo() user: User) {
    return await this.postsService.getPost(postId, user.id);
  }

  @ApiOperation({ summary: '게시글 생성', description: '게시글을 생성합니다.' })
  @UseInterceptors(FilesInterceptor('file', 5))
  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UserInfo() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (
      createPostDto.category === PostCategory.Notice &&
      user.role !== Role.Admin
    ) {
      throw new ForbiddenException('공지사항은 관리자만 생성 가능합니다.');
    }

    const imgurl = [];
    await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const key = await this.s3Service.uploadImage(file);
        imgurl.push(key);
      }),
    );

    return createPostDto.category === PostCategory.Notice
      ? await this.postsService.createNotice(
          createPostDto.title,
          createPostDto.content,
          createPostDto.category,
          user,
          imgurl,
        )
      : await this.postsService.createPost(
          createPostDto.title,
          createPostDto.content,
          createPostDto.category,
          user,
          imgurl,
        );
  }

  @ApiOperation({
    summary: '게시글 수정',
    description: '해당 게시글을 수정합니다.',
  })
  @UseInterceptors(FilesInterceptor('file', 5))
  @Patch(':postId/category/:category')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @UserInfo() user: User,
    @Param('postId') postId: number,
    @Param('category') category: PostCategory,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (category === PostCategory.Notice && user.role !== Role.Admin) {
      throw new ForbiddenException('공지사항은 관리자만 수정 가능합니다.');
    }

    const imgurl = [];
    await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const key = await this.s3Service.uploadImage(file);
        imgurl.push(key);
      }),
    );

    return category === PostCategory.Notice
      ? await this.postsService.updateNotice(
          updatePostDto.title,
          updatePostDto.content,
          postId,
          imgurl,
        )
      : await this.postsService.updatePost(
          updatePostDto.title,
          updatePostDto.content,
          postId,
          user,
          imgurl,
        );
  }

  @ApiOperation({
    summary: '게시글 삭제',
    description: '해당 게시글을 삭제합니다.',
  })
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
      : await this.postsService.deletePost(postId, user);
  }
}
