import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../users/types/userRole.type';
import { User } from '../users/entities/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostCategory } from '../posts/types/post.type';

describe('CommentsService', () => {
  let commentService: CommentsService;
  let commentRepositoryMock: Partial<
    Record<keyof Repository<Comment>, jest.Mock>
  >;
  let postRepositoryMock: Partial<Record<keyof Repository<Post>, jest.Mock>>;

  beforeEach(async () => {
    commentRepositoryMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    postRepositoryMock = {
      findOne: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: 'CommentRepository',
          useValue: commentRepositoryMock,
        },
        {
          provide: 'PostRepository',
          useValue: postRepositoryMock,
        },
      ],
    }).compile();

    commentService = moduleRef.get<CommentsService>(CommentsService);
  });

  it('create comment success', async () => {
    const postId = 1;
    const content = 'test내용';
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
    const resultMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 1,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
    };

    commentRepositoryMock.save.mockResolvedValue(resultMock);

    const result = await commentService.createComment(postId, content, user);

    expect(result).toEqual(resultMock);
  });

  it('create reply success', async () => {
    const parentCommentId = 1;
    const content = 'test 내용';
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
    const postId = 2;
    const parentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 1,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
    };
    const resultMock = {
      content: 'test 내용',
      userNickname: 'tester',
      postId: '2',
      userId: 1,
      parentCommentId: 1,
      id: 2,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
    };

    commentRepositoryMock.findOne.mockResolvedValue(parentMock);
    commentRepositoryMock.findOneBy.mockResolvedValue(null);
    commentRepositoryMock.save.mockResolvedValue(resultMock);

    const result = await commentService.createReply(
      parentCommentId,
      content,
      user,
      postId,
    );

    expect(result).toEqual(resultMock);
  });

  it('create reply failed not found exception', async () => {
    const parentCommentId = 1;
    const content = 'test 내용';
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
    const postId = 2;

    commentRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      commentService.createReply(parentCommentId, content, user, postId),
    ).rejects.toThrow(NotFoundException);
  });

  it('create reply failed bad request exception', async () => {
    const parentCommentId = 1;
    const content = 'test 내용';
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
    const postId = 2;
    const parentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 1,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
    };

    commentRepositoryMock.findOne.mockResolvedValue(parentMock);
    commentRepositoryMock.findOneBy.mockResolvedValue({});

    await expect(
      commentService.createReply(parentCommentId, content, user, postId),
    ).rejects.toThrow(BadRequestException);
  });

  it('get all comments success', async () => {
    const postId = 1;
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
    const commentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 1,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
      replies: [],
    };
    const postMock: Post = {
      id: 1,
      title: 'test title',
      content: 'test content',
      category: PostCategory.Notice,
      viewCnt: 1,
      imgUrl: ['www.naver.com'],
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      userNickname: 'rate',
      user: user,
      comment: [],
    };

    postRepositoryMock.findOne.mockResolvedValue(postMock);
    commentRepositoryMock.find.mockResolvedValue([commentMock]);

    const result = await commentService.getComments(postId, user);

    expect(result).toEqual([commentMock]);
  });

  it('get all comment not found exception', async () => {
    const postId = 1;
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

    postRepositoryMock.findOne.mockResolvedValue(null);

    await expect(commentService.getComments(postId, user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('get all comment forbidden exception with different userId', async () => {
    const postId = 1;
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
    const postMock: Post = {
      id: postId,
      title: 'test title',
      content: 'test content',
      category: PostCategory.Inquiry,
      viewCnt: 1,
      imgUrl: ['www.naver.com'],
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 2,
      userNickname: 'rate',
      user: user,
      comment: [],
    };

    postRepositoryMock.findOne.mockResolvedValue(postMock);

    await expect(commentService.getComments(postId, user)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('get all comment forbidden exception with not admin ', async () => {
    const postId = 1;
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
    const postMock: Post = {
      id: postId,
      title: 'test title',
      content: 'test content',
      category: PostCategory.Inquiry,
      viewCnt: 1,
      imgUrl: ['www.naver.com'],
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 2,
      userNickname: 'rate',
      user: user,
      comment: [],
    };
    postRepositoryMock.findOne.mockResolvedValue(postMock);

    await expect(commentService.getComments(postId, user)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('get all comments with deleted comments', async () => {
    const postId = 1;
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

    const postMock: Post = {
      id: 1,
      title: 'test title',
      content: 'test content',
      category: PostCategory.Notice,
      viewCnt: 1,
      imgUrl: ['www.naver.com'],
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      userNickname: 'rate',
      user: user,
      comment: [],
    };

    const commentsMock = [
      {
        id: 1,
        content: 'First comment',
        userNickname: 'tester',
        postId: 1,
        userId: 1,
        parentCommentId: null,
        isDelete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      },
      {
        id: 2,
        content: 'Second comment',
        userNickname: 'tester',
        postId: 1,
        userId: 1,
        parentCommentId: null,
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      },
    ];

    postRepositoryMock.findOne.mockResolvedValue(postMock);
    commentRepositoryMock.find.mockResolvedValue(commentsMock);

    const result = await commentService.getComments(postId, user);

    expect(result).toEqual([
      {
        ...commentsMock[0],
        content: '삭제된 댓글입니다.',
      },
      commentsMock[1],
    ]);
  });

  it('update comment success', async () => {
    const commentId = 1;
    const content = 'test';
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
    const commentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 1,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
      replies: [],
    };

    const updatedCommentMock = {
      ...commentMock,
      content: 'test',
    };

    commentRepositoryMock.findOne.mockResolvedValueOnce(commentMock);
    commentRepositoryMock.update.mockResolvedValue(null);
    commentRepositoryMock.findOne.mockResolvedValueOnce(updatedCommentMock);

    const result = await commentService.updateComment(commentId, content, user);

    expect(result).toEqual({ message: '댓글이 수정되었습니다.' });
  });

  it('update comment not found exception', async () => {
    const commentId = 1;
    const content = 'test';
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

    commentRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      commentService.updateComment(commentId, content, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('update comment ForbiddenException', async () => {
    const commentId = 1;
    const content = 'test';
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
    const commentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 2,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
      replies: [],
    };

    commentRepositoryMock.findOne.mockResolvedValue(commentMock);

    await expect(
      commentService.updateComment(commentId, content, user),
    ).rejects.toThrow(ForbiddenException);
  });

  it('delete comment success', async () => {
    const commentId = 1;
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
    const commentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 1,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
      replies: [],
    };

    commentRepositoryMock.findOne.mockResolvedValue(commentMock);
    commentRepositoryMock.update.mockResolvedValue(null);

    const result = await commentService.deleteComment(commentId, user);

    expect(result).toEqual({ message: '댓글이 삭제 되었습니다.' });
    expect(commentRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: commentId, isDelete: false },
    });
    expect(commentRepositoryMock.update).toHaveBeenCalledWith(
      { id: commentId },
      { isDelete: true },
    );
  });

  it('delete comment failed not found exception', async () => {
    const commentId = 1;
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

    commentRepositoryMock.findOne.mockResolvedValue(null);

    await expect(commentService.deleteComment(commentId, user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('delete comment failed ForbiddenException with different userId', async () => {
    const commentId = 1;
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
    const commentMock = {
      content: 'test내용',
      userNickname: 'tester',
      postId: '1',
      userId: 2,
      parentCommentId: null,
      id: 1,
      createdAt: '2024-06-14T06:46:47.230Z',
      updatedAt: '2024-06-14T06:46:47.230Z',
      isDelete: false,
      replies: [],
    };

    commentRepositoryMock.findOne.mockResolvedValue(commentMock);

    await expect(commentService.deleteComment(commentId, user)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
