import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Post } from './entities/post.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { S3Service } from '../s3/s3.service';
import { Comment } from '../comments/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Comment]),
    CacheModule.register(),
  ],
  controllers: [PostsController],
  providers: [PostsService, S3Service],
})
export class PostsModule {}
