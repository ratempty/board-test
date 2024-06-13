import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsString({ message: '제목을 입력해주세요' })
  title: string;

  @IsOptional()
  @IsString({ message: '내용을 입력해주세요' })
  content: string;
}
