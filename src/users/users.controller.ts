import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원 정보 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:userId')
  async findUser(@Param('userId') userId: number): Promise<User> {
    return await this.usersService.findUser(userId);
  }

  // 회원가입
  @Post('register')
  async register(@Body() RegisterDto: RegisterDto) {
    return await this.usersService.register(
      RegisterDto.email,
      RegisterDto.password,
      RegisterDto.passwordConfirm,
      RegisterDto.nickname,
    );
  }

  // 로그인
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, accessToken, refreshToken } = await this.usersService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('Authorization', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return accessToken;
  }

  // 로그아웃
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('Authorization', '', {
      httpOnly: true,
      expires: new Date(Date.now() - 1),
    });
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(Date.now() - 1),
    });

    return { message: '로그아웃되었습니다.' };
  }

  // 회원 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:userId')
  async updateUser(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(
      userId,
      updateUserDto,
    );

    if (!updatedUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return updatedUser;
  }

  // 회원탈퇴
  @Delete('delete/:userId')
  async deleteUser(@Param('userId') userId: number) {
    await this.usersService.deleteUser(userId);
  }
}
