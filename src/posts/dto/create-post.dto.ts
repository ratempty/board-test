import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PostCategory } from '../types/post.type';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요' })
  content: string;

  @IsEnum(PostCategory, { message: '올바른 카테고리 값을 입력해주세요' })
  @IsNotEmpty({ message: '분류를 입력해주세요' })
  category: PostCategory;
}
