import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostCategory } from './types/post.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/types/userRole.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as moment from 'moment';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 카테고리별 게시글 조회
  async getAllPost(
    category: PostCategory,
    orderBy: string,
    period: string,
    user: User,
  ) {
    const order = orderBy === 'popular' ? 'viewCnt' : 'createdAt';
    let where = { category: category, isDelete: false };

    if (orderBy === 'popular') {
      const now = moment();
      switch (period) {
        case 'week':
          where['createdAt'] = MoreThanOrEqual(
            now.subtract(7, 'days').toDate(),
          );
          break;
        case 'month':
          where['createdAt'] = MoreThanOrEqual(
            now.subtract(1, 'month').toDate(),
          );
          break;
        case 'year':
          where['createdAt'] = MoreThanOrEqual(
            now.subtract(1, 'year').toDate(),
          );
          break;
      }
    }

    let posts = await this.postRepository.find({
      where,
      order: {
        [order]: 'DESC',
      },
    });

    if (user.role !== Role.Admin) {
      posts = posts.filter((post) => {
        if (post.category === PostCategory.Inquiry) {
          return post.userId === user.id;
        }
        return (
          post.category === PostCategory.Notice ||
          post.category === PostCategory.QNA
        );
      });
    }

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
      post.category === PostCategory.Inquiry &&
      post.userId !== userId &&
      user.role !== Role.Admin
    ) {
      throw new ForbiddenException('글을 확인할 권한이 없습니다.');
    }

    // 조회수 증가 로직
    const cacheKey = `post_${postId}_user_${userId}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (!cached) {
      await this.postRepository.update(postId, { viewCnt: post.viewCnt + 1 });

      await this.cacheManager.set(cacheKey, true, 86400);
    }

    const updatedPost = await this.postRepository.findOneBy({
      id: postId,
      isDelete: false,
    });

    return updatedPost;
  }

  // 글 검색 - 전체 (제목 + 작성자)
  async searchPosts(query: string, user: User, target?: string) {
    let where: any = [
      { title: Like(`%${query}%`), isDelete: false },
      { userNickname: Like(`%${query}%`), isDelete: false },
    ];

    if (target === 'title') {
      where = { title: Like(`%${query}%`), isDelete: false };
    } else if (target === 'user') {
      where = { userNickname: Like(`%${query}%`), isDelete: false };
    }

    let posts = await this.postRepository.find({
      where,
    });

    if (user.role !== Role.Admin) {
      posts = posts.filter((post) => {
        if (post.category == PostCategory.Inquiry) {
          return post.userId === user.id;
        }
        return (
          post.category == PostCategory.Notice ||
          post.category == PostCategory.QNA
        );
      });
    }
    return posts;
  }

  //공지사항 생성
  async createNotice(
    title: string,
    content: string,
    category: PostCategory,
    user: User,
    imgUrl?: string[],
  ) {
    await this.postRepository.save({
      title,
      content,
      category,
      userId: user.id,
      userNickname: user.nickname,
      imgUrl,
    });
  }

  //Q&A or 1:1 생성
  async createPost(
    title: string,
    content: string,
    category: PostCategory,
    user: User,
    imgUrl?: string[],
  ) {
    await this.postRepository.save({
      title,
      content,
      category,
      userId: user.id,
      userNickname: user.nickname,
      imgUrl,
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
  async updatePost(title: string, content: string, postId: number, user: User) {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.userId !== user.id) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }

    const updatedPost = await this.postRepository.update(
      { id: postId },
      { title, content },
    );

    return updatedPost;
  }

  //공지사항 삭제
  async deleteNotice(postId: number) {
    const notice = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!notice) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.postRepository.update({ id: postId }, { isDelete: true });
  }

  //Q&A or 1:1 삭제
  async deletePost(postId: number, user: User) {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDelete: false },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.userId !== user.id) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }

    await this.postRepository.update({ id: postId }, { isDelete: true });
  }
}
