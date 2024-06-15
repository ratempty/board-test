import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({
    example: 'song123@gmail.com',
    description: '이메일',
  })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @ApiProperty({
    example: '123456',
    description: '비밀번호',
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @ApiProperty({
    example: '123456',
    description: '비밀번호',
  })
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  passwordConfirm: string;

  @IsString()
  @ApiProperty({
    example: 'rate',
    description: '닉네임',
  })
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  nickname: string;
}
