import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @ApiProperty({
    example: '예시 글 제목입니다.',
    description: '게시글 제목',
  })
  @IsString({ message: '제목을 입력해주세요' })
  title: string;

  @IsOptional()
  @ApiProperty({
    example: '예시 글 내용입니다.',
    description: '게시글 내용',
  })
  @IsString({ message: '내용을 입력해주세요' })
  content: string;
}
