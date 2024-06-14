import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  //회원가입
  async register(
    email: string,
    password: string,
    passwordConfirm: string,
    nickname: string,
  ) {
    // 중복 이메일 확인
    const existEmail = await this.findByEmail(email);

    if (existEmail) {
      throw new ConflictException('해당 이메일은 사용할 수 없습니다.');
    }

    // 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 10);

    // 정보 저장
    await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
    });
  }

  // 로그인
  async login(email: string, password: string) {
    //이메일로 사용자 찾기
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('아이디 또는 비밀번호 오류입니다.');
    }

    // Access Token 및 Refresh Token 생성
    const accessTokenPayload = { email, sub: user.id, token_type: 'access' };
    const refreshTokenPayload = { email, sub: user.id, token_type: 'refresh' };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '60m',
    });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '1d',
    });

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }

  // 회원정보조회
  async findUser(userId: number) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'nickname'],
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
    }

    return user;
  }
  // 회원정보수정
  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.findOneBy({ id: user.id });

    const hashedPassword = await hash(updateUserDto.password, 10);

    await this.userRepository.update(
      { id: user.id },
      {
        email: updateUserDto.email,
        nickname: updateUserDto.nickname,
        password: hashedPassword,
      },
    );

    return await this.userRepository.findOne({
      select: ['id', 'email', 'nickname'],
      where: { id: user.id },
    });
  }

  // 회원탈퇴
  async deleteUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.userRepository.delete({ id: userId });
  }

  // 이메일 사용자 찾기
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
}
