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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from './utils/userInfo.decorator';

@ApiTags('USER')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: '회원 정보 조회',
    description: '유저 정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:userId')
  async findUser(@Param('userId') userId: number): Promise<User> {
    return await this.usersService.findUser(userId);
  }

  @ApiOperation({
    summary: '회원 가입',
    description: 'user 정보를 추가합니다.',
  })
  @Post('register')
  async register(@Body() RegisterDto: RegisterDto) {
    return await this.usersService.register(
      RegisterDto.email,
      RegisterDto.password,
      RegisterDto.passwordConfirm,
      RegisterDto.nickname,
    );
  }

  @ApiOperation({
    summary: '로그인',
    description: '로그인을 진행합니다.',
  })
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

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃 요청시 토큰을 만료시킵니다.',
  })
  @ApiBearerAuth()
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

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '회원 정보 수정',
    description: '회원 정보를 업데이트합니다.',
  })
  @ApiBearerAuth()
  @Patch('update')
  async updateUser(
    @UserInfo() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(user, updateUserDto);

    return updatedUser;
  }

  @ApiOperation({
    summary: '회원탈퇴',
    description: '회원정보를 삭제합니다.',
  })
  @Delete('delete/:userId')
  async deleteUser(@Param('userId') userId: number) {
    await this.usersService.deleteUser(userId);
  }
}
