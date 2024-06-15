import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  @ApiProperty({
    example: 'song123@gmail.com',
    description: '이메일',
    required: true,
  })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @ApiProperty({
    example: '123456',
    description: '비밀번호',
    required: true,
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;
}
