import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PostCategory } from '../types/post.type';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @IsString()
  @ApiProperty({
    example: '예시 글 제목입니다.',
    description: '게시글 제목',
  })
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  title: string;

  @IsString()
  @ApiProperty({
    example: '예시 글 내용입니다.',
    description: '게시글 내용',
  })
  @IsNotEmpty({ message: '내용을 입력해주세요' })
  content: string;

  @IsEnum(PostCategory, { message: '올바른 카테고리 값을 입력해주세요' })
  @ApiProperty({
    example: '공지사항',
    description: '공지사항,Q&A,1:1문의',
  })
  @IsNotEmpty({ message: '분류를 입력해주세요' })
  category: PostCategory;
}
