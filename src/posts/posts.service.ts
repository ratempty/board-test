import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostCategory } from './types/post.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/types/userRole.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  //카테고리별 게시글 조회
  async getAllPost(category: PostCategory) {
    const posts = await this.postRepository.find({
      select: ['title', 'user', 'viewCnt', 'createdAt', 'updatedAt'],
      where: { category: category, isDelete: false },
    });

    return posts;
  }

  // 게시글 상세 조회
  async getPost(postId: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 1:1문의글 본인확인 및 관리자 확인
    if (
      post.category === PostCategory.QNA &&
      post.userId !== userId &&
      user.role !== Role.Admin
    ) {
      throw new ForbiddenException('1:1문의는 본인의 글만 확인할 수 있습니다.');
    }

    // 조회수 증가 로직
    const cacheKey = `post_${postId}_user_${userId}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (!cached) {
      post.viewCnt += 1;
      await this.postRepository.save(post);

      await this.cacheManager.set(cacheKey, true, 86400);
    }

    return post;
  }

  //공지사항 생성
  async createNotice(
    title: string,
    content: string,
    category: PostCategory,
    userId: number,
  ) {
    await this.postRepository.save({
      title,
      content,
      category,
      userId,
    });
  }

  //Q&A or 1:1 생성
  async createPost(
    title: string,
    content: string,
    category: PostCategory,
    userId: number,
  ) {
    await this.postRepository.save({
      title,
      content,
      category,
      userId,
    });
  }

  //공지사항 수정
  async updateNotice(title: string, content: string, postId: number) {
    const notice = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!notice) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const updatedNotice = await this.postRepository.update(
      { id: postId, isDelete: false },
      {
        title,
        content,
      },
    );

    return updatedNotice;
  }

  //Q&A or 1:1 수정
  async updatePost(title: string, content: string, postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const updatedPost = await this.postRepository.update(
      { id: postId },
      { title, content },
    );

    return updatedPost;
  }

  //공지사항 삭제
  async deleteNotice(postId: number) {
    const notice = await this.postRepository.findOne({ where: { id: postId } });

    if (!notice) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.postRepository.update({ id: postId }, { isDelete: true });
  }

  //Q&A or 1:1 삭제
  async deletePost(postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.postRepository.update({ id: postId }, { isDelete: true });
  }
}
