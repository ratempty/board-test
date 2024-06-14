import { Injectable } from '@nestjs/common';
import * as aws from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly s3: aws.S3;

  constructor() {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_KEY } = process.env;

    aws.config.update({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });
    this.s3 = new aws.S3();
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const key = `${Date.now()}_${file.originalname}`;
    const params: aws.S3.PutObjectRequest = {
      Bucket: process.env.S3_BUCKET_NAME,
      ACL: 'private',
      Key: key,
      Body: file.buffer,
    };

    try {
      await this.s3.putObject(params).promise();
      return `https://${process.env.S3_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}
