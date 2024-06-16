import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Role } from '../users/types/userRole.type';
import { PostCategory } from './types/post.type';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Comment } from '../comments/entities/comment.entity';

describe('PostsService', () => {
  let postService: PostsService;
  let postRepositoryMock: Partial<Record<keyof Repository<Post>, jest.Mock>>;
  let userRepositoryMock: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let commentRepositoryMock: Partial<
    Record<keyof Repository<Comment>, jest.Mock>
  >;
  let cacheManagerMock: Partial<Record<keyof Cache, jest.Mock>>;

  beforeEach(async () => {
    postRepositoryMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findOneBy: jest.fn(),
    };

    commentRepositoryMock = {
      find: jest.fn(),
      update: jest.fn(),
    };

    userRepositoryMock = {
      findOne: jest.fn(),
    };

    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: 'PostRepository',
          useValue: postRepositoryMock,
        },
        {
          provide: 'UserRepository',
          useValue: userRepositoryMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        {
          provide: 'CommentRepository',
          useValue: commentRepositoryMock,
        },
      ],
    }).compile();

    postService = moduleRef.get<PostsService>(PostsService);
  });

  it('bring all posts with popular and week', async () => {
    const orderBy = 'popular';
    const period = 'week';
    const category = PostCategory.Notice;
    const mockPost = [
      {
        id: 1,
        title: '테스트 글 작성',
        content: 'comet',
        category: '공지사항',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:00:38.755Z',
        updatedAt: '2024-06-13T22:01:28.000Z',
        userId: 1,
        userNickname: 'abc',
      },
      {
        id: 2,
        title: '테스트 글',
        content: 'comet',
        category: '공지사항',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 7,
        userNickname: '공지사항',
      },
    ];
    const user: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.getAllPost(
      category,
      orderBy,
      period,
      user,
    );

    expect(result).toEqual(mockPost);
  });

  it('bring all posts with recent and month', async () => {
    const orderBy = 'recent';
    const period = 'month';
    const category = PostCategory.Notice;
    const mockPost = [
      {
        id: 1,
        title: '테스트 글 작성',
        content: 'comet',
        category: '공지사항',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-14T22:00:38.755Z',
        updatedAt: '2024-06-14T22:01:28.000Z',
        userId: 1,
        userNickname: 'abc',
      },
      {
        id: 2,
        title: '테스트 글',
        content: 'comet',
        category: '공지사항',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 7,
        userNickname: '공지사항',
      },
    ];
    const user: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.getAllPost(
      category,
      orderBy,
      period,
      user,
    );

    expect(result).toEqual(mockPost);
  });

  it('bring all posts with popular and month', async () => {
    const orderBy = 'popular';
    const period = 'month';
    const category = PostCategory.Notice;
    const mockPost = [
      {
        id: 1,
        title: '테스트 글 작성',
        content: 'comet',
        category: '공지사항',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-14T22:00:38.755Z',
        updatedAt: '2024-06-14T22:01:28.000Z',
        userId: 1,
        userNickname: 'abc',
      },
      {
        id: 2,
        title: '테스트 글',
        content: 'comet',
        category: '공지사항',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 7,
        userNickname: '공지사항',
      },
    ];
    const user: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.getAllPost(
      category,
      orderBy,
      period,
      user,
    );

    expect(result).toEqual(mockPost);
  });

  it('bring all posts with popular and year', async () => {
    const orderBy = 'popular';
    const period = 'year';
    const category = PostCategory.QNA;
    const mockPost = [
      {
        id: 1,
        title: '테스트 글 작성',
        content: 'comet',
        category: 'Q&A',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-14T22:00:38.755Z',
        updatedAt: '2024-06-14T22:01:28.000Z',
        userId: 1,
        userNickname: 'abc',
      },
      {
        id: 2,
        title: '테스트 글',
        content: 'comet',
        category: 'Q&A',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 7,
        userNickname: '공지사항',
      },
    ];
    const user: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.getAllPost(
      category,
      orderBy,
      period,
      user,
    );

    expect(result).toEqual(mockPost);
  });

  it('bring all posts with my inquiry', async () => {
    const orderBy = 'popular';
    const period = 'year';
    const category = PostCategory.Inquiry;
    const mockPost = [
      {
        id: 1,
        title: '테스트 글 작성',
        content: 'comet',
        category: '1:1문의',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-14T22:00:38.755Z',
        updatedAt: '2024-06-14T22:01:28.000Z',
        userId: 1,
        userNickname: 'abc',
      },
      {
        id: 2,
        title: '테스트 글',
        content: 'comet',
        category: '1:1문의',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 1,
        userNickname: '공지사항',
      },
    ];
    const user: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.getAllPost(
      category,
      orderBy,
      period,
      user,
    );

    expect(result).toEqual(mockPost);
  });

  it('bring target post', async () => {
    const postId = 1;
    const userId = 1;
    const mockPost = {
      id: 1,
      title: '테스트 글 작성',
      content: 'comet',
      category: 'Q&A',
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'abc',
    };
    const updatedPost = {
      id: 1,
      title: '테스트 글 작성',
      content: 'comet',
      category: 'Q&A',
      viewCnt: 3,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'abc',
    };
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    userRepositoryMock.findOne.mockResolvedValue(mockUser);
    postRepositoryMock.findOneBy.mockResolvedValue(updatedPost);

    const result = await postService.getPost(postId, userId);
    expect(result).toEqual(updatedPost);
  });

  it('can not find post', async () => {
    const postId = 1;
    const userId = 1;

    postRepositoryMock.findOne.mockResolvedValue(null);

    await expect(postService.getPost(postId, userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('can not find user', async () => {
    const postId = 1;
    const userId = 1;
    const mockPost = {
      id: 1,
      title: '테스트 글 작성',
      content: 'comet',
      category: 'Q&A',
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'abc',
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    userRepositoryMock.findOne.mockResolvedValue(null);

    await expect(postService.getPost(postId, userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should forbidden exception', async () => {
    const postId = 1;
    const userId = 1;
    const mockPost = {
      id: 2,
      title: '테스트 글 작성',
      content: 'comet',
      category: '1:1문의',
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 2,
      userNickname: 'abc',
    };
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    userRepositoryMock.findOne.mockResolvedValue(mockUser);

    await expect(postService.getPost(postId, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('search post success target title', async () => {
    const query = 'test';
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const target = 'title';
    const mockPost = [
      {
        id: 1,
        title: 'test',
        content: 'comet',
        category: '공지사항',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:00:38.755Z',
        updatedAt: '2024-06-13T22:01:28.000Z',
        userId: 1,
        userNickname: 'abc',
      },
      {
        id: 2,
        title: 'test 글',
        content: 'comet',
        category: '공지사항',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 7,
        userNickname: '공지사항',
      },
    ];

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.searchPosts(query, mockUser, target);
    expect(result).toEqual(mockPost);
  });

  it('search post success target user', async () => {
    const query = 'a';
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const target = 'user';
    const mockPost = [
      {
        id: 1,
        title: 'test',
        content: 'comet',
        category: '공지사항',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:00:38.755Z',
        updatedAt: '2024-06-13T22:01:28.000Z',
        userId: 1,
        userNickname: 'aaa',
      },
      {
        id: 2,
        title: 'test 글',
        content: 'comet',
        category: '공지사항',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 7,
        userNickname: 'aaa2',
      },
    ];

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.searchPosts(query, mockUser, target);
    expect(result).toEqual(mockPost);
  });

  it('search inquiry post ', async () => {
    const query = 'a';
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const target = 'user';
    const mockPost = [
      {
        id: 1,
        title: 'test',
        content: 'comet',
        category: '1:1문의',
        viewCnt: 2,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:00:38.755Z',
        updatedAt: '2024-06-13T22:01:28.000Z',
        userId: 1,
        userNickname: 'aaa',
      },
      {
        id: 2,
        title: 'test 글',
        content: 'comet',
        category: 'Q&A',
        viewCnt: 1,
        imgUrl: null,
        isDelete: false,
        createdAt: '2024-06-13T22:04:30.967Z',
        updatedAt: '2024-06-13T22:16:46.000Z',
        userId: 1,
        userNickname: 'aaa2',
      },
    ];

    postRepositoryMock.find.mockResolvedValue(mockPost);

    const result = await postService.searchPosts(query, mockUser, target);
    expect(result).toEqual(mockPost);
  });

  it('create notice success', async () => {
    const title = 'test공지';
    const content = 'test 내용';
    const category = PostCategory.Notice;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.Admin,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.save.mockResolvedValue({});

    await postService.createNotice(title, content, category, mockUser);

    expect(postRepositoryMock.save).toHaveBeenCalledWith({
      title,
      content,
      category,
      userId: mockUser.id,
      userNickname: mockUser.nickname,
    });
  });

  it('create post success', async () => {
    const title = 'test 제목';
    const content = 'test 내용';
    const category = PostCategory.QNA;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.save.mockResolvedValue({});

    await postService.createPost(title, content, category, mockUser);

    expect(postRepositoryMock.save).toHaveBeenCalledWith({
      title,
      content,
      category,
      userId: mockUser.id,
      userNickname: mockUser.nickname,
    });
  });

  it('notice update success', async () => {
    const title = 'update title';
    const content = 'updated content';
    const postId = 1;
    const mockPost = {
      id: 1,
      title: 'test',
      content: 'comet',
      category: PostCategory.Notice,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'aaa',
    };
    const updatePost = {
      id: 1,
      title: 'update title',
      content: 'updated content',
      category: PostCategory.Notice,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'aaa',
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    postRepositoryMock.update.mockResolvedValue(updatePost);

    const result = await postService.updateNotice(title, content, postId);

    expect(result).toEqual({ message: '게시글이 수정되었습니다.' });
  });

  it('not found notice', async () => {
    const title = 'update title';
    const content = 'updated content';
    const postId = 1;

    postRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      postService.updateNotice(title, content, postId),
    ).rejects.toThrow(NotFoundException);
  });

  it('post update success', async () => {
    const title = 'update title';
    const content = 'updated content';
    const postId = 1;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const mockPost = {
      id: 1,
      title: 'test',
      content: 'comet',
      category: PostCategory.Inquiry,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'aaa',
    };
    const updatePost = {
      id: 1,
      title: 'update title',
      content: 'updated content',
      category: PostCategory.Inquiry,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'aaa',
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    postRepositoryMock.update.mockResolvedValue(updatePost);

    const result = await postService.updatePost(
      title,
      content,
      postId,
      mockUser,
    );

    expect(result).toEqual({ message: '게시글이 수정되었습니다.' });
  });

  it('update post not found exception', async () => {
    const title = 'update title';
    const content = 'updated content';
    const postId = 1;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      postService.updatePost(title, content, postId, mockUser),
    ).rejects.toThrow(NotFoundException);
  });

  it('update post forbidden exception', async () => {
    const title = 'update title';
    const content = 'updated content';
    const postId = 1;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const mockPost = {
      id: 1,
      title: 'test',
      content: 'comet',
      category: PostCategory.Inquiry,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 2,
      userNickname: 'aaa',
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);

    await expect(
      postService.updatePost(title, content, postId, mockUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('notice delete success', async () => {
    const postId = 1;
    const mockPost = {
      id: 1,
      title: 'test',
      content: 'comet',
      category: PostCategory.Notice,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 2,
      userNickname: 'aaa',
    };
    const commentMock = {
      content: 'test 내용',
      userNickname: 'tester',
      postId: 1,
      userId: 1,
      parentCommentId: 1,
      id: 2,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    commentRepositoryMock.find.mockResolvedValue([commentMock]);

    await postService.deleteNotice(postId);

    expect(postRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: postId, isDelete: false },
    });
    expect(postRepositoryMock.update).toHaveBeenCalledWith(
      { id: postId },
      { isDelete: true },
    );
  });

  it('delete notice not found exception', async () => {
    const postId = 1;

    postRepositoryMock.findOne.mockResolvedValue(null);

    await expect(postService.deleteNotice(postId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('delete post success', async () => {
    const postId = 1;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const mockPost = {
      id: 1,
      title: 'test',
      content: 'comet',
      category: PostCategory.Notice,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 1,
      userNickname: 'aaa',
    };
    const commentMock = {
      content: 'test 내용',
      userNickname: 'tester',
      postId: 1,
      userId: 1,
      parentCommentId: 1,
      id: 2,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);
    commentRepositoryMock.find.mockResolvedValue([commentMock]);

    await postService.deletePost(postId, mockUser);

    expect(postRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: postId, isDelete: false },
    });
    expect(postRepositoryMock.update).toHaveBeenCalledWith(
      { id: postId },
      { isDelete: true },
    );
  });

  it('delete post failed not found exception', async () => {
    const postId = 1;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };

    postRepositoryMock.findOne.mockResolvedValue(null);

    await expect(postService.deletePost(postId, mockUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('delete post failed forbidden exception', async () => {
    const postId = 1;
    const mockUser: User = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date(),
      post: [],
      comment: [],
    };
    const mockPost = {
      id: 1,
      title: 'test',
      content: 'comet',
      category: PostCategory.Notice,
      viewCnt: 2,
      imgUrl: null,
      isDelete: false,
      createdAt: '2024-06-13T22:00:38.755Z',
      updatedAt: '2024-06-13T22:01:28.000Z',
      userId: 2,
      userNickname: 'aaa',
    };

    postRepositoryMock.findOne.mockResolvedValue(mockPost);

    await expect(postService.deletePost(postId, mockUser)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
