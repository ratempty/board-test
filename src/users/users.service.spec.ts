import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest
    .fn()
    .mockImplementation((password: string, hashedPassword: string) =>
      Promise.resolve(
        password === '123123' && hashedPassword === 'hashedPassword',
      ),
    ),
}));

describe('UsersService', () => {
  let userService: UsersService;
  let userRepositoryMock: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let jwtServiceMock: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    userRepositoryMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('token'),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    userService = moduleRef.get<UsersService>(UsersService);
  });

  it('Register Success', async () => {
    const email = 'test@test.com';
    const password = 'password';
    const passwordConfirm = 'password';
    const nickname = 'testuser';

    userRepositoryMock.findOne.mockResolvedValueOnce(null);

    await userService.register(email, password, passwordConfirm, nickname);

    expect(userRepositoryMock.save).toHaveBeenCalledWith({
      email,
      password: 'hashedPassword',
      nickname,
    });

    expect(userRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('Conflict exception with exist Email', async () => {
    const existEmail = { email: 'test@test.com', id: 1, nickname: 'abc' };
    const user = {
      email: 'test@test.com',
      password: 'password',
      passwordConfirm: 'password',
      nickname: 'testuser',
    };

    userRepositoryMock.findOne.mockResolvedValue(existEmail);

    await expect(
      userService.register(
        user.email,
        user.password,
        user.password,
        user.nickname,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('Password is different that password confirm', async () => {
    const user = {
      email: 'test@test.com',
      password: 'password',
      passwordConfirm: 'password1',
      nickname: 'testuser',
    };

    await expect(
      userService.register(
        user.email,
        user.password,
        user.passwordConfirm,
        user.nickname,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('Login success', async () => {
    const loginMock = {
      email: 'test@test.com',
      password: '123123',
    };

    const user = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
    };

    userRepositoryMock.findOne.mockResolvedValue(user);
    jwtServiceMock.sign.mockResolvedValue('accessToken');

    const result = await userService.login(loginMock.email, loginMock.password);

    expect(result).toHaveProperty('accessToken');
  });

  it('Login failed', async () => {
    const loginMock = {
      email: 'test@test.com',
      password: '1231234',
    };

    userRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      userService.login(loginMock.email, loginMock.password),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Find user success', async () => {
    const userId = 1;

    const user = {
      id: 1,
      email: 'test@test.com',
      nickname: 'tester',
    };

    userRepositoryMock.findOne.mockResolvedValue(user);

    const result = await userService.findUser(userId);

    expect(result).toEqual(user);
  });

  it('Find user failed', async () => {
    const userId = 2;

    userRepositoryMock.findOne.mockResolvedValue(null);

    await expect(userService.findUser(userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Update user success', async () => {
    const updateUserDto = {
      email: 'test@test.com',
      password: '123123',
      nickname: 'tester',
    };

    const resultUser = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      nickname: 'tester',
    };

    userRepositoryMock.update.mockResolvedValue(resultUser);
    userRepositoryMock.findOne.mockResolvedValue({
      id: resultUser.id,
      email: resultUser.email,
      nickname: resultUser.nickname,
    });

    const result = await userService.updateUser(
      updateUserDto as User,
      updateUserDto,
    );

    expect(result).toEqual({
      id: resultUser.id,
      email: resultUser.email,
      nickname: resultUser.nickname,
    });
  });

  it('Update user with exist email', async () => {
    const updateUserDto = {
      email: 'test@test.com',
      password: '123123',
      nickname: 'tester',
    };

    const existUser = {
      id: 1,
      email: 'test@test.com',
      password: 'qweqwe',
      nickname: 'asd',
    };

    userRepositoryMock.findOneBy.mockResolvedValue(existUser);

    await expect(
      userService.updateUser(updateUserDto as User, updateUserDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Withdraw success', async () => {
    const userId = 1;
    const user = {
      id: 1,
      email: 'test@test.com',
      nickname: 'asd',
    };

    userRepositoryMock.findOneBy.mockResolvedValue(user);

    await userService.deleteUser(userId);

    expect(userRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: userId });
    expect(userRepositoryMock.delete).toHaveBeenCalledWith({ id: userId });
  });

  it('witdraw failed', async () => {
    const userId = 1;

    userRepositoryMock.findOneBy.mockResolvedValue(null);

    await expect(userService.deleteUser(userId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
