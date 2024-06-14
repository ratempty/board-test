import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({
    example: 'song123@gmail.com',
    description: '이메일',
    required: true,
  })
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @IsOptional()
  @ApiProperty({
    example: '123456',
    description: '비밀번호',
    required: true,
  })
  @IsString({ message: '비밀번호는 최소 6자 이상입니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;

  @IsOptional()
  @ApiProperty({
    example: 'rate',
    description: '닉네임',
    required: true,
  })
  @IsString({ message: '유효한 닉네임을 입력해주세요.' })
  nickname: string;
}
